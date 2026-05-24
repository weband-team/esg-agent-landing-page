import { NextResponse } from 'next/server';
const db = require('../../../database');

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== 'Bearer GmzybwfGjh3') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

export async function PATCH(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== 'Bearer GmzybwfGjh3') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { reference, status } = body;

    if (!reference || !status) {
      return NextResponse.json({ error: 'Reference and status are required' }, { status: 400 });
    }

    const result = await db.updateDepositStatus(reference, status);
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating deposit status:', error);
    return NextResponse.json(
      { error: 'Failed to update deposit status.' },
      { status: 500 }
    );
  }
}
