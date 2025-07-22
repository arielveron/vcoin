import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check - you can add more comprehensive checks here
    // For example: database connectivity, external service availability, etc.
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'vcoin',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(errorData, { status: 503 });
  }
}
