import { NextResponse } from 'next/server';
const db = require('../../../database');

const BANK_ACCOUNTS = {
  PLN: {
    accountNumber: '84102013320000150216354384',
    amount: 399,
    currencySymbol: 'zł',
    currencyCode: 'PLN'
  },
  EUR: {
    accountNumber: '61102013320000190216354408',
    amount: 99,
    currencySymbol: '€',
    currencyCode: 'EUR'
  },
  USD: {
    accountNumber: '51102013320000170216354395',
    amount: 99,
    currencySymbol: '$',
    currencyCode: 'USD'
  }
};

const BANK_INFO = {
  bankName: 'PKO Bank Polski',
  bankAddress: 'ul. Świętokrzyska 36, 00-116 Warszawa, Polska',
  swiftBic: 'BPKOPLPW',
  companyName: 'QIRE LAB SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ',
  companyAddress: 'ul. Hetmańska 25, 15-727 Białystok, Polska',
  nip: '5423505856',
  regon: '542864985',
  krs: '0001197301'
};

function generateReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ESG-REG-${code}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, company, industry, standard } = body;

    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Name, email, and company name are required.' },
        { status: 400 }
      );
    }

    const reference = generateReference();

    const depositData = {
      name,
      email,
      phone: phone || '-',
      company,
      industry: industry || 'Not Specified',
      standard: standard || 'CSRD / VSME',
      currency: '-',
      amount: 0.0,
      reference,
      status: 'PRE-REGISTERED'
    };

    const savedRecord = await db.saveDeposit(depositData);

    return NextResponse.json({
      success: true,
      message: 'Pre-launch registration successfully completed.',
      deposit: savedRecord
    });

  } catch (error) {
    console.error('Error handling pre-registration API:', error);
    return NextResponse.json(
      { error: 'Failed to process pre-registration. Please try again.' },
      { status: 500 }
    );
  }
}
