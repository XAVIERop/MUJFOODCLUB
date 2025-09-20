import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_URL environment variable');
  process.exit(1);
}
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupCookHouseEzeep() {
  console.log('🖨️ Setting up Cook House Ezeep Configuration...');
  
  try {
    // 1. Get Cook House cafe ID
    console.log('\n🔍 Getting Cook House cafe ID...');
    const { data: cookHouse, error: cafeError } = await supabase
      .from('cafes')
      .select('id, name, priority')
      .ilike('name', '%cook house%')
      .single();

    if (cafeError || !cookHouse) {
      console.error('❌ Error finding Cook House:', cafeError);
      return;
    }

    console.log('✅ Cook House found:', cookHouse);

    // 2. Check if printer config already exists
    console.log('\n🔍 Checking existing printer configuration...');
    const { data: existingConfig, error: configCheckError } = await supabase
      .from('cafe_printer_configs')
      .select('*')
      .eq('cafe_id', cookHouse.id)
      .eq('is_default', true)
      .single();

    if (existingConfig) {
      console.log('✅ Printer config already exists, updating for Ezeep...');
      
      // Update existing config for Ezeep
      const { data: updatedConfig, error: updateError } = await supabase
        .from('cafe_printer_configs')
        .update({
          printer_name: 'Cook House Xprinter',
          printer_type: 'xprinter_thermal',
          connection_type: 'ezeep_cloud',
          ezeep_printer_id: 'COOKHOUSE_XPRINTER_001', // Placeholder
          ezeep_api_key: 'COOKHOUSE_EZEEP_API_KEY', // Placeholder
          paper_width: 80,
          print_density: 8,
          auto_cut: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating printer config:', updateError);
        return;
      }

      console.log('✅ Printer config updated:', updatedConfig);
    } else {
      console.log('🆕 Creating new Ezeep printer configuration...');
      
      // Create new Ezeep config
      const { data: newConfig, error: createError } = await supabase
        .from('cafe_printer_configs')
        .insert({
          id: crypto.randomUUID(),
          cafe_id: cookHouse.id,
          printer_name: 'Cook House Xprinter',
          printer_type: 'xprinter_thermal',
          connection_type: 'ezeep_cloud',
          ezeep_printer_id: 'COOKHOUSE_XPRINTER_001', // Placeholder
          ezeep_api_key: 'COOKHOUSE_EZEEP_API_KEY', // Placeholder
          paper_width: 80,
          print_density: 8,
          auto_cut: true,
          is_active: true,
          is_default: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating printer config:', createError);
        return;
      }

      console.log('✅ Printer config created:', newConfig);
    }

    // 3. Verify the configuration
    console.log('\n🔍 Verifying Cook House Ezeep configuration...');
    const { data: verification, error: verifyError } = await supabase
      .from('cafe_printer_configs')
      .select(`
        id,
        printer_name,
        printer_type,
        connection_type,
        ezeep_printer_id,
        ezeep_api_key,
        is_active,
        is_default,
        cafes!inner(
          id,
          name,
          priority
        )
      `)
      .eq('cafe_id', cookHouse.id)
      .eq('is_active', true);

    if (verifyError) {
      console.error('❌ Error verifying configuration:', verifyError);
      return;
    }

    console.log('✅ Cook House Ezeep configuration verified:');
    verification.forEach(config => {
      console.log(`  - Printer: ${config.printer_name}`);
      console.log(`    Type: ${config.printer_type}`);
      console.log(`    Connection: ${config.connection_type}`);
      console.log(`    Ezeep Printer ID: ${config.ezeep_printer_id}`);
      console.log(`    Ezeep API Key: ${config.ezeep_api_key ? 'Set' : 'Not set'}`);
      console.log(`    Cafe: ${config.cafes.name} (Priority: ${config.cafes.priority})`);
      console.log(`    Status: ${config.is_active ? 'Active' : 'Inactive'}`);
    });

    console.log('\n🎉 Cook House Ezeep configuration setup completed!');
    console.log('📝 Next steps:');
    console.log('1. Create Ezeep account for Cook House');
    console.log('2. Get Ezeep API key and printer ID');
    console.log('3. Update the configuration with real values:');
    console.log('   - ezeep_api_key: Your actual Ezeep API key');
    console.log('   - ezeep_printer_id: Your actual Ezeep printer ID');
    console.log('4. Test printing with sample receipts');
    console.log('\n🔗 Ezeep Setup Guide:');
    console.log('1. Go to https://ezeep.com');
    console.log('2. Sign up for free account');
    console.log('3. Add your Xprinter to Ezeep');
    console.log('4. Get API key from Ezeep dashboard');
    console.log('5. Update the configuration in database');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setupCookHouseEzeep();







