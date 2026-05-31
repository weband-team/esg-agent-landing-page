import { NextResponse } from 'next/server';
const db = require('../../../../database');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, company, nip, employees, revenue, assets, lang } = body;

    // Validation
    if (!name || !email || !company || !nip) {
      return NextResponse.json(
        { error: 'Name, email, company, and NIP are required fields.' },
        { status: 400 }
      );
    }

    // 1. Fetch the PDF from the NestJS backend running on port 3001
    const queryParams = new URLSearchParams();
    if (employees !== undefined && employees !== '') queryParams.append('employees', String(employees));
    if (revenue !== undefined && revenue !== '') queryParams.append('revenue', String(revenue));
    if (assets !== undefined && assets !== '') queryParams.append('assets', String(assets));

    // Server-side calls reach the NestJS backend directly on the same host.
    // Override with REGULATIONS_BACKEND_URL if the backend runs elsewhere.
    const backendUrl = process.env.REGULATIONS_BACKEND_URL || 'http://localhost:3001';
    const nestPdfUrl = `${backendUrl}/api/pdf/download/${nip}?${queryParams.toString()}`;

    let pdfBase64 = '';
    let matchedCount = 0;

    try {
      // Fetch the matching results from NestJS to get the matched count
      const nestLookupUrl = `${backendUrl}/api/lookup/direct/${nip}?${queryParams.toString()}`;
      const lookupResponse = await fetch(nestLookupUrl);
      if (lookupResponse.ok) {
        const lookupData = await lookupResponse.json();
        matchedCount = lookupData.analysis_summary?.matched_count || 0;
      }
    } catch (lookupErr) {
      console.error('Error fetching lookup details from NestJS:', lookupErr);
    }

    try {
      const pdfResponse = await fetch(nestPdfUrl);
      if (!pdfResponse.ok) {
        throw new Error(`NestJS PDF endpoint returned status ${pdfResponse.status}`);
      }
      const arrayBuffer = await pdfResponse.arrayBuffer();
      pdfBase64 = Buffer.from(arrayBuffer).toString('base64');
    } catch (pdfErr: any) {
      console.error('Error fetching PDF from NestJS:', pdfErr);
      return NextResponse.json(
        { error: `Failed to compile PDF report from NestJS backend: ${pdfErr.message}` },
        { status: 500 }
      );
    }

    // 2. Prepare database object
    const reportData = {
      name,
      email: email.trim(),
      company,
      nip,
      matched_count: matchedCount
    };

    // Save report record to SQLite database
    let savedRecord;
    try {
      savedRecord = await db.saveRegulationReport(reportData);
    } catch (dbErr) {
      console.error('Failed to log report in database:', dbErr);
    }

    // 3. Forward Base64 PDF to Google Apps Script
    let emailSent = false;
    let emailDetails = 'Not attempted';

    if (pdfBase64) {
      const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUFrWH0Q2N7OiSzsy14zQQ2cAt_XDXMScKBe7SqPrDs2NvkQ8A-xYmEsgtLymOAhGh/exec';
      const actualFilename = `Compliance_Report_${nip}_${new Date().toISOString().split('T')[0]}.pdf`;

      try {
        const formData = new URLSearchParams();
        formData.append('action', 'email_pdf');
        formData.append('email', email.trim());
        formData.append('pdfBase64', pdfBase64);
        formData.append('lang', lang || 'pl');
        formData.append('filename', actualFilename);

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString()
        });

        if (response.ok) {
          emailSent = true;
          emailDetails = 'PDF report forwarded successfully via Google Apps Script';
        } else {
          const errText = await response.text();
          console.error('Google Apps Script response error:', response.status, errText);
          emailDetails = `Failed sending via Apps Script: status ${response.status}`;
        }
      } catch (fetchError: any) {
        console.error('Error forwarding to Google Apps Script:', fetchError);
        emailDetails = `Network error forwarding to Apps Script: ${fetchError.message}`;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Regulations search report processed successfully.',
      report: savedRecord || reportData,
      emailSent,
      emailDetails
    });

  } catch (error: any) {
    console.error('Error handling Regulations search submission API:', error);
    return NextResponse.json(
      { error: 'Failed to process and email compliance results. Please try again.' },
      { status: 500 }
    );
  }
}
