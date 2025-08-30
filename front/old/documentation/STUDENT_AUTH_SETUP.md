# Student Authentication Setup

This document explains how to set up the new student authentication system in the VCOIN application.

## Overview

The application now has two separate authentication systems:
1. **Admin Authentication**: Uses Google OAuth for administrators
2. **Student Authentication**: Uses username/password for students

## Database Setup

The student authentication is included in the main database initialization. Simply run:

```bash
npm run setup
```

This will create all tables including the `password_hash` field in the students table and the necessary indexes.

## Environment Variables

The system requires the following configuration in `.env.local`:

```bash
# Student Session Security (REQUIRED)
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
SESSION_SECRET=your-secure-random-64-byte-hex-key

# Login Throttling Configuration (optional)
LOGIN_THROTTLE_MIN_DELAY=1000          # Minimum delay in ms (default: 1000)
LOGIN_THROTTLE_MAX_DELAY=30000         # Maximum delay in ms (default: 30000)  
LOGIN_THROTTLE_MAX_TRACKED=10000       # Max tracked attempts (default: 10000)
LOGIN_THROTTLE_RESET_TIME=300000       # Reset time in ms (default: 300000)
LOGIN_THROTTLE_CLEANUP_INTERVAL=60000  # Cleanup interval in ms (default: 60000)
```

**IMPORTANT**: The `SESSION_SECRET` is required for secure session encryption. Generate a secure random key using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

If not configured, throttling uses secure defaults automatically.

## How It Works

### For Students:
1. Students access the application at `/login`
2. They log in using:
   - Class ID (e.g., 1, 2, 3...)
   - Registry Number (their student number)
   - Password (assigned by admin)
3. After login, they access their personal dashboard at `/student`
4. They can update their profile (email/password) at `/student/profile`

### For Administrators:
1. Admins continue to use Google OAuth at `/admin/auth/signin`
2. In the students management section, they can now:
   - See which students have passwords set
   - Assign/change passwords for students
   - View login credentials that students need

## Student Login Process

1. Student visits `/login`
2. Enters their credentials with real-time validation:
   - **Class ID**: Numbers only (01, 001 automatically become 1)
   - **Registry Number**: Numbers only (supports leading zeros)
   - **Password**: Restricted character set for security
3. **Visual Feedback**: Loading spinner and disabled button during authentication
4. **Throttling Protection**: Failed attempts trigger increasing delays
5. System validates credentials and creates a secure session
6. Student is redirected to `/student` (their personalized dashboard)
7. Student can access their profile at `/student/profile`

### Login Security Features
- **Input Normalization**: Leading zeros automatically handled (01 → 1)
- **Character Validation**: Only allowed characters accepted
- **Visual Feedback**: Spinning loader during authentication attempts
- **Failed Attempt Logging**: All security events are logged with timestamps
- **Progressive Delays**: Brute force attacks face exponential backoff

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds for secure password storage
- **Input Validation**: Strict client-side and server-side validation
  - Class ID & Registry: Numbers only (supports leading zeros like 01 → 1)
  - Password: Letters, numbers, and symbols: `- . + $ & / ! ?`
- **Login Throttling**: Anti-brute force protection with exponential backoff
  - Progressive delays: 1s → 2s → 4s → 8s → 16s → 30s (max)
  - Memory-protected against DDoS attacks (max 10,000 tracked attempts)
  - Automatic cleanup of expired attempts
- **Secure Sessions**: Encrypted, signed sessions with tamper detection
  - **AES-256-CBC Encryption**: Session data is encrypted before storage
  - **HMAC-SHA256 Signatures**: Detects any cookie tampering attempts
  - **Automatic Expiration**: Sessions expire after 7 days with timestamp validation
  - **Tamper Protection**: Any modification destroys the session immediately
- **Enhanced Logging**: Comprehensive security logging for failed attempts
- **Data Isolation**: Students can only see their own data
- **Admin Controls**: Only admins can create/delete student accounts

### Session Security Details
- **Cookie Manipulation Protection**: Sessions cannot be modified to access other accounts
- **Signature Validation**: Each session is cryptographically signed
- **Database Verification**: Valid sessions are verified against the database
- **Automatic Cleanup**: Invalid or expired sessions are destroyed immediately

### Anti-DDoS Protection
- **Memory Limits**: Max 10,000 concurrent failed login attempts tracked
- **Emergency Cleanup**: Automatic removal of oldest entries when approaching limits
- **Graceful Degradation**: New attackers get max delay without consuming memory
- **Legitimate User Protection**: Real students can still log in during attacks

## Password Management

### Admin Setting Student Passwords:
1. Go to Admin → Students
2. Find the student in the list
3. Click "Set Password"
4. Enter a password (minimum 6 characters)
5. Share the login credentials with the student:
   - Class ID: [shown in dialog]
   - Registry: [shown in dialog]  
   - Password: [what you just set]

### Students Changing Their Own Password:
1. Student logs in and goes to Profile
2. Enters current password
3. Enters new password and confirms
4. Password is updated

## Server Actions (No API Routes)

The system follows Next.js best practices:
- **Student Authentication**: Server actions in `/src/actions/student-actions.ts`
- **Admin Functions**: Server actions in `/src/app/admin/students/actions.ts`
- **Server Components**: Data fetching happens server-side
- **Client Components**: Handle UI interactions only

## Protected Routes

- `/student/*` - All student routes require student authentication
- `/admin/*` - All admin routes require admin authentication  
- `/` - Redirects to `/login`

## Key Benefits

✅ **Simple**: No JWT complexity, uses standard Next.js patterns  
✅ **Secure**: Encrypted sessions with HMAC signatures prevent tampering
✅ **Tamper-Proof**: Cookie manipulation automatically destroys sessions
✅ **User-friendly**: Real-time validation, visual feedback, and smart number handling  
✅ **DDoS-resistant**: Memory-protected throttling system  
✅ **Isolated**: Students only see their own data with database verification
✅ **Admin-controlled**: Only admins can manage student accounts  
✅ **Production-ready**: Comprehensive logging and monitoring  
✅ **Maintainable**: Server actions instead of API routes  
✅ **Scalable**: Encrypted sessions with efficient validation
✅ **Configurable**: Environment variables for security settings  
✅ **Scalable**: Cookie-based sessions with efficient throttling  
✅ **Configurable**: Environment variables for fine-tuning security settings  

## Deployment Notes

1. The system works out of the box with the main database setup
2. Session cookies are secure in production (httpOnly, secure, sameSite)
3. Sessions are validated on every request to protected routes
4. No additional environment variables needed
