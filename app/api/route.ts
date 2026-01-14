import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'AskGene Web3 API',
    version: '1.0.0',
    description: 'API for Web3 consultation platform',
    endpoints: [
      {
        path: '/api/consultants',
        method: 'GET',
        description: 'Get list of consultants'
      },
      {
        path: '/api/consultations',
        method: 'GET',
        description: 'Get user consultations (requires wallet_address query param)'
      },
      {
        path: '/api/consultations',
        method: 'POST',
        description: 'Create new consultation'
      },
      {
        path: '/api/feedback',
        method: 'GET',
        description: 'Get feedback for consultant'
      }
    ],
    timestamp: new Date().toISOString()
  });
}
