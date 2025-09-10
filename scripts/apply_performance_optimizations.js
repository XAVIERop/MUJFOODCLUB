import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase configuration
const supabaseUrl = 'https://mghheqvtuqjqjqjqjqjq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyOptimizations() {
  console.log('🚀 Starting performance optimizations...');
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync('scripts/performance_optimization.sql', 'utf8');
    
    // Split into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} optimization statements`);
    
    // Apply each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Applying statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.log(`⚠️  Statement ${i + 1} had an issue:`, error.message);
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} applied successfully`);
          }
        } catch (err) {
          console.log(`❌ Error in statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('🎉 Performance optimizations completed!');
    
  } catch (error) {
    console.error('❌ Error applying optimizations:', error);
  }
}

// Run the optimizations
applyOptimizations();
