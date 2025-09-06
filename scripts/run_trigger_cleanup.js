// Run trigger cleanup script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runScript() {
  try {
    const script = fs.readFileSync('fix_order_triggers_clean.sql', 'utf8');
    
    console.log('🧹 Cleaning up order triggers...');
    
    // Split script into individual statements
    const statements = script.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) {
          console.error('Error:', error);
        }
      }
    }
    
    console.log('✅ Order triggers cleaned up successfully!');
  } catch (err) {
    console.error('Error:', err);
  }
}

runScript();
