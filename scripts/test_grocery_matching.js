// scripts/test_grocery_matching.js
// Test the grocery image matching to see what's going wrong

import dotenv from 'dotenv';
import ImageKit from 'imagekit';

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT
});

// Sample product names from your database (we'll get these from Supabase)
const SAMPLE_PRODUCTS = [
  'Lays Classic',
  'Coca Cola',
  'Maggi Noodles',
  'Cadbury Dairy Milk',
  'Oreo Biscuits',
  'Parle-G',
  'Britannia Good Day',
  'Hide & Seek',
  'Sunfeast Dark Fantasy',
  'Monster Energy Drink',
  'Red Bull',
  'Gatorade',
  'Fanta',
  'Limca',
  'Thumbs Up',
  'Pepsi',
  'Sprite',
  'Mountain Dew',
  '7UP',
  'Mirinda'
];

// List of all your actual image names
const GROCERY_IMAGES = [
  '2pm kimchi.jpeg',
  'ACT II caramel popcorn.webp',
  'Balaji Bhujai Sev.webp',
  'Balaji Masala Waffers.avif',
  'Britannai MarieGold.jpeg',
  'boat-aamras-mango.webp',
  'Cadbury Gems.avif',
  'Fanta 500ml.jpeg',
  'Cadbury Eclairs.webp',
  'Coco cola can 300ml.jpeg',
  'Maggi Original.jpeg',
  'Iced Frappe 180ml.jpeg',
  'Budlak Black.jpeg',
  'Gatorade blue 500ml.webp',
  'Caramel Latte 180ml.webp',
  'Crax Curls Yellow.jpeg',
  'Nescafe Intense Café 180ml.jpeg',
  'Monster Ultra Watermelon.jpeg',
  'drinks main photo.jpg',
  'Monster Ultra Rose.jpeg',
  'Britannai Bourbon.jpeg',
  'Coco Cola 750ml.webp',
  'ACT II classic Salted.webp',
  'mogu-mogu-melon.webp',
  'Choco LATTE 180ML.webp',
  'chips main photo.webp',
  'Cadbury 5 star.jpg',
  'britannia-good-day-.jpg',
  'Masala Ready To eat.jpeg',
  'Hide&Seek chocolate chocochip.jpeg',
  'Malkist Biscuit.jpeg',
  'Dairy Milk.webp',
  'Oreo Original.jpeg',
  'Britannai JimJam.jpeg',
  'Hide &Seek bourbon.jpeg',
  'Hide&Seek fab orange.jpeg',
  'Nestle Bar One.png',
  'Balaji Salted waffers.jpg',
  'Budlak Red.jpeg',
  'Maggi Cup Noodle.jpeg',
  'Gatorade green 500ml.webp',
  'Coco cola zero sugar can 300nml.jpeg',
  'Parle 20-20.jpeg',
  'Budlak Yellow.jpeg',
  'Bingo Mad Angles Masala.webp',
  'paper-boat-guava.jpg',
  'mogu-mogu-juice-mango.webp',
  'paper-boat-anarpomegranate.webp',
  'Mogu mogu apple.webp',
  'McVite Digestive Biscuit.jpeg',
  'Mother Dairy Full Cream Milk.jpeg',
  'paper-boat-lemon-lime-sparkling-water.webp',
  'Gatorade orange 500ml.webp',
  'Lays American CreamOnion.webp',
  'paper-boat-lychee.webp',
  'Crax Corn Rings.webp',
  'mogu mogu pineapple.webp',
  'Nescafe cold coffee 180ml.webp',
  'Nachos Cheese.webp',
  'Coco Cola diet.jpeg',
  'Cadbury Perk.webp',
  'mogu-mogu-orange.jpg',
  'Limca 750ml.jpeg',
  'Ocean Lynchee.webp',
  'Mogu mogu blackcurrent.webp',
  'Bournville.webp',
  'Kurkure chilli chatka red.jpg',
  'Coco Cola Zero sugar 700ml.webp',
  'Budlak Pink.jpg',
  'Parle Krackjack.jpeg',
  'Oreo Choc Cream.png',
  'ocean-fruit-water-pink-guava-flavour.webp',
  'paper-boat-orange.webp',
  'KitKat.webp',
  'chupa-chups-lollipop.webp',
  'Haldiram Moong Dal.jpg',
  'Monster Mango loco.jpeg',
  'Kurkure green chutney.webp',
  'Lays Tomato Tango.webp',
  'Ocean Strawberry.webp',
  'Parle Marie Biscuit.jpeg',
  'Paperboat coconut water 200ml.webp',
  'Kurkure masala munch orange.webp',
  'Kelloggs Chocos.jpg',
  'Nimbooz 350ml.webp',
  'Lays Magic Masala.webp',
  'Mentos.png',
  'Hide&Seek Fab Strawberry.webp',
  'Munch.jpg',
  'mogu-juice-strawberry.webp',
  'Lotte Choco Pie.jpeg',
  'Ocean Peach.webp',
  'Balaji Tomato Waffers.webp',
  'Crax Curls Blue.jpeg',
  'Bingo Yumitos Slated.jpg',
  'Lays Salted.webp',
  'Ocean Apple.jpeg',
  'Mother Dairy Double toned.webp',
  'Ocean Mango.webp',
  'Cadbury Fuse.jpg',
  'Parle Monaco.jpeg',
  'Pringles Original.jpg',
  'Puffcorn.webp',
  'pulse-candy-.webp',
  'RedBull red.webp',
  'Sunfeast Dark Fantasy.jpeg',
  'Redbull yellow.webp',
  'Sunfeast MOM_S Magic.jpeg',
  'Redbull zero sugar.webp',
  'Too much multigrain green.jpeg',
  'Sweet Laasi 180ml.webp',
  'Too Yum Multigrain Chips.jpg',
  'Uncle Chips.webp',
  'Parle-G.jpeg',
  'WinKin cow milkshake.jpg',
  'Thumbs Up.webp',
  'Tagz Ragi.jpg',
  'RedBull.png'
];

