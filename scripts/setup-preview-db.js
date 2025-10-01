// Setup basic schema for preview database
import { createClient } from '@supabase/supabase-js';

const PREVIEW_SUPABASE_URL = 'https://dhjcxipqcfbqleabtcwk.supabase.co';
const PREVIEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoamN4aXBxY2ZicWxlYWJ0Y3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMjM1MTEsImV4cCI6MjA3NDg5OTUxMX0.yp5R2ldlN-yg8yzI_5eJH1pqx7wbtbAIGfmz7cJcb0o';

const supabase = createClient(PREVIEW_SUPABASE_URL, PREVIEW_SUPABASE_ANON_KEY);

async function setupDatabase() {
  console.log('🏗️ Setting up preview database schema...');

  try {
    // Create cafes table
    console.log('📦 Creating cafes table...');
    const { error: cafesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.cafes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT DEFAULT 'restaurant',
          location TEXT,
          phone TEXT,
          hours TEXT,
          description TEXT,
          accepting_orders BOOLEAN DEFAULT true,
          is_active BOOLEAN DEFAULT true,
          priority INTEGER DEFAULT 0,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (cafesError) {
      console.error('❌ Error creating cafes table:', cafesError);
      return;
    }

    console.log('✅ Cafes table created');

    // Create menu_items table
    console.log('🍽️ Creating menu_items table...');
    const { error: menuError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.menu_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          cafe_id UUID REFERENCES public.cafes(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          category TEXT,
          subcategory TEXT,
          price DECIMAL(10,2) NOT NULL,
          description TEXT,
          is_available BOOLEAN DEFAULT true,
          image_url TEXT,
          brand TEXT,
          unit TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (menuError) {
      console.error('❌ Error creating menu_items table:', menuError);
      return;
    }

    console.log('✅ Menu items table created');

    // Enable RLS
    console.log('🔒 Enabling RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.cafes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
        
        -- Allow public read access
        CREATE POLICY "Allow public read access to cafes" ON public.cafes FOR SELECT USING (true);
        CREATE POLICY "Allow public read access to menu_items" ON public.menu_items FOR SELECT USING (true);
      `
    });

    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
      return;
    }

    console.log('✅ RLS enabled');

    console.log('\n🎉 Preview database setup complete!');
    console.log('📱 You can now add grocery data');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupDatabase();
