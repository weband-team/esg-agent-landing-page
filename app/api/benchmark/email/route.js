import { NextResponse } from 'next/server';
const db = require('../../../../database');

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, company, score, answers, pdfBase64, lang, filename } = body;

    // Validation
    if (!name || !email || !company || score === undefined || !answers) {
      return NextResponse.json(
        { error: 'Name, email, company, score, and answers are required fields.' },
        { status: 400 }
      );
    }

    // Prepare benchmark object for database storage
    const benchmarkData = {
      name,
      email,
      company,
      score: parseFloat(score),
      answers: typeof answers === 'string' ? answers : JSON.stringify(answers)
    };

    // Save benchmark record to database
    const savedRecord = await db.saveBenchmark(benchmarkData);

    let emailSent = false;
    let emailDetails = 'Not attempted';

    if (pdfBase64) {
      const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUFrWH0Q2N7OiSzsy14zQQ2cAt_XDXMScKBe7SqPrDs2NvkQ8A-xYmEsgtLymOAhGh/exec';
      const actualFilename = filename || `ESG_Assessment_${Date.now()}.pdf`;

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
            // Try to extract the error message from the Google Apps Script error page
            let errMsg = 'Google Apps Script execution error (HTML response)';
            
            // Extract text from the error div: <div style="text-align:center;font-family:monospace;...
            const monospaceMatch = resText.match(/<div style="[^"]*font-family:\s*monospace[^"]*">([\s\S]*?)<\/div>/i);
            const errorMessageMatch = resText.match(/class="errorMessage">([\s\S]*?)<\/div>/i);
            
            if (monospaceMatch && monospaceMatch[1]) {
              errMsg = monospaceMatch[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
            } else if (errorMessageMatch && errorMessageMatch[1]) {
              errMsg = errorMessageMatch[1].trim();
            } else {
              // General body extraction or title
              const titleMatch = resText.match(/<title>([\s\S]*?)<\/title>/i);
              if (titleMatch && titleMatch[1]) {
                errMsg = `Google Apps Script Error: ${titleMatch[1].trim()}`;
              }
            }
            
            console.error('Google Apps Script crashed:', errMsg);
            emailDetails = errMsg;
          } else {
            // Check if it's JSON and has success
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
              // Not JSON, but not HTML - assume successful text response
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
      message: 'ESG Benchmark results processed.',
      benchmark: savedRecord,
      emailSent,
      emailDetails
    });

  } catch (error) {
    console.error('Error handling ESG benchmark submission API:', error);
    return NextResponse.json(
      { error: 'Failed to process and email benchmark results. Please try again.' },
      { status: 500 }
    );
  }
}

