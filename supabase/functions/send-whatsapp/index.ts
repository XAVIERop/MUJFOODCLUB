// Supabase Edge Function to send WhatsApp messages via Aisensy
// This avoids CORS issues by making the API call server-side

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const AISENSY_API_BASE_URL = Deno.env.get('AISENSY_API_BASE_URL') || 'https://backend.aisensy.com';
const AISENSY_API_KEY = Deno.env.get('AISENSY_API_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjlmYjkxNTZhZTgwMGQ1MzFhNWEzZSIsIm5hbWUiOiJGb29kIENsdWIgNzUwNSIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2OGY5ZmI5MTU2YWU4MDBkNTMxYTVhMzkiLCJhY3RpdmVQbGFuIjoiRlJFRV9GT1JFVkVSIiwiaWF0IjoxNzYxMjEzMzI5fQ.vuy89L_rMu5jqcQpwQCcp-hlNWTh8M1psPXr5qUwu1s';
const AISENSY_PHONE_NUMBER = Deno.env.get('AISENSY_PHONE_NUMBER') || '919625851220';

interface WhatsAppRequest {
  phoneNumber: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { phoneNumber, message } = await req.json() as WhatsAppRequest;

    if (!phoneNumber || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'phoneNumber and message are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Format phone number (remove + and spaces, keep only digits)
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    console.log('📱 Sending WhatsApp via Aisensy:', {
      to: cleanNumber,
      messageLength: message.length,
      apiBaseUrl: AISENSY_API_BASE_URL
    });

    // Try different common endpoints
    const endpoints = [
      '/campaign/v1/send',
      '/v1/send',
      '/api/v1/send',
      '/campaign/send',
      '/whatsapp/send',
      '/send'
    ];

    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      const apiUrl = `${AISENSY_API_BASE_URL}${endpoint}`;
      
      console.log(`📡 Trying endpoint: ${endpoint}`);

      // Try different request body formats
      const requestBodies = [
        // Format 1: Standard format
        {
          phoneNumber: cleanNumber,
          message: message,
          source: AISENSY_PHONE_NUMBER
        },
        // Format 2: Alternative format
        {
          to: cleanNumber,
          text: message,
          from: AISENSY_PHONE_NUMBER
        },
        // Format 3: Another common format
        {
          recipient: cleanNumber,
          message: message
        }
      ];

      for (let i = 0; i < requestBodies.length; i++) {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${AISENSY_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBodies[i])
          });

          const responseText = await response.text();
          console.log(`Response from ${endpoint} (format ${i + 1}):`, response.status, responseText);

          if (response.ok) {
            console.log(`✅ Success with endpoint ${endpoint}, format ${i + 1}`);
            return new Response(
              JSON.stringify({
                success: true,
                endpoint,
                format: i + 1,
                response: responseText
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              }
            );
          } else if (response.status !== 404) {
            // If not 404, the endpoint exists but format might be wrong
            lastError = new Error(`API returned ${response.status}: ${responseText}`);
            continue;
          }
        } catch (error) {
          console.log(`Error with ${endpoint} format ${i + 1}:`, error);
          lastError = error as Error;
          continue;
        }
      }
    }

    // If all endpoints failed
    return new Response(
      JSON.stringify({
        success: false,
        error: 'All Aisensy endpoints failed',
        details: lastError?.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('❌ Error in send-whatsapp function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

