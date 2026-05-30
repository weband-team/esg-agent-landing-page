import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    let pdfPath = path.join(process.cwd(), 'regulations-search', 'test_report.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      // Try fallback paths
      pdfPath = path.join(process.cwd(), 'test_report.pdf');
    }

    if (!fs.existsSync(pdfPath)) {
      console.error('Fallback PDF not found at:', pdfPath);
      return NextResponse.json(
        { error: 'Fallback PDF report file not found on disk.' },
        { status: 404 }
      );
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="ESG_Compliance_Report_Fallback.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Error in PDF fallback route:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
