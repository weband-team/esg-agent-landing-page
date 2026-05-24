import { NextResponse } from 'next/server';
const db = require('../../../database');

export async function GET() {
  try {
    const records = await db.getAllDeposits();
    return NextResponse.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching deposits from API:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve database records.' },
      { status: 500 }
    );
  }
}
