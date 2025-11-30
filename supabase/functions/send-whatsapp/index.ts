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
  campaignName?: string; // Optional: campaign name, defaults to 'Order Notification'
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
    const { phoneNumber, message, campaignName } = await req.json() as WhatsAppRequest;

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

    // Aisensy API endpoint (from official documentation)
    const apiUrl = `${AISENSY_API_BASE_URL}/campaign/t1/api/v2`;
    
    console.log(`📡 Using Aisensy API endpoint: ${apiUrl}`);

    // Extract customer name from message if possible
    // Message format: "*Customer:* John Doe" or "👤 *Customer:* John Doe"
    const customerNameMatch = message.match(/(?:👤\s*)?\*Customer:\*\s*(.+?)(?:\n|$)/);
    const customerName = customerNameMatch ? customerNameMatch[1].trim() : 'Customer';
    
    // Use provided campaignName or default
    // IMPORTANT: This campaign must be created in Aisensy dashboard first and set to "Live"
    const finalCampaignName = campaignName || Deno.env.get('AISENSY_DEFAULT_CAMPAIGN_NAME') || 'Order Notification';
    
    // Request body according to Aisensy API documentation
    // The message will be sent as template parameters
    // You need to create a WhatsApp template in Aisensy that accepts the message as a parameter
    const requestBody = {
      apiKey: AISENSY_API_KEY,
      campaignName: finalCampaignName,
      destination: cleanNumber,
      userName: customerName,
      source: AISENSY_PHONE_NUMBER, // Optional: source of lead
      templateParams: [message] // Send full message as first template param
    };

    try {
      console.log('📤 Sending request to Aisensy API:', {
        url: apiUrl,
        destination: cleanNumber,
        userName: customerName,
        messageLength: message.length
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log(`📥 Aisensy API Response:`, response.status, responseText.substring(0, 500));

      if (response.ok) {
        console.log(`✅ Successfully sent WhatsApp message via Aisensy`);
        return new Response(
          JSON.stringify({
            success: true,
            endpoint: '/campaign/t1/api/v2',
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
      } else {
        // Parse error response
        let errorMessage = 'Unknown error';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.errorMessage || errorData.message || responseText;
        } catch {
          errorMessage = responseText.substring(0, 200);
        }
        
        console.error(`❌ Aisensy API error (${response.status}):`, errorMessage);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Aisensy API error: ${errorMessage}`,
            status: response.status
          }),
          {
            status: response.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    } catch (error) {
      console.error('❌ Error calling Aisensy API:', error);
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

