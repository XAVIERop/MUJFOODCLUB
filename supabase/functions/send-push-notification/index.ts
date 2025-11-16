// Supabase Edge Function to send push notifications via OneSignal
// This function is called when order status changes

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID") || "";
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY") || "";
const ONESIGNAL_API_URL = "https://onesignal.com/api/v1/notifications";

interface NotificationRequest {
  userId?: string;
  cafeId?: string;
  playerIds?: string[];
  heading: string;
  content: string;
  data?: Record<string, any>;
  url?: string;
  notificationType?: string;
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OneSignal credentials not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const notificationData: NotificationRequest = await req.json();
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let playerIds: string[] = [];

    // If userId is provided, fetch player IDs from database
    if (notificationData.userId) {
      const { data: subscriptions, error } = await supabaseClient
        .from("push_subscriptions")
        .select("player_id, preferences, is_active")
        .eq("user_id", notificationData.userId)
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching subscriptions:", error);
      } else if (subscriptions) {
        // Filter by preferences if notification type is specified
        if (notificationData.notificationType && subscriptions.length > 0) {
          const prefs = subscriptions[0].preferences as Record<string, boolean>;
          const prefKey = notificationData.notificationType;
          if (prefs[prefKey] === false) {
            // User has disabled this notification type
            return new Response(
              JSON.stringify({ success: false, message: "Notification disabled by user" }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        }
        playerIds = subscriptions.map((sub) => sub.player_id);
      }
    }

    // If cafeId is provided, fetch player IDs for cafe staff
    if (notificationData.cafeId) {
      const { data: subscriptions, error } = await supabaseClient
        .rpc("get_cafe_staff_push_subscriptions", {
          p_cafe_id: notificationData.cafeId,
        });

      if (error) {
        console.error("Error fetching cafe staff subscriptions:", error);
      } else if (subscriptions) {
        playerIds = subscriptions.map((sub: any) => sub.player_id);
      }
    }

    // Use provided player IDs if available
    if (notificationData.playerIds && notificationData.playerIds.length > 0) {
      playerIds = notificationData.playerIds;
    }

    if (playerIds.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No active subscriptions found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Send notification via OneSignal
    const oneSignalPayload = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: notificationData.heading },
      contents: { en: notificationData.content },
      include_player_ids: playerIds,
      data: notificationData.data || {},
    };

    if (notificationData.url) {
      oneSignalPayload.url = notificationData.url;
    }

    const oneSignalResponse = await fetch(ONESIGNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(oneSignalPayload),
    });

    if (!oneSignalResponse.ok) {
      const error = await oneSignalResponse.text();
      console.error("OneSignal API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send notification", details: error }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await oneSignalResponse.json();

    // Update last_notification_sent_at for subscriptions
    if (notificationData.userId) {
      await supabaseClient
        .from("push_subscriptions")
        .update({ last_notification_sent_at: new Date().toISOString() })
        .eq("user_id", notificationData.userId)
        .eq("is_active", true);
    }

    return new Response(
      JSON.stringify({ success: true, result, playerIdsSent: playerIds.length }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error in send-push-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

