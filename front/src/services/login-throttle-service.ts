interface FailedAttempt {
  timestamp: number;
  attempts: number;
}

class LoginThrottleService {
  private static failedAttempts = new Map<string, FailedAttempt>();
  
  // Environment-configurable constants with secure defaults
  private static readonly MIN_DELAY = parseInt(process.env.LOGIN_THROTTLE_MIN_DELAY || '1000', 10);
  private static readonly MAX_DELAY = parseInt(process.env.LOGIN_THROTTLE_MAX_DELAY || '30000', 10);
  private static readonly MAX_TRACKED_IDENTIFIERS = parseInt(process.env.LOGIN_THROTTLE_MAX_TRACKED || '10000', 10);
  private static readonly RESET_TIME = parseInt(process.env.LOGIN_THROTTLE_RESET_TIME || '300000', 10);
  private static readonly CLEANUP_INTERVAL = parseInt(process.env.LOGIN_THROTTLE_CLEANUP_INTERVAL || '60000', 10);
  
  // Derived constants
  private static readonly MAX_ATTEMPTS = 5; // Max attempts before max delay
  private static readonly EMERGENCY_CLEANUP_THRESHOLD = Math.floor(this.MAX_TRACKED_IDENTIFIERS * 0.8); // 80% of max

  static {
    // Log configuration on startup
    console.log('🛡️ LOGIN THROTTLING CONFIG:');
    console.log(`   Min Delay: ${this.MIN_DELAY}ms`);
    console.log(`   Max Delay: ${this.MAX_DELAY}ms`);
    console.log(`   Max Tracked: ${this.MAX_TRACKED_IDENTIFIERS}`);
    console.log(`   Reset Time: ${this.RESET_TIME}ms (${this.RESET_TIME / 60000} minutes)`);
    console.log(`   Cleanup Interval: ${this.CLEANUP_INTERVAL}ms`);
    
    // Clean up old failed attempts periodically
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        this.cleanup();
      }, this.CLEANUP_INTERVAL);
    }
  }

  /**
   * Records a failed login attempt and returns the delay in milliseconds
   * @param identifier - Unique identifier for the login attempt (e.g., "classId:registro")
   * @returns Promise that resolves after the required delay
   */
  static async recordFailedAttempt(identifier: string): Promise<void> {
    // Memory protection: Check if we need cleanup before adding new entries
    if (this.failedAttempts.size >= this.EMERGENCY_CLEANUP_THRESHOLD) {
      this.emergencyCleanup();
    }

    // Memory protection: If still at max capacity, apply max delay without storing
    if (this.failedAttempts.size >= this.MAX_TRACKED_IDENTIFIERS) {
      console.warn(`🚨 MEMORY PROTECTION - Max tracked identifiers reached. Applying max delay for: ${identifier}`);
      await new Promise(resolve => setTimeout(resolve, this.MAX_DELAY));
      return;
    }

    const now = Date.now();
    const existing = this.failedAttempts.get(identifier);

    let attempts = 1;
    if (existing) {
      // Reset attempts if enough time has passed
      if (now - existing.timestamp > this.RESET_TIME) {
        attempts = 1;
      } else {
        attempts = existing.attempts + 1;
      }
    }

    // Calculate delay based on number of attempts
    const delay = Math.min(
      this.MIN_DELAY * Math.pow(2, attempts - 1),
      this.MAX_DELAY
    );

    // Store the failed attempt
    this.failedAttempts.set(identifier, {
      timestamp: now,
      attempts
    });

    console.log(`🛡️ THROTTLING - Identifier: ${identifier}, Attempts: ${attempts}, Delay: ${delay}ms`);

    // Apply the delay using a Promise-based approach that doesn't block resources
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Records a successful login attempt and clears any failed attempts
   * @param identifier - Unique identifier for the login attempt
   */
  static recordSuccessfulAttempt(identifier: string): void {
    this.failedAttempts.delete(identifier);
    console.log(`✅ THROTTLING - Cleared failed attempts for: ${identifier}`);
  }

  /**
   * Gets the current delay for an identifier without recording a new attempt
   * @param identifier - Unique identifier to check
   * @returns Current delay in milliseconds
   */
  static getCurrentDelay(identifier: string): number {
    const existing = this.failedAttempts.get(identifier);
    if (!existing) return 0;

    const now = Date.now();
    
    // Reset if enough time has passed
    if (now - existing.timestamp > this.RESET_TIME) {
      this.failedAttempts.delete(identifier);
      return 0;
    }

    return Math.min(
      this.MIN_DELAY * Math.pow(2, existing.attempts - 1),
      this.MAX_DELAY
    );
  }

  /**
   * Clean up old failed attempts that are past the reset time
   */
  private static cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [identifier, attempt] of this.failedAttempts.entries()) {
      if (now - attempt.timestamp > this.RESET_TIME) {
        this.failedAttempts.delete(identifier);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 THROTTLING - Cleaned up ${cleaned} expired failed attempts`);
    }
  }

  /**
   * Emergency cleanup when approaching memory limits
   * Removes oldest entries to make room for new ones
   */
  private static emergencyCleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    // First, clean up expired entries
    for (const [identifier, attempt] of this.failedAttempts.entries()) {
      if (now - attempt.timestamp > this.RESET_TIME) {
        this.failedAttempts.delete(identifier);
        cleaned++;
      }
    }

    // If still too many entries, remove oldest ones
    if (this.failedAttempts.size > this.EMERGENCY_CLEANUP_THRESHOLD) {
      const entries = Array.from(this.failedAttempts.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp); // Sort by oldest first

      const toRemove = this.failedAttempts.size - this.EMERGENCY_CLEANUP_THRESHOLD;
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        this.failedAttempts.delete(entries[i][0]);
        cleaned++;
      }
    }

    console.warn(`🚨 EMERGENCY CLEANUP - Removed ${cleaned} entries. Current size: ${this.failedAttempts.size}`);
  }

  /**
   * Get stats for monitoring
   */
  static getStats(): { 
    totalTracked: number; 
    oldestTimestamp: number | null;
    memoryUsagePercent: number;
    isNearCapacity: boolean;
  } {
    const entries = Array.from(this.failedAttempts.values());
    const memoryUsagePercent = (this.failedAttempts.size / this.MAX_TRACKED_IDENTIFIERS) * 100;
    
    return {
      totalTracked: entries.length,
      oldestTimestamp: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
      isNearCapacity: this.failedAttempts.size >= this.EMERGENCY_CLEANUP_THRESHOLD
    };
  }
}

export { LoginThrottleService };
