import { NextResponse } from 'next/server';
const db = require('../../../../database');

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name, email, company,
      totalLB, totalMB, scope1, scope2LB, reportingYear,
      pdfBase64, lang, filename
    } = body;

    // Validation
    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Name, email, and company are required fields.' },
        { status: 400 }
      );
    }

    // Prepare carbon footprint report object for database storage
    const reportData = {
      name,
      email: email.trim(),
      company,
      reporting_year: reportingYear !== undefined && reportingYear !== null ? parseInt(reportingYear, 10) : null,
      total_lb: totalLB !== undefined && totalLB !== null ? parseFloat(totalLB) : 0,
      total_mb: totalMB !== undefined && totalMB !== null ? parseFloat(totalMB) : null,
      scope1: scope1 !== undefined && scope1 !== null ? parseFloat(scope1) : null,
      scope2_lb: scope2LB !== undefined && scope2LB !== null ? parseFloat(scope2LB) : null,
    };

    // Save report record to database
    let savedRecord;
    try {
      savedRecord = await db.saveCarbonFootprintReport(reportData);
    } catch (dbErr) {
      console.error('Failed to log carbon footprint report in database:', dbErr);
    }

    let emailSent = false;
    let emailDetails = 'Not attempted';

    if (pdfBase64) {
      const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUFrWH0Q2N7OiSzsy14zQQ2cAt_XDXMScKBe7SqPrDs2NvkQ8A-xYmEsgtLymOAhGh/exec';
      const actualFilename = filename || `Carbon_Footprint_Report_${Date.now()}.pdf`;

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

        const resText = await response.text();

        if (response.ok) {
          // Even if response is OK (HTTP 200), check if it's a GAS error page (HTML)
          const isHtml = resText.trim().startsWith('<!DOCTYPE html>') || resText.includes('<html');
          if (isHtml) {
            emailSent = false;
            let errMsg = 'Google Apps Script execution error (HTML response)';

            const monospaceMatch = resText.match(/<div style="[^"]*font-family:\s*monospace[^"]*">([\s\S]*?)<\/div>/i);
            const errorMessageMatch = resText.match(/class="errorMessage">([\s\S]*?)<\/div>/i);

            if (monospaceMatch && monospaceMatch[1]) {
              errMsg = monospaceMatch[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
            } else if (errorMessageMatch && errorMessageMatch[1]) {
              errMsg = errorMessageMatch[1].trim();
            } else {
              const titleMatch = resText.match(/<title>([\s\S]*?)<\/title>/i);
              if (titleMatch && titleMatch[1]) {
                errMsg = `Google Apps Script Error: ${titleMatch[1].trim()}`;
              }
            }

            console.error('Google Apps Script crashed:', errMsg);
            emailDetails = errMsg;
          } else {
            try {
              const resJson = JSON.parse(resText);
              if (resJson && resJson.status === 'error') {
                emailSent = false;
                emailDetails = `Apps Script failed: ${resJson.message || 'unknown error'}`;
              } else {
                emailSent = true;
                emailDetails = 'PDF sent successfully via Google Apps Script';
              }
            } catch (e) {
              emailSent = true;
              emailDetails = 'PDF sent successfully via Google Apps Script';
            }
          }
        } else {
          console.error('Google Apps Script response error:', response.status, resText);
          emailDetails = `Failed sending via Apps Script: status ${response.status}`;
        }
      } catch (fetchError) {
        console.error('Error forwarding to Google Apps Script:', fetchError);
        emailDetails = `Network error forwarding to Apps Script: ${fetchError.message}`;
      }
    } else {
      emailDetails = 'No PDF data provided';
    }

    return NextResponse.json({
      success: true,
      message: 'Carbon footprint report processed.',
      report: savedRecord || reportData,
      emailSent,
      emailDetails
    });

  } catch (error) {
    console.error('Error handling carbon footprint submission API:', error);
    return NextResponse.json(
      { error: 'Failed to process and email carbon footprint results. Please try again.' },
      { status: 500 }
    );
  }
}
