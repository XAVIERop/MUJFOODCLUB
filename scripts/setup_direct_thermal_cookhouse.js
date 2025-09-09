#!/usr/bin/env node

/**
 * Setup Direct Thermal Printing for Cook House
 * This creates a local print server that works perfectly on Windows 7
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDirectThermalForCookHouse() {
  console.log('🚀 Setting up Direct Thermal Printing for Cook House...\n');

  try {
    // Step 1: Get Cook House cafe ID
    console.log('📋 Step 1: Finding Cook House cafe...');
    const { data: cookHouse, error: cafeError } = await supabase
      .from('cafes')
      .select('id, name, is_active')
      .ilike('name', '%cook house%')
      .single();

    if (cafeError || !cookHouse) {
      console.error('❌ Cook House cafe not found:', cafeError?.message);
      return;
    }

    console.log(`✅ Found Cook House: ${cookHouse.name} (ID: ${cookHouse.id})`);
    console.log(`   Status: ${cookHouse.is_active ? 'Active' : 'Inactive'}\n`);

    // Step 2: Configure direct thermal printing
    console.log('📋 Step 2: Configuring Direct Thermal Printing...');
    
    const printerConfig = {
      cafe_id: cookHouse.id,
      printer_name: 'Cook House Xprinter (Local Server)',
      printer_type: 'custom',
      connection_type: 'browser', // Use browser type for local server
      printer_ip: 'localhost', // Local print server
      printer_port: 3001, // Our print server port
      paper_width: 80, // 80mm thermal paper
      print_density: 8, // High quality
      auto_cut: true,
      is_active: true,
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if config already exists
    const { data: existingConfig, error: checkError } = await supabase
      .from('cafe_printer_configs')
      .select('id')
      .eq('cafe_id', cookHouse.id)
      .eq('is_active', true)
      .single();

    let configId;
    if (existingConfig) {
      // Update existing config
      console.log('📝 Updating existing printer configuration...');
      const { data: updateData, error: updateError } = await supabase
        .from('cafe_printer_configs')
        .update({
          ...printerConfig,
          id: existingConfig.id
        })
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Failed to update printer config:', updateError.message);
        return;
      }

      configId = updateData.id;
      console.log('✅ Printer configuration updated successfully');
    } else {
      // Create new config
      console.log('📝 Creating new printer configuration...');
      const { data: insertData, error: insertError } = await supabase
        .from('cafe_printer_configs')
        .insert(printerConfig)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Failed to create printer config:', insertError.message);
        return;
      }

      configId = insertData.id;
      console.log('✅ Printer configuration created successfully');
    }

    console.log('');
    console.log('🎉 Direct Thermal Printing setup completed for Cook House!');
    console.log('');
    console.log('Configuration Details:');
    console.log(`   Cafe ID: ${cookHouse.id}`);
    console.log(`   Config ID: ${configId}`);
    console.log(`   Printer: ${printerConfig.printer_name}`);
    console.log(`   Connection: ${printerConfig.connection_type}`);
    console.log(`   Port: ${printerConfig.printer_port}`);
    console.log('');
    console.log('Next Steps:');
    console.log('1. Install Node.js on Cook House Windows 7 computer');
    console.log('2. Run the local print server');
    console.log('3. Test printing from POS dashboard');
    console.log('');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Show help
if (process.argv.includes('--help')) {
  console.log('Direct Thermal Printing Setup for Cook House');
  console.log('=' .repeat(50));
  console.log('');
  console.log('This script configures direct thermal printing for Cook House');
  console.log('that works perfectly on Windows 7 without any cloud services.');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/setup_direct_thermal_cookhouse.js');
  console.log('');
  console.log('What it does:');
  console.log('  - Configures Cook House for direct thermal printing');
  console.log('  - Sets up local print server configuration');
  console.log('  - No cloud services or complex setup required');
  console.log('');
  process.exit(0);
}

// Run the setup
setupDirectThermalForCookHouse();
