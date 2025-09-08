#!/usr/bin/env node

/**
 * Setup Ezeep for Cook House
 * This script helps configure Ezeep printing for Cook House cafe
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupEzeepForCookHouse() {
  console.log('🚀 Setting up Ezeep for Cook House...\n');

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

    // Step 2: Check existing printer config
    console.log('📋 Step 2: Checking existing printer configuration...');
    const { data: existingConfig, error: configError } = await supabase
      .from('cafe_printer_configs')
      .select('*')
      .eq('cafe_id', cookHouse.id)
      .eq('is_active', true);

    if (configError) {
      console.error('❌ Error checking printer config:', configError.message);
      return;
    }

    if (existingConfig && existingConfig.length > 0) {
      console.log('⚠️  Existing printer configuration found:');
      existingConfig.forEach(config => {
        console.log(`   - ${config.printer_name} (${config.connection_type})`);
        console.log(`     Ezeep API Key: ${config.ezeep_api_key ? 'Set' : 'Not set'}`);
        console.log(`     Ezeep Printer ID: ${config.ezeep_printer_id || 'Not set'}`);
      });
      console.log('');
    } else {
      console.log('ℹ️  No existing printer configuration found.\n');
    }

    // Step 3: Interactive setup
    console.log('📋 Step 3: Ezeep Configuration Setup');
    console.log('=' .repeat(50));
    console.log('');
    console.log('To complete the setup, you need:');
    console.log('1. Ezeep API Key (from https://developer.ezeep.com/)');
    console.log('2. Ezeep Printer ID (from Ezeep Desktop app)');
    console.log('');
    console.log('Once you have these, run this script with the parameters:');
    console.log('node scripts/setup_ezeep_cookhouse.js --api-key YOUR_API_KEY --printer-id YOUR_PRINTER_ID');
    console.log('');
    console.log('Or use the interactive mode:');
    console.log('node scripts/setup_ezeep_cookhouse.js --interactive');
    console.log('');

    // Check if parameters are provided
    const args = process.argv.slice(2);
    const apiKeyIndex = args.indexOf('--api-key');
    const printerIdIndex = args.indexOf('--printer-id');
    const interactiveIndex = args.indexOf('--interactive');

    if (interactiveIndex !== -1) {
      await interactiveSetup(cookHouse.id);
    } else if (apiKeyIndex !== -1 && printerIdIndex !== -1) {
      const apiKey = args[apiKeyIndex + 1];
      const printerId = args[printerIdIndex + 1];
      
      if (!apiKey || !printerId) {
        console.error('❌ Both --api-key and --printer-id are required');
        return;
      }

      await configureEzeep(cookHouse.id, apiKey, printerId);
    } else {
      console.log('💡 Use --help to see all available options');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

async function interactiveSetup(cafeId) {
  console.log('🔧 Interactive Ezeep Setup');
  console.log('=' .repeat(30));
  console.log('');
  
  // This would require readline for interactive input
  // For now, just show instructions
  console.log('Interactive mode not implemented yet.');
  console.log('Please use the command line parameters instead.');
  console.log('');
  console.log('Example:');
  console.log('node scripts/setup_ezeep_cookhouse.js --api-key "your_api_key" --printer-id "your_printer_id"');
}

async function configureEzeep(cafeId, apiKey, printerId) {
  console.log('🔧 Configuring Ezeep for Cook House...\n');

  try {
    // Check if config already exists
    const { data: existingConfig, error: checkError } = await supabase
      .from('cafe_printer_configs')
      .select('id')
      .eq('cafe_id', cafeId)
      .eq('is_active', true)
      .single();

    let configId;
    if (existingConfig) {
      // Update existing config
      console.log('📝 Updating existing printer configuration...');
      const { data: updateData, error: updateError } = await supabase
        .from('cafe_printer_configs')
        .update({
          ezeep_api_key: apiKey,
          ezeep_printer_id: printerId,
          connection_type: 'ezeep_cloud',
          printer_type: 'xprinter_thermal',
          updated_at: new Date().toISOString()
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
        .insert({
          cafe_id: cafeId,
          printer_name: 'Cook House Xprinter',
          printer_type: 'xprinter_thermal',
          connection_type: 'ezeep_cloud',
          ezeep_api_key: apiKey,
          ezeep_printer_id: printerId,
          is_active: true,
          is_default: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
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
    console.log('🎉 Ezeep setup completed for Cook House!');
    console.log('');
    console.log('Configuration Details:');
    console.log(`   Cafe ID: ${cafeId}`);
    console.log(`   Config ID: ${configId}`);
    console.log(`   API Key: ${apiKey.substring(0, 10)}...`);
    console.log(`   Printer ID: ${printerId}`);
    console.log('');
    console.log('Next Steps:');
    console.log('1. Test the setup by placing an order from Cook House');
    console.log('2. Try printing KOT and Receipt from POS dashboard');
    console.log('3. Check if your Xprinter receives the print jobs');
    console.log('');

  } catch (error) {
    console.error('❌ Configuration failed:', error.message);
  }
}

// Show help
if (process.argv.includes('--help')) {
  console.log('Ezeep Setup for Cook House');
  console.log('=' .repeat(30));
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/setup_ezeep_cookhouse.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --api-key <key>      Ezeep API key');
  console.log('  --printer-id <id>    Ezeep printer ID');
  console.log('  --interactive        Interactive setup mode');
  console.log('  --help               Show this help');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/setup_ezeep_cookhouse.js --api-key "abc123" --printer-id "printer456"');
  console.log('  node scripts/setup_ezeep_cookhouse.js --interactive');
  console.log('');
  process.exit(0);
}

// Run the setup
setupEzeepForCookHouse();