function findBestImageMatch(productName) {
  const normalizedProductName = productName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  console.log(`\n🔍 Testing: "${productName}"`);
  console.log(`   Normalized: "${normalizedProductName}"`);

  // Try exact match first
  for (const imageName of GROCERY_IMAGES) {
    const normalizedImageName = imageName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (normalizedImageName === normalizedProductName) {
      console.log(`   ✅ EXACT MATCH: ${imageName}`);
      return imageName;
    }
  }

  // Try partial matches
  const partialMatches = [];
  for (const imageName of GROCERY_IMAGES) {
    const normalizedImageName = imageName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const productWords = normalizedProductName.split(' ');
    const imageWords = normalizedImageName.split(' ');
    
    const matchingWords = productWords.filter(word => 
      imageWords.some(imgWord => imgWord.includes(word) || word.includes(imgWord))
    );
    
    if (matchingWords.length >= Math.min(2, productWords.length)) {
      partialMatches.push({
        image: imageName,
        matches: matchingWords,
        score: matchingWords.length
      });
    }
  }

  if (partialMatches.length > 0) {
    // Sort by score (most matches first)
    partialMatches.sort((a, b) => b.score - a.score);
    const bestMatch = partialMatches[0];
    console.log(`   ⚠️  PARTIAL MATCH: ${bestMatch.image} (${bestMatch.matches.join(', ')})`);
    return bestMatch.image;
  }

  console.log(`   ❌ NO MATCH FOUND`);
  return null;
}

async function testMatching() {
  console.log('🧪 Testing Grocery Image Matching\n');
  console.log('=' * 50);
  
  for (const product of SAMPLE_PRODUCTS) {
    const match = findBestImageMatch(product);
    if (match) {
      console.log(`   📸 Image: ${match}`);
    }
    console.log('   ' + '-'.repeat(40));
  }
  
  console.log('\n📊 Summary:');
  console.log(`- Tested ${SAMPLE_PRODUCTS.length} products`);
  console.log(`- Available images: ${GROCERY_IMAGES.length}`);
  
  // Show some obvious matches that should work
  console.log('\n🎯 Obvious matches that should work:');
  const obviousMatches = [
    { product: 'Lays Classic', expected: 'Lays Salted.webp' },
    { product: 'Coca Cola', expected: 'Coco Cola 750ml.webp' },
    { product: 'Maggi Noodles', expected: 'Maggi Original.jpeg' },
    { product: 'Cadbury Dairy Milk', expected: 'Dairy Milk.webp' },
    { product: 'Oreo Biscuits', expected: 'Oreo Original.jpeg' }
  ];
  
  for (const test of obviousMatches) {
    const match = findBestImageMatch(test.product);
    const isCorrect = match === test.expected;
    console.log(`   ${isCorrect ? '✅' : '❌'} "${test.product}" → ${match || 'NO MATCH'} (expected: ${test.expected})`);
  }
}

testMatching();
