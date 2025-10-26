// scripts/auto_map_images.js
// Automatically map current image names to product names

import dotenv from 'dotenv';
import ImageKit from 'imagekit';

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT
});

// All product names from database
const PRODUCT_NAMES = [
  "20-20 Biscuits", "7UP", "ACT II Caramel", "ACT II Classic Salted",
  "ACT2 BUTTER POPCORN", "ACT2 CHEESE BURST POPCORN", "ACT2 SALTED POPCORN",
  "ACT2 SPICY PUDINA POPCORN", "ACT2 TOMATO CHILLI POPCORN", "Amul Fresh Paneer",
  "Amul Milk", "Balaji Bhujia Sev", "BALAJI CRUNCHEM CHAAT CHASKA",
  "BALAJI CRUNCHEM CREAM ONION", "BALAJI CRUNCHEM MASALA MASTI",
  "BALAJI CRUNCHEM SIMPLY SALTED", "BALAJI CRUNCHEX CHILLI TADKA",
  "BALAJI CRUNCHEX SIMPLY SALTED", "BALAJI CRUNCHEX TOMATO TWIST",
  "BALAJI RUMBLES", "BINGO MAD ANGLES ACHARI MASTI", "BINGO MAD ANGLES CHAT MASTI",
  "Bingo Mad Angles Masala", "BINGO MAD ANGLES MM MASALA", "BINGO MAD ANGLES PIZZA AAAAH",
  "BINGO MAD ANGLES RED ALERT", "BINGO MAD ANGLES TOMATO MADNESS",
  "BINGO MAD ANGLES VERY PERI PERI", "BINGO NACHOS CHEES NACHOS",
  "BINGO NACHOS CHILLI LEMON", "BINGO TADHE-MADHE", "Bingo Yumitos Salted",
  "Bisleri Mineral Water", "BLACK PEPSI", "Britannia Bourbon", "Britannia Good Day",
  "Britannia Jim Jam", "Britannia Marie Gold", "Britannia Treat",
  "Britannia Treat Wafers", "Cadbury 5 Star", "Cadbury Bournville",
  "Cadbury Dairy Milk", "Cadbury Eclairs", "Cadbury Fuse", "Cadbury Gems",
  "Cadbury Perk", "Ching's Secret Noodles", "CHOCO-CHOCO", "Chupa Chups Lollipop",
  "Coca Cola", "Coca Cola 750ml", "Coca Cola Can 300ml", "Coca Cola Diet",
  "Coca Cola Zero Sugar 750ml", "Coca Cola Zero Sugar Can 300ml", "COKE",
  "COKE (LARGE)", "Colgate Toothpaste", "CORNITOS JALAPENO", "CORNITOS PERI PERI",
  "CORNITOS SALSA", "CORNITOS SEA SALT", "CORNITOS THAI", "CORNITOS TIKKA MASALA",
  "CORNITOS TOMATO", "CRAX CARLS CHATPATA MASALA", "CRAX CHEES BALLS",
  "Crax Corn Rings", "Crax Curls Blue", "Crax Curls Yellow", "CRAX NATKHAT CLASSIC",
  "CRAX NATKHAT MASALA", "CREAM BELL KESAR BADAM VANILA", "Dark Fantasy",
  "DEW", "DEW (LARGE)", "DIET COKE", "Doritos Nacho Cheese", "Dove Soap",
  "DS Group Pulse", "English Oven Maida", "FANTA", "FANTA (300ML)", "Fanta 500ml",
  "Gatorade Blue Bolt 500ml", "Gatorade Lemon 500ml", "Gatorade Orange 500ml",
  "Haldiram Moong Dal", "Harvest Gold Atta Bread", "Hide & Seek Bourbon",
  "Hide & Seek Chocochip", "Hide & Seek Chocolate", "Hide & Seek Fab Strawberry",
  "Hide & Seek Orange", "IIPM Kimchi Noodles", "Kelloggs Chocos", "Kettle Potato Chips",
  "Krackjack", "Kurkure Chilli Chatka (Red)", "Kurkure Green Chutney (Green)",
  "Kurkure Masala Munch (Orange)", "Lays American Style Cream & Onion",
  "LAYS CHILLI LIMKA", "Lays Classic Salted", "Lays Classic Salted",
  "LAYS CLASSIC SALTED", "LAYS CLASSIC UNSALTED", "Lays Magic Masala",
  "LAYS MAGIC MASALA", "LAYS MASALA MONACO", "LAYS POPCORN", "LAYS POPCORN BUTTER",
  "LAYS POPCORN CHEESE", "Lays Puffcorn", "LAYS SPICY TOMATO",
  "LAYS SPICY TOMATO KETCHUP", "LAYS SPICY TOMATO KETCHUP", "LAYS TANGY TOMATO",
  "Lays Tomato Tango", "LIMCA", "Limca 750ml", "Lotte Choco Pie", "M.O.M Popcorn",
  "Maggi Cup Noodles", "Maggi Ready To Eat", "Maggi Regular Noodles",
  "Malkit Biscuits", "Marie Biscuits", "MAZZA", "MAZZA (LARGE)", "McVities Digestive",
  "MIRINDA", "MIRINDA (LARGE)", "Mogu Mogu Apple 300ml", "Mogu Mogu Blackcurrant 300ml",
  "Mogu Mogu Mango 300ml", "Mogu Mogu Melon 300ml", "Mogu Mogu Orange 300ml",
  "Mogu Mogu Pineapple 300ml", "Mogu Mogu Strawberry 300ml", "Monaco",
  "MONSTER GREEN", "Monster Mango Loco 500ml", "Monster Pipeline Punch 500ml",
  "Monster Ultra Rosa 500ml", "Monster Ultra Watermelon 500ml", "MONSTER WHITE ULTRA",
  "Mother Dairy Double Toned Milk", "Mother Dairy Full Cream Milk",
  "Mother Dairy Sweet Lassi 180ml", "Mother Dairy Sweet Lassi 270ml",
  "Mother Dairy Toned Milk 1L", "Natkhat Nimbu", "Nescafe Black Roast 100g",
  "Nescafe Caramel Latte 180ml", "Nescafe Choco Latte 180ml", "Nescafe Cold Coffee 180ml",
  "Nescafe Gold 50g", "Nescafe Iced Frappe 180ml", "Nescafe Instant Coffee 45g",
  "Nescafe Instant Coffee 90g", "Nescafe Intense Café 180ml", "Nestle Bar One",
  "Nestle KitKat", "Nestle Munch", "Nimbooz 350ml", "NUMBOOZ", "Ocean Crispy Apple 500ml",
  "Ocean Guava 500ml", "Ocean Lively Lychee 500ml", "Ocean Mango & Passion Fruit 500ml",
  "Ocean Peach & Passion Fruit 500ml", "Ocean Strawberry & Lime 500ml", "ORANGE PULPY",
  "Oreo Choco Creme", "Oreo Original", "Paper Boat Aamras 200ml", "Paper Boat Coconut Water 200ml",
  "Paper Boat Cranberry 200ml", "Paper Boat Lychee Nata De Coco 200ml",
  "Paper Boat Orange Nata De Coco 200ml", "Paper Boat Pomegranate 200ml",
  "Paper Boat Swing Guava 200ml", "Paper Boat Tender Coconut Water 200ml",
  "Paper Boat Zero Sugar Lemon Lime Sparkling Water 250ml",
  "Paper Boat Zero Sugar Mint Mojito 250ml",
  "Paper Boat Zero Sugar Yuzu Orange Sparkling Water 250ml",
  "PAPERBOAT PAPERBOAT SWING COCONUT WATER DRINK", "PAPERBOAT PAPERBOAT SWING LUSH LYCHES",
  "PAPERBOAT PAPERBOAT SWING LUSH TYCHES", "PAPERBOAT PAPERBOAT SWING MIXED FRUIT MEDLEY",
  "PAPERBOAT PAPERBOAT SWING SLEEPY MANGO", "PAPERBOAT PAPERBOAT SWING YUMMY GUAVA JUICIER DRINK",
  "PAPERBOAT PAPERBOAT SWING ZESTY POMEGRANATE", "PAPERBOAT PAPERBOAT SWING ZESTY POMEGRANATE 45",
  "PAPERBOAT PAPERBOAT ZERO SPARKLING WATER GREEN APPLE",
  "PAPERBOAT PAPERBOAT ZERO SPARKLING WATER LEMON LIME", "Parle-G", "Parle-G Biscuits",
  "PEPSI", "Pepsi 400ml", "Pepsi 750ml", "Pepsi Zero Sugar Can 300ml", "Perfetti Alpenliebe",
  "Perfetti Mentos", "POPZ POPZ CHOCOLATY CRUNCH", "POPZ POPZ COOKIS & CREME", "POPZ POPZ HAZELNUT",
  "PREDATOR", "Pringles Original", "Ramyeon Korean Style Noodles", "Red Bull Red Edition 250ml",
  "Red Bull Regular 250ml", "Red Bull Yellow Edition 250ml", "Red Bull Zero Sugar 250ml",
  "Regal Golden Brown Biscuits", "Samyang Buldak Black", "Samyang Buldak Green",
  "Samyang Buldak Pink", "Samyang Buldak Red", "Samyang Buldak Yellow", "SLICE",
  "SLICE (LARGE)", "Slice 600ml", "SPRITE", "SPRITE (300ML)", "SPRITE (LARGE)", "Sprite 750ml",
  "Sprite Can 300ml", "Sting Red 250ml", "Sundrop Yellow Butter Flavour", "Sunfeast Moms Magic",
  "SWING COCONUT WATER", "SWING GUAVA", "SWING LYCHEE", "SWING LYCHEE PREMIUM", "SWING MANGO",
  "SWING MIXED FRUIT", "SWING POMEGRANATE", "SWING POMEGRANATE PREMIUM", "Tagz Ragi Chips",
  "Thumbs Up 750ml", "THUMS UP", "THUMS UP (300ML)", "THUMS UP (LARGE)",
  "Too Yumm Multigrain Chips Black", "Too Yumm Multigrain Chips Green", "Too Yumm Veggie Stix",
  "TROPICANA GAVAWA", "TROPICANA MIXFURIT", "Uncle Chips Plain Salted", "Wai Wai Assorted Flavours",
  "Wheelz Masala", "WINKIES WINKIES CAFE SELECT BANANA HAZELNUT SLICED CAKE",
  "WINKIES WINKIES CAFE SELECT DOUBLE CHOCO SLICED CAKE", "WINKIES WINKIES CHOCO CAKE SLICED",
  "WINKIES WINKIES CHOCOLUV SWISS ROLL", "WINKIES WINKIES CLASSIC VANILLA SLICE CAKE",
  "WINKIES WINKIES FRUIT CAKE SLICED 20", "WINKIES WINKIES FRUIT CAKE SLICED 30",
  "WINKIES WINKIES FRUIT CAKE SLICED 40", "WINKIES WINKIES FRUIT CAKE WITH RAISIN & TUTTI FRUTTI",
  "WINKIES WINKIES MARBLE CAKE SLICED", "WINKIES WINKIES PINEAPPLE CAKE SLICED",
  "WINKIES WINKIES SWISS ROLL CHOCOLATE FLAVOUR", "WINKIES WINKIES SWISS ROLL STRAWBERRY JAM",
  "Winkin Cow Milkshake Vanilla 170ml", "ZERO GREEN APPLE", "ZERO LEMON LIME"
];

