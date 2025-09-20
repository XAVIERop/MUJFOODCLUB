import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateCookHouseStatus() {
  try {
    console.log('🔍 Looking for Cook House cafe...')
    
    // First, let's find the Cook House cafe
    const { data: cafes, error: fetchError } = await supabase
      .from('cafes')
      .select('id, name, is_active, accepting_orders')
      .or('name.ilike.%cook%house%,name.ilike.%house%')
    
    if (fetchError) {
      console.error('❌ Error fetching cafes:', fetchError)
      return
    }
    
    console.log('📋 Found cafes:', cafes)
    
    if (cafes.length === 0) {
      console.log('❌ No cafe found with "cook" or "house" in the name')
      return
    }
    
    // Update each matching cafe to be active and accepting orders
    for (const cafe of cafes) {
      console.log(`🔄 Updating ${cafe.name}...`)
      
      const { data, error } = await supabase
        .from('cafes')
        .update({
          is_active: true,
          accepting_orders: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', cafe.id)
        .select()
      
      if (error) {
        console.error(`❌ Error updating ${cafe.name}:`, error)
      } else {
        console.log(`✅ Successfully updated ${cafe.name}:`, data[0])
      }
    }
    
    // Verify the update
    console.log('\n🔍 Verifying updates...')
    const { data: updatedCafes, error: verifyError } = await supabase
      .from('cafes')
      .select('id, name, is_active, accepting_orders')
      .or('name.ilike.%cook%house%,name.ilike.%house%')
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError)
      return
    }
    
    console.log('📋 Updated cafe statuses:')
    updatedCafes.forEach(cafe => {
      const status = cafe.is_active && cafe.accepting_orders ? 'Order Now' : 
                     cafe.is_active ? 'Currently Closed' : 'Coming Soon'
      console.log(`  - ${cafe.name}: ${status}`)
    })
    
    // Show summary
    const { data: allCafes, error: summaryError } = await supabase
      .from('cafes')
      .select('is_active, accepting_orders')
    
    if (!summaryError && allCafes) {
      const totalCafes = allCafes.length
      const activeCafes = allCafes.filter(c => c.is_active).length
      const acceptingOrders = allCafes.filter(c => c.accepting_orders).length
      
      console.log(`\n📊 Summary: ${totalCafes} total cafes, ${activeCafes} active, ${acceptingOrders} accepting orders`)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

updateCookHouseStatus()
