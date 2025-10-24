import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Cafe {
  id: string;
  name: string;
  priority: number;
  accepting_orders: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting automated cafe reopening...')
    console.log(`⏰ Current time: ${new Date().toLocaleString()}`)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get first 10 cafes ordered by priority
    console.log('🔍 Fetching first 10 cafes...')
    const { data: cafes, error: fetchError } = await supabaseClient
      .from('cafes')
      .select('id, name, priority, accepting_orders')
      .order('priority', { ascending: true })
      .limit(10)

    if (fetchError) {
      throw new Error(`Failed to fetch cafes: ${fetchError.message}`)
    }

    if (!cafes || cafes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No cafes found to reopen',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`✅ Found ${cafes.length} cafes to reopen`)

    // Log cafes to be reopened
    console.log('\n📋 Cafes to reopen:')
    cafes.forEach((cafe: Cafe, index: number) => {
      console.log(`${index + 1}. ${cafe.name} (Priority: ${cafe.priority}, Currently: ${cafe.accepting_orders ? 'Open' : 'Closed'})`)
    })

    // Reopen all cafes
    console.log('\n🔄 Reopening cafes...')
    const results = await Promise.allSettled(
      cafes.map(async (cafe: Cafe) => {
        const { error } = await supabaseClient
          .from('cafes')
          .update({ 
            accepting_orders: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', cafe.id)

        if (error) {
          throw new Error(`Failed to reopen ${cafe.name}: ${error.message}`)
        }

        console.log(`✅ Reopened: ${cafe.name} (Priority: ${cafe.priority})`)
        return { id: cafe.id, name: cafe.name, success: true }
      })
    )

    // Calculate results
    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.length - successful
    const successfulCafes = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)

    console.log('\n📊 Reopening Summary:')
    console.log(`✅ Successfully reopened: ${successful} cafes`)
    console.log(`❌ Failed to reopen: ${failed} cafes`)

    const response = {
      success: successful > 0,
      message: `Reopened ${successful} out of ${cafes.length} cafes`,
      timestamp: new Date().toISOString(),
      details: {
        total_cafes: cafes.length,
        successful_reopenings: successful,
        failed_reopenings: failed,
        reopened_cafes: successfulCafes
      }
    }

    console.log('🎉 Automated reopening completed!')
    console.log('Response:', JSON.stringify(response, null, 2))

    return new Response(
      JSON.stringify(response),
      { 
        status: successful > 0 ? 200 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Automated reopening failed:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