function findBestMatch(imageName, productNames) {
  const normalizedImageName = imageName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Try exact match first
  for (const productName of productNames) {
    const normalizedProductName = productName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (normalizedImageName === normalizedProductName) {
      return productName;
    }
  }
  
  // Try brand-based matching
  const imageWords = normalizedImageName.split(' ');
  const brandMatches = [];
  
  for (const productName of productNames) {
    const normalizedProductName = productName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const productWords = normalizedProductName.split(' ');
    
    // Check if first word (brand) matches
    if (imageWords[0] && productWords[0] && imageWords[0] === productWords[0]) {
      brandMatches.push(productName);
    }
  }
  
  if (brandMatches.length > 0) {
    return brandMatches[0]; // Return first brand match
  }
  
  return null;
}

async function autoMapImages() {
  try {
    console.log('🤖 Starting auto-mapping process...\n');
    
    // Get all images from Grocery/Products folder
    const { data: images, error } = await imagekit.listFiles({
      path: '/Grocery/Products/',
      limit: 1000
    });
    
    if (error) {
      console.error('❌ Error fetching images:', error);
      return;
    }
    
    if (!images || images.length === 0) {
      console.log('❌ No images found in Grocery/Products/');
      return;
    }
    
    console.log(`📁 Found ${images.length} images to map\n`);
    
    const mappings = [];
    const unmatched = [];
    
    for (const image of images) {
      const match = findBestMatch(image.name, PRODUCT_NAMES);
      
      if (match) {
        mappings.push({
          currentName: image.name,
          newName: match,
          confidence: 'high'
        });
      } else {
        unmatched.push(image.name);
      }
    }
    
    console.log('🎯 AUTO-MAPPING RESULTS:\n');
    console.log('='.repeat(60));
    
    mappings.forEach((mapping, index) => {
      console.log(`${index + 1}. ${mapping.currentName}`);
      console.log(`   → ${mapping.newName}`);
      console.log('');
    });
    
    if (unmatched.length > 0) {
      console.log('⚠️  UNMATCHED IMAGES:');
      console.log('-'.repeat(40));
      unmatched.forEach((name, index) => {
        console.log(`${index + 1}. ${name}`);
      });
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Auto-mapped: ${mappings.length}`);
    console.log(`❌ Unmatched: ${unmatched.length}`);
    console.log(`📈 Success rate: ${Math.round((mappings.length / images.length) * 100)}%`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

autoMapImages();
