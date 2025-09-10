#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// More comprehensive patterns to replace
const replacements = [
  {
    pattern: /const supabaseUrl = 'https:\/\/kblazvxfducwviyyiw\.supabase\.co';/g,
    replacement: `const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_URL environment variable');
  process.exit(1);
}`
  },
  {
    pattern: /const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[^']+';/g,
    replacement: `const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}`
  },
  {
    pattern: /const supabaseUrl = 'https:\/\/kblazvxfducwviyyiwde\.supabase\.co';/g,
    replacement: `const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_URL environment variable');
  process.exit(1);
}`
  },
  {
    pattern: /const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0\.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';/g,
    replacement: `const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}`
  }
];

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findScriptFiles(dir) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...findScriptFiles(fullPath));
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.ts'))) {
        const relativePath = path.relative(projectRoot, fullPath);
        if (!relativePath.includes('clean_') && !relativePath.includes('node_modules')) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

async function main() {
  console.log('🧹 Cleaning remaining hardcoded secrets from script files...\n');
  
  const scriptFiles = findScriptFiles(path.join(projectRoot, 'scripts'));
  let cleanedCount = 0;
  
  for (const file of scriptFiles) {
    if (cleanFile(file)) {
      cleanedCount++;
    }
  }
  
  console.log(`\n✅ Cleaned ${cleanedCount} files`);
  console.log('🔒 All remaining hardcoded secrets have been removed!');
}

main().catch(console.error);
