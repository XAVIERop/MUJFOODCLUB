// Script to generate QR codes for all cafe tables
// This will create QR codes that can be printed and placed on tables

import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateQRCodes() {
  try {
    console.log('🚀 Starting QR code generation for cafe tables...');
    
    // Fetch all cafe tables
    const { data: tables, error } = await supabase
      .from('cafe_tables')
      .select(`
        id,
        table_number,
        qr_code,
        cafes!inner(
          id,
          name,
          location
        )
      `)
      .order('cafes.name')
      .order('table_number');

    if (error) {
      console.error('❌ Error fetching tables:', error);
      return;
    }

    if (!tables || tables.length === 0) {
      console.log('⚠️  No tables found. Please run the database migration first.');
      return;
    }

    console.log(`📊 Found ${tables.length} tables across ${new Set(tables.map(t => t.cafes.name)).size} cafes`);

    // Create output directory
    const outputDir = path.join(process.cwd(), 'qr-codes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate QR codes for each table
    for (const table of tables) {
      const cafe = table.cafes;
      const qrData = `${supabaseUrl}/menu/${cafe.id}?table=${table.id}&dine_in=true`;
      
      try {
        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // Save QR code image
        const fileName = `${cafe.name.replace(/[^a-zA-Z0-9]/g, '_')}_${table.table_number.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        const filePath = path.join(outputDir, fileName);
        
        // Convert data URL to buffer and save
        const base64Data = qrCodeDataURL.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);

        console.log(`✅ Generated QR code for ${cafe.name} - ${table.table_number}`);
        console.log(`   📁 Saved: ${fileName}`);
        console.log(`   🔗 URL: ${qrData}`);
        console.log('');

      } catch (error) {
        console.error(`❌ Error generating QR code for ${cafe.name} - ${table.table_number}:`, error);
      }
    }

    // Generate summary HTML file
    const htmlContent = generateSummaryHTML(tables);
    const summaryPath = path.join(outputDir, 'qr-codes-summary.html');
    fs.writeFileSync(summaryPath, htmlContent);

    console.log('🎉 QR code generation complete!');
    console.log(`📁 All files saved to: ${outputDir}`);
    console.log(`📄 Summary: ${summaryPath}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

function generateSummaryHTML(tables) {
  const cafes = [...new Set(tables.map(t => t.cafes.name))];
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Codes Summary - MUJ Food Club</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .cafe-section { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .table-item { margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 4px; }
        .qr-info { font-size: 14px; color: #666; }
        .cafe-name { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; }
    </style>
</head>
<body>
    <h1>🍽️ MUJ Food Club - Table QR Codes</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    <p>Total Tables: ${tables.length} | Total Cafes: ${cafes.length}</p>
    
    ${cafes.map(cafeName => {
      const cafeTables = tables.filter(t => t.cafes.name === cafeName);
      return `
        <div class="cafe-section">
          <div class="cafe-name">${cafeName}</div>
          <p>Location: ${cafeTables[0].cafes.location}</p>
          ${cafeTables.map(table => `
            <div class="table-item">
              <strong>${table.table_number}</strong>
              <div class="qr-info">
                QR Code: ${table.qr_code}<br>
                File: ${cafeName.replace(/[^a-zA-Z0-9]/g, '_')}_${table.table_number.replace(/[^a-zA-Z0-9]/g, '_')}.png
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('')}
    
    <hr>
    <p><strong>Instructions:</strong></p>
    <ol>
      <li>Print each QR code and place on the corresponding table</li>
      <li>Students can scan the QR code to order food for that specific table</li>
      <li>QR codes automatically open the cafe menu with dine-in option selected</li>
    </ol>
</body>
</html>
  `;
}

// Run the script
generateQRCodes();
