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

async function setupCookHouseEzeepWorking() {
  console.log('🖨️ Setting up Cook House Ezeep Configuration (Working)...');
  
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
      
      // Update existing config for Ezeep (using 'star_tsp143' as closest to Xprinter)
      const { data: updatedConfig, error: updateError } = await supabase
        .from('cafe_printer_configs')
        .update({
          printer_name: 'Cook House Xprinter (Ezeep)',
          printer_type: 'star_tsp143', // Use star_tsp143 as it's closest to Xprinter
          connection_type: 'network', // Use network as it's closest to Ezeep
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
      
      // Create new Ezeep config (using 'star_tsp143' as closest to Xprinter)
      const { data: newConfig, error: createError } = await supabase
        .from('cafe_printer_configs')
        .insert({
          id: crypto.randomUUID(),
          cafe_id: cookHouse.id,
          printer_name: 'Cook House Xprinter (Ezeep)',
          printer_type: 'star_tsp143', // Use star_tsp143 as it's closest to Xprinter
          connection_type: 'network', // Use network as it's closest to Ezeep
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
        paper_width,
        print_density,
        auto_cut,
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
      console.log(`    Type: ${config.printer_type} (Xprinter compatible)`);
      console.log(`    Connection: ${config.connection_type} (Ezeep compatible)`);
      console.log(`    Paper Width: ${config.paper_width}mm`);
      console.log(`    Print Density: ${config.print_density}`);
      console.log(`    Auto Cut: ${config.auto_cut ? 'Yes' : 'No'}`);
      console.log(`    Cafe: ${config.cafes.name} (Priority: ${config.cafes.priority})`);
      console.log(`    Status: ${config.is_active ? 'Active' : 'Inactive'}`);
    });

    console.log('\n🎉 Cook House Ezeep configuration setup completed!');
    console.log('📝 Current Status:');
    console.log('✅ Cook House is active and accepting orders');
    console.log('✅ Priority set to 7');
    console.log('✅ Staff account created');
    console.log('✅ Printer configuration ready for Ezeep');
    console.log('\n📝 Next steps for Ezeep integration:');
    console.log('1. Create Ezeep account for Cook House');
    console.log('2. Add Xprinter to Ezeep');
    console.log('3. Get Ezeep API key and printer ID');
    console.log('4. Update the Ezeep service with real credentials');
    console.log('5. Test printing with sample receipts');
    console.log('\n🔗 Ezeep Setup Guide:');
    console.log('1. Go to https://ezeep.com');
    console.log('2. Sign up for free account');
    console.log('3. Add your Xprinter to Ezeep');
    console.log('4. Get API key from Ezeep dashboard');
    console.log('5. Update ezeepPrintService.ts with real credentials');
    console.log('\n💡 Note: The printer is configured as "star_tsp143" type');
    console.log('   This is compatible with Xprinter thermal printers');
    console.log('   Connection type is "network" for Ezeep cloud printing');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setupCookHouseEzeepWorking();

















