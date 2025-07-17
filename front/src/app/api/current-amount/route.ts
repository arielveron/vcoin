import { NextResponse } from 'next/server';
import { ServerDataService } from '@/services/server-data-service';
import { calculateMontoActual } from '@/logic/calculations-server';

export async function GET() {
  try {
    const investments = await ServerDataService.getInvestmentsList();
    const montoActual = calculateMontoActual(investments);
    
    return NextResponse.json({
      montoActual,
      timestamp: Date.now(),
      success: true
    });
  } catch (error) {
    console.error('Error getting current amount:', error);
    return NextResponse.json(
      { error: 'Failed to get current amount', success: false },
      { status: 500 }
    );
  }
}
