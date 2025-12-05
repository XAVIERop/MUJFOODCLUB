// Supabase Edge Function to send WhatsApp messages via Aisensy
// This avoids CORS issues by making the API call server-side

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const AISENSY_API_BASE_URL = Deno.env.get('AISENSY_API_BASE_URL') || 'https://backend.aisensy.com';
const AISENSY_API_KEY = Deno.env.get('AISENSY_API_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjlmYjkxNTZhZTgwMGQ1MzFhNWEzZSIsIm5hbWUiOiJGb29kIENsdWIgNzUwNSIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2OGY5ZmI5MTU2YWU4MDBkNTMxYTVhMzkiLCJhY3RpdmVQbGFuIjoiRlJFRV9GT1JFVkVSIiwiaWF0IjoxNzYxMjEzMzI5fQ.vuy89L_rMu5jqcQpwQCcp-hlNWTh8M1psPXr5qUwu1s';
const AISENSY_PHONE_NUMBER = Deno.env.get('AISENSY_PHONE_NUMBER') || '919625851220';

interface WhatsAppRequest {
  phoneNumber: string;
  message?: string; // Single message (for backward compatibility)
  messageParts?: string[]; // Multiple template parameters (for new format)
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
    const { phoneNumber, message, messageParts, campaignName } = await req.json() as WhatsAppRequest;

    if (!phoneNumber || (!message && !messageParts)) {
      return new Response(
        JSON.stringify({ success: false, error: 'phoneNumber and message/messageParts are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Use messageParts if provided (4 parameters), otherwise fallback to single message
    const templateParams = messageParts && messageParts.length > 0 
      ? messageParts 
      : (message ? [message] : []);

    if (templateParams.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'message or messageParts is required' }),
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
      templateParamsCount: templateParams.length,
      messageLength: templateParams.join(' ').length,
      apiBaseUrl: AISENSY_API_BASE_URL
    });

    // Aisensy API endpoint (from official documentation)
    const apiUrl = `${AISENSY_API_BASE_URL}/campaign/t1/api/v2`;
    
    console.log(`📡 Using Aisensy API endpoint: ${apiUrl}`);

    // Extract customer name from first parameter - try multiple patterns
    const firstParam = templateParams[0] || '';
    let customerName = 'Customer'; // Default fallback
    
    // Try to extract customer name from various patterns
    const patterns = [
      /Customer:\s*([^|]+)/,           // "Customer: John Doe |"
      /customer:\s*([^|]+)/i,          // Case insensitive
      /Customer\s+([^|]+)/,            // "Customer John Doe |"
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/, // Any capitalized name pattern
    ];
    
    for (const pattern of patterns) {
      const match = firstParam.match(pattern);
      if (match && match[1]) {
        customerName = match[1].trim();
        break;
      }
    }
    
    // Clean userName - Aisensy requires alphanumeric and spaces only, max 50 chars
    customerName = customerName
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')    // Normalize spaces
      .trim()
      .substring(0, 50);       // Max 50 characters
    
    // If still empty or just whitespace, use default
    if (!customerName || customerName.length === 0) {
      customerName = 'Customer';
    }
    
    // Use provided campaignName or default
    // IMPORTANT: Make sure this campaign name exactly matches what's in Aisensy dashboard
    const finalCampaignName = campaignName || Deno.env.get('AISENSY_DEFAULT_CAMPAIGN_NAME') || 'Order Notification V2';
    
    console.log('📋 Campaign Configuration:', {
      provided: campaignName,
      env: Deno.env.get('AISENSY_DEFAULT_CAMPAIGN_NAME'),
      final: finalCampaignName,
      templateParamsCount: templateParams.length
    });
    
    // Build paramsFallbackValue - use numeric keys "1", "2", "3", "4"
    // IMPORTANT: Don't clean templateParams themselves, only clean fallback values
    // Keep emojis and asterisks (*) for bold formatting in templateParams
    const paramsFallbackValue: Record<string, string> = {};
    templateParams.forEach((param, index) => {
      // For fallback, create a clean version but preserve emojis and asterisks
      // Remove only truly problematic characters, keep emojis, asterisks, and common punctuation
      const cleanParam = param
        .replace(/[^\w\s|.,:()*-]/g, '') // Keep safe characters including asterisks for bold
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 150); // Shorter fallback
      paramsFallbackValue[`${index + 1}`] = cleanParam || `Param ${index + 1}`;
    });
    
    // Request body - adjust based on template parameter count
    // If single parameter, use simpler format; if multiple, use full format
    const requestBody: any = {
      apiKey: AISENSY_API_KEY,
      campaignName: finalCampaignName,
      destination: cleanNumber,
      userName: customerName,
      source: AISENSY_PHONE_NUMBER,
      media: {},
      buttons: [],
      carouselCards: [],
      location: {},
      attributes: {}
    };
    
    // Add template parameters based on count
    if (templateParams.length === 1) {
      // Single parameter template
      requestBody.templateParams = templateParams[0];
      requestBody.paramsFallbackValue = { "1": paramsFallbackValue["1"] || templateParams[0].substring(0, 150) };
    } else {
      // Multi-parameter template (2, 3, 4, etc.)
      requestBody.templateParams = templateParams;
      requestBody.paramsFallbackValue = paramsFallbackValue;
    }

    try {
      // Log the actual message content being sent for debugging
      console.log('📤 Sending request to Aisensy API:', {
        url: apiUrl,
        destination: cleanNumber,
        userName: customerName,
        templateParamsCount: templateParams.length,
        templateParams: templateParams,
        campaignName: finalCampaignName
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log(`📥 Aisensy API Response (Status ${response.status}):`, responseText);
      
      // Log full request body for debugging
      console.log('📋 Full Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('📋 Request Details:', {
        campaignName: finalCampaignName,
        templateParamsCount: templateParams.length,
        templateParams: templateParams,
        userName: customerName,
        userNameLength: customerName.length,
        destination: cleanNumber
      });

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

