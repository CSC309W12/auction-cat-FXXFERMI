// app/api/payment/route.ts
import { NextResponse } from 'next/server';

// CORS Preflight Handler
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}

// Main POST Handler with Third-Party API Call (includes API key)
export async function POST(request: Request) {
  const responseHeaders = {
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json();

    // Get third-party payment API URL and API key from environment variables
    const thirdPartyUrl = process.env.THIRDPARTY_PAYMENT_URL;
    const thirdPartyApiKey = process.env.THIRDPARTY_API_KEY;
    if (!thirdPartyUrl || !thirdPartyApiKey) {
      return NextResponse.json(
        { error: 'Third-party payment URL or API key not configured.' },
        { status: 500, headers: responseHeaders }
      );
    }

    // Call the third-party payment API with the API key in the headers
    const thirdPartyResponse = await fetch(thirdPartyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': thirdPartyApiKey,
      },
      body: JSON.stringify(body),
    });

    const thirdPartyData = await thirdPartyResponse.json();

    // Return response based on third-party API result
    if (thirdPartyResponse.ok) {
      return NextResponse.json(
        { message: 'Payment processed successfully.', details: thirdPartyData },
        { status: 200, headers: responseHeaders }
      );
    } else {
      return NextResponse.json(
        { error: 'Payment processing failed.', details: thirdPartyData },
        { status: thirdPartyResponse.status, headers: responseHeaders }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Server error while processing payment.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: responseHeaders }
    );
  }
}