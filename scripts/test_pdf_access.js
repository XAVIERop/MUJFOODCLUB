#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

console.log('🔍 Testing PDF file accessibility...\n');

// Find all PDF files
const pdfFiles = fs.readdirSync(publicDir)
  .filter(file => file.endsWith('.pdf') && !file.includes('_original'))
  .map(file => ({
    name: file,
    path: path.join(publicDir, file),
    size: fs.statSync(path.join(publicDir, file)).size
  }));

console.log(`📁 Found ${pdfFiles.length} PDF files:`);

pdfFiles.forEach(pdf => {
  const sizeMB = (pdf.size / 1024 / 1024).toFixed(2);
  const accessible = fs.existsSync(pdf.path);
  const status = accessible ? '✅' : '❌';
  
  console.log(`${status} ${pdf.name} - ${sizeMB} MB`);
});

console.log('\n🌐 Testing URLs:');
const baseUrl = 'http://localhost:8081'; // or your production URL

pdfFiles.forEach(pdf => {
  const url = `${baseUrl}/${pdf.name}`;
  console.log(`📄 ${url}`);
});

console.log('\n🎯 Recommendations:');
console.log('1. Test each URL in browser to ensure 200 response');
console.log('2. Check if PDFs load in iframe (Google/PDF.js viewers)');
console.log('3. Verify direct PDF access works');
console.log('4. Check browser console for any CSP violations');
