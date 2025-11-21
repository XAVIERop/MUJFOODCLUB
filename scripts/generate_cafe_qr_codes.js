// Script to generate one QR code per cafe for dine-in
// This creates a single QR code that opens the cafe with dine-in pre-selected

import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Production website URL for QR codes
const PRODUCTION_URL = 'https://mujfoodclub.in';

async function generateCafeQRCodes() {
  try {
    console.log('🏪 Starting QR code generation for cafes...\n');
    
    // Fetch all active cafes
    const { data: cafes, error } = await supabase
      .from('cafes')
      .select('id, name, location, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Error fetching cafes:', error);
      return;
    }

    if (!cafes || cafes.length === 0) {
      console.log('⚠️  No active cafes found.');
      return;
    }

    console.log(`📊 Found ${cafes.length} active cafes`);

    // Create output directory
    const outputDir = path.join(process.cwd(), 'cafe-qr-codes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate QR codes for each cafe
    for (const cafe of cafes) {
      const qrData = `${PRODUCTION_URL}/menu/${cafe.id}?dine_in=true`;
      
      try {
        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // Save QR code image
        const fileName = `${cafe.name.replace(/[^a-zA-Z0-9]/g, '_')}_DineIn_QR.png`;
        const filePath = path.join(outputDir, fileName);
        
        // Convert data URL to buffer and save
        const base64Data = qrCodeDataURL.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);

        console.log(`✅ Generated QR code for ${cafe.name}`);
        console.log(`   📁 Saved: ${fileName}`);
        console.log(`   🔗 URL: ${qrData}`);
        console.log(`   📍 Location: ${cafe.location}`);
        console.log('');

      } catch (error) {
        console.error(`❌ Error generating QR code for ${cafe.name}:`, error);
      }
    }

    // Generate summary HTML file
    const htmlContent = generateSummaryHTML(cafes);
    const summaryPath = path.join(outputDir, 'cafe-qr-codes-summary.html');
    fs.writeFileSync(summaryPath, htmlContent);

    console.log('🎉 QR code generation complete!');
    console.log(`📁 All files saved to: ${outputDir}`);
    console.log(`📄 Summary: ${summaryPath}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

function generateSummaryHTML(cafes) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cafe QR Codes - MUJ Food Club</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .cafe-section { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .qr-info { font-size: 14px; color: #666; }
        .cafe-name { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .instructions { background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🍽️ MUJ Food Club - Cafe Dine-In QR Codes</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    <p>Total Cafes: ${cafes.length}</p>
    
    <div class="instructions">
      <h3>📋 Instructions:</h3>
      <ol>
        <li><strong>Print each QR code</strong> and place on tables at the respective cafe</li>
        <li><strong>Students scan QR</strong> → Opens cafe menu with "Dine In" pre-selected</li>
        <li><strong>Students enter table number</strong> manually (e.g., 5, 12, A3)</li>
        <li><strong>Place order</strong> → Food delivered to their table</li>
      </ol>
    </div>
    
    ${cafes.map(cafe => `
      <div class="cafe-section">
        <div class="cafe-name">${cafe.name}</div>
        <p><strong>Location:</strong> ${cafe.location}</p>
        <div class="qr-info">
          <strong>QR Code File:</strong> ${cafe.name.replace(/[^a-zA-Z0-9]/g, '_')}_DineIn_QR.png<br>
          <strong>URL:</strong> ${PRODUCTION_URL}/menu/${cafe.id}?dine_in=true<br>
          <strong>Usage:</strong> Print and place on all tables at this cafe
        </div>
      </div>
    `).join('')}
    
    <hr>
    <div class="instructions">
      <h3>💡 Benefits of This Approach:</h3>
      <ul>
        <li><strong>Simple Management:</strong> One QR code per cafe (not per table)</li>
        <li><strong>Flexible Table Numbers:</strong> Students can enter any table number</li>
        <li><strong>Easy Updates:</strong> No need to reprint QR codes when table layout changes</li>
        <li><strong>Cost Effective:</strong> Fewer QR codes to print and manage</li>
      </ul>
    </div>
</body>
</html>
  `;
}

// Run the script
generateCafeQRCodes();
