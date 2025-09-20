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

async function setFirstSixCafesAcceptingOrders() {
  try {
    console.log('🔍 Setting first 6 cafes to accept orders...\n')
    
    // First, let's see the current status
    console.log('📋 CURRENT STATUS:')
    const { data: currentCafes, error: fetchError } = await supabase
      .from('cafes')
      .select('id, name, priority, is_active, accepting_orders')
      .order('priority', { ascending: true, nullsLast: true })
      .order('name', { ascending: true })
    
    if (fetchError) {
      console.error('❌ Error fetching cafes:', fetchError)
      return
    }
    
    console.log('='.repeat(70))
    currentCafes.forEach((cafe, index) => {
      const status = cafe.accepting_orders ? '✅ ORDER NOW' : '⏳ COMING SOON'
      const marker = index < 6 ? '🎯' : '⏳'
      console.log(`${marker} ${(index + 1).toString().padStart(2)}. ${cafe.name.padEnd(20)} | ${status}`)
    })
    console.log('='.repeat(70))
    
    // Step 1: Set ALL cafes to NOT accepting orders (safety first)
    console.log('\n🔄 Step 1: Setting all cafes to NOT accepting orders...')
    const { error: disableError } = await supabase
      .from('cafes')
      .update({ 
        accepting_orders: false,
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000') // This ensures WHERE clause exists
    
    if (disableError) {
      console.error('❌ Error disabling all cafes:', disableError)
      return
    }
    console.log('✅ All cafes set to NOT accepting orders')
    
    // Step 2: Set only the first 6 cafes to accept orders
    const firstSixCafes = ['CHATKARA', 'FOOD COURT', 'Mini Meals', 'Punjabi Tadka', 'Munch Box', 'COOK HOUSE']
    
    console.log('\n🔄 Step 2: Setting first 6 cafes to accept orders...')
    const { error: enableError } = await supabase
      .from('cafes')
      .update({ 
        accepting_orders: true,
        updated_at: new Date().toISOString()
      })
      .in('name', firstSixCafes)
    
    if (enableError) {
      console.error('❌ Error enabling first 6 cafes:', enableError)
      return
    }
    
    console.log('✅ First 6 cafes enabled for ordering:')
    firstSixCafes.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`)
    })
    
    // Verify the update
    console.log('\n🔍 VERIFICATION:')
    const { data: updatedCafes, error: verifyError } = await supabase
      .from('cafes')
      .select('id, name, priority, is_active, accepting_orders')
      .order('priority', { ascending: true, nullsLast: true })
      .order('name', { ascending: true })
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError)
      return
    }
    
    console.log('='.repeat(70))
    updatedCafes.forEach((cafe, index) => {
      const status = cafe.accepting_orders ? '✅ ORDER NOW' : '⏳ COMING SOON'
      const marker = index < 6 ? '🎯' : '⏳'
      console.log(`${marker} ${(index + 1).toString().padStart(2)}. ${cafe.name.padEnd(20)} | ${status}`)
    })
    console.log('='.repeat(70))
    
    // Show summary
    const totalCafes = updatedCafes.length
    const acceptingOrders = updatedCafes.filter(c => c.accepting_orders).length
    const comingSoon = updatedCafes.filter(c => !c.accepting_orders).length
    
    console.log(`\n📊 SUMMARY:`)
    console.log(`   Total Cafes: ${totalCafes}`)
    console.log(`   Accepting Orders: ${acceptingOrders} (Order Now buttons)`)
    console.log(`   Coming Soon: ${comingSoon} (Coming Soon buttons)`)
    
    console.log('\n🎉 SUCCESS! First 6 cafes now accept orders, rest show "Coming Soon"')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

setFirstSixCafesAcceptingOrders()
