// Analysis of Cook House Menu Discrepancies
// Comparing database menu with provided images

// Menu items extracted from the provided images
const imageMenuData = {
  "MAIN COURSE (VEG)": {
    "VEG GRAVY": [
      { name: "Palak Paneer", price: "200/280" },
      { name: "Shahi Paneer", price: "200/280" },
      { name: "Kadhai Paneer", price: "190/280" },
      { name: "Paneer Tikka Masala", price: "210/290" },
      { name: "Paneer Lababdar", price: "200/290" },
      { name: "Paneer Makhanwala", price: "210/300" },
      { name: "Paneer Bhurji", price: "210/290" },
      { name: "Paneer Sirka Pyaaz", price: "200/300" },
      { name: "Matar Paneer", price: "190/280" },
      { name: "Paneer Rajwada", price: "210/300" },
      { name: "Malai Kofta", price: "190/300" },
      { name: "Soya Chaap Korma", price: "200/280" },
      { name: "Soya Chaap Tikka Masala", price: "200/290" },
      { name: "Matar Mushroom", price: "180/270" },
      { name: "Kadhai Mushroom", price: "190/280" },
      { name: "Amritsari Chole", price: "180/260" },
      { name: "Jeera Aloo", price: "150/210" },
      { name: "Mix-Veg", price: "160/240" },
      { name: "Bhindi Masala", price: "150/220" },
      { name: "Bhindi Do Pyaza", price: "140/210" },
      { name: "Sev Tamatar", price: "150/220" },
      { name: "Sev Bhaji", price: "180/240" },
      { name: "Veg Kolhapuri", price: "180/260" },
      { name: "Veg Jaipuri", price: "190/270" }
    ],
    "ADDITIONAL MAIN COURSE": [
      { name: "Kashmiri Dum Aloo", price: "200/280" },
      { name: "Kaju Curry", price: "220/300" },
      { name: "Cheese Corn Masala", price: "210/300" }
    ],
    "DAL DARSHAN": [
      { name: "Dal Maharani (Dal Makhni)", price: "190/260" },
      { name: "Dal Dhaba", price: "170/210" },
      { name: "Dal Lehsuni", price: "170/210" },
      { name: "Dal Tadka", price: "160/210" },
      { name: "Dal Fry", price: "160/210" }
    ],
    "RICE": [
      { name: "Navaratna Pulao", price: "280" },
      { name: "Jeera Rice", price: "200" },
      { name: "Plain Rice", price: "180" },
      { name: "Masala Rice", price: "220" },
      { name: "Paneer Bhurji Pulao", price: "240" },
      { name: "Dal Khichdi", price: "200" },
      { name: "Curd Rice", price: "210" }
    ],
    "BIRYANI (Veg)": [
      { name: "Veg Biryani", price: "260" },
      { name: "Kolkata Sabz Biryani", price: "280" },
      { name: "Paneer Tikka Biryani", price: "280" },
      { name: "Hyderabadi Biryani", price: "270" }
    ]
  },
  "DRINKS": {
    "MOCKTAILS": [
      { name: "Fresh Lime Soda", price: "100" },
      { name: "Masala Lemon Soda", price: "120" },
      { name: "Green Goddess", price: "110" },
      { name: "Fruit Punch", price: "150" },
      { name: "Mojito", price: "150" }
    ],
    "SHAKES": [
      { name: "Strawberry Shake", price: "120" },
      { name: "Kitkat Shake", price: "130" },
      { name: "Oreo Shake", price: "140" },
      { name: "Banana Shake", price: "110" },
      { name: "Mango Shake", price: "120" },
      { name: "Coke/Fanta/Mirinda/Sprite", price: "MRP" }
    ],
    "REFRESHMENTS": [
      { name: "Butter Milk", price: "55" },
      { name: "Curd", price: "70" }
    ]
  },
  "CHINA WALL": {
    "VEGETARIAN": [
      { name: "Spring Roll", price: "180" },
      { name: "Honey Chilli Potato", price: "180" },
      { name: "Crispy Chilly Paneer (Dry/Gravy)", price: "260" },
      { name: "Crispy Chilli Mushroom", price: "220" },
      { name: "Crispy Corn Salt n Pepper", price: "180" },
      { name: "Veg Manchurian (Dry/Gravy)", price: "180/200" },
      { name: "Veg Fried Rice", price: "200" },
      { name: "Veg Schezwan rice", price: "210" },
      { name: "Steam Momos (6 pcs)", price: "130/200" },
      { name: "Fried Momos (6 pcs)", price: "140/200" },
      { name: "Vegetable Hakka Noodles", price: "150" },
      { name: "Chilli Garlic Noodles", price: "160" }
    ],
    "NON-VEGETARIAN": [
      { name: "Chicken Fried Rice", price: "210" },
      { name: "Chicken Hakka Noodles", price: "200" },
      { name: "Chilli Chicken", price: "290" }
    ]
  },
  "CHEF'S SPECIAL": [
    { name: "Jungli Chicken", price: "350" },
    { name: "Anda Ghotala (5 pcs)", price: "250" },
    { name: "Subz-E-Nizami", price: "260" }
  ],
  "ROLL MANIA": [
    { name: "Soya Chaap Roll", price: "120" },
    { name: "Kolkata Veg Roll", price: "100" },
    { name: "Paneer Kathi Roll", price: "140" },
    { name: "Egg Roll", price: "140" },
    { name: "Chicken Roll", price: "190" },
    { name: "Chicken Seekh Kebab Roll", price: "200" }
  ],
  "JUGAL-BANDI (COMBO MEALS)": [
    { name: "Chole Bhature", price: "140" },
    { name: "Chole Kulche", price: "140" },
    { name: "Chole Chawal", price: "140" },
    { name: "Rajma Chawal", price: "140" },
    { name: "Punjabi Kadi Chawal", price: "140" },
    { name: "Paneer Sabzi (chef's choice) + 2 Butter Roti", price: "170" },
    { name: "Dal Makhani + 1 Butter Naan", price: "180" },
    { name: "Dal Chawal", price: "140" },
    { name: "Punjabi Chicken Curry + 1 plain kulcha", price: "250" }
  ],
  "MAIN COURSE (NON-VEG)": {
    "INDIAN GRAVY": [
      { name: "Butter Chicken (Bone)", price: "410/620" },
      { name: "Butter Chicken (Boneless)", price: "430/640" },
      { name: "Chicken Tikka Masala", price: "410/630" },
      { name: "Chicken Patiala", price: "380/600" },
      { name: "Chicken Rara", price: "400/600" },
      { name: "Chicken Champaran", price: "360/560" },
      { name: "Kolkata Chicken", price: "410/620" },
      { name: "Chicken Kadhai", price: "400/610" },
      { name: "Methi Murgh", price: "400/600" },
      { name: "Hyderabadi Mutton Keema", price: "650/980" },
      { name: "Lal Mass", price: "600/980" },
      { name: "Mutton Curry", price: "600/980" },
      { name: "Mutton Rogan Josh", price: "600/980" },
      { name: "Egg Curry", price: "260" },
      { name: "Egg Bhurji", price: "220" }
    ],
    "BIRYANI": [
      { name: "Hyderabadi Dum Murg Biryani", price: "250/360" },
      { name: "Chicken Tikka Biryani", price: "270/380" },
      { name: "Egg Biryani", price: "200/270" },
      { name: "Mutton Keema Pulao", price: "280/400" }
    ]
  },
  "BUN MUSKA": [
    { name: "Plain Vada Pao (2 pcs)", price: "110" },
    { name: "Cheese Vada Pao (2 pcs)", price: "130" },
    { name: "Dabeli (2 pcs)", price: "130" },
    { name: "Pao Bhaji", price: "150" },
    { name: "Keema Pao (Chicken/Mutton)", price: "190/210" },
    { name: "Extra - per piece", price: "20" }
  ],
  "SANDWICH": [
    { name: "Veg Cheese Sandwich", price: "110" },
    { name: "Pesto Tomato Cheese Sandwich", price: "110" },
    { name: "Paneer Tikka Sandwich", price: "120" },
    { name: "Bombay Masala Toast", price: "110" },
    { name: "Omlette Sandwich", price: "120" },
    { name: "Chicken Tikka Sandwich", price: "140" }
  ],
  "PIZZA": [
    { name: "Margherita", price: "99/160" },
    { name: "All Veg Pizza", price: "130/180" },
    { name: "Paneer Tikka Pizza", price: "160/200" },
    { name: "Classic Pesto Pizza", price: "165/205" },
    { name: "Chicken Tikka Pizza", price: "195/225" }
  ],
  "RAITA": [
    { name: "Mix veg Raita", price: "110" },
    { name: "Nupuri Raita (Boondi)", price: "100" },
    { name: "Fried Raita", price: "110" }
  ],
  "PAPAD": [
    { name: "Plain Papad (Roasted/Fried)", price: "40/50" },
    { name: "Masala Papad (Roasted/Fried)", price: "60/70" }
  ],
  "THALI (VEG)": [
    { name: "SPECIAL THALI", price: "230", description: "Paneer Lababdar + Dal Makhani + Vegetable + Rice + 2 Tandoori Roti + 1 Laccha Paratha + Raita + Salad + Pickle + Papad" }
  ],
  "THALI (NON-VEG)": [
    { name: "SPECIAL THALI", price: "300", description: "Butter Chicken + Egg Curry + Dal Makhni + Rice + 2 Tandoori Roti + 1 Laccha Paratha + Raita + Salad + Pickle + Papad" }
  ],
  "BREADS": [
    { name: "Tandoori Roti (plain/butter)", price: "18/22" },
    { name: "Missi Roti", price: "55" },
    { name: "Pudina Laccha Paratha (plain/butter)", price: "50/60" },
    { name: "Hari Mirch Laccha Paratha (plain/butter)", price: "55/60" },
    { name: "Laccha Paratha (plain/butter)", price: "55/60" },
    { name: "Amritsari Kulcha", price: "90" },
    { name: "Paneer Kulcha", price: "90" },
    { name: "Onion Kulcha", price: "70" },
    { name: "Mix Kulcha", price: "80" },
    { name: "Naan (plain/butter)", price: "50/55" },
    { name: "Garlic Naan (plain/Butter)", price: "65/75" },
    { name: "Cheese Naan", price: "90" },
    { name: "Cheese Garlic Naan", price: "110" },
    { name: "Chur Chur Naan", price: "80" }
  ],
  "PARATHA (with curd & pickle)": [
    { name: "Aloo Paratha - 2pcs", price: "140" },
    { name: "Aloo Pyaaz Paratha - 2pcs", price: "150" },
    { name: "Paneer Onion Paratha - 2pcs", price: "160" },
    { name: "Gobhi Paratha -2pcs", price: "140" },
    { name: "Onion Cheese Paratha -2pcs", price: "170" },
    { name: "Cheese Corn Paratha -2pcs", price: "160" },
    { name: "Mix Paratha -2pcs", price: "160" }
  ],
  "MAGGI JUNCTION": [
    { name: "Butter Maggi", price: "60" },
    { name: "Cheese Maggi", price: "80" },
    { name: "Hot Chilli Garlic Maggi", price: "70" },
    { name: "Vegetable Butter Maggi", price: "80" },
    { name: "Paneer Tikka Maggi", price: "90" },
    { name: "Chicken Keema Maggi", price: "110" },
    { name: "Mutton Keema Maggi", price: "130" }
  ],
  "PASTAS (VEG/NON-VEG)": [
    { name: "Penne-al-Arrabiata (Red)", price: "180/210" },
    { name: "Penne Pasta Alfredo (White)", price: "180/210" },
    { name: "Pink Sauce Pasta", price: "180/210" },
    { name: "Spaghetti Aglio E Olio", price: "185/215" },
    { name: "Penne Pasta Pesto Sauce", price: "200/240" },
    { name: "Mac & Cheese", price: "210/230" },
    { name: "Spaghetti Pesto Sauce", price: "200/240" }
  ],
  "CHATPATAA-CHAAT": [
    { name: "Samosa Chaat", price: "180" },
    { name: "Aloo Papdi Chaat", price: "180" }
  ],
  "STARTERS": {
    "VEGETARIAN": [
      { name: "Bhutte Ke Kebab (8 pcs)", price: "210" },
      { name: "Paneer Tikka (6 pcs)", price: "270" },
      { name: "Malai Paneer Tikka (6 pcs)", price: "280" },
      { name: "Soya Chaap Tikka", price: "250" },
      { name: "Malai Soya Chaap Tikka", price: "260" },
      { name: "Aachari Paneer Tikka (6 pcs)", price: "270" },
      { name: "Hara Bhara Kebab (8 pcs)", price: "220" },
      { name: "Mushroom Tikka", price: "270" },
      { name: "Paneer Pudina Tikka (6 pcs)", price: "280" }
    ],
    "NON-VEGETARIAN": [
      { name: "Chicken Tikka (8 pcs)", price: "370" },
      { name: "Aachari Chicken Tikka", price: "370" },
      { name: "Garlic Chicken Tikka", price: "380" },
      { name: "Murgh Malai Tikka (6 pcs)", price: "360" },
      { name: "Chicken Seekh Kebab", price: "400" },
      { name: "Tandoori Chicken (half/full)", price: "320/500" },
      { name: "Pudina Chicken Tikka (6 pcs)", price: "360" }
    ]
  },
  "SOUPS": [
    { name: "Manchaw Soup (Veg/Non-veg)", price: "100/120" },
    { name: "Hot'n'sour (Veg/Non-veg)", price: "100/120" },
    { name: "Tomato Basil Soup", price: "100" },
    { name: "Murgh Shejani Shorba", price: "130" }
  ],
  "TIME-PASS": [
    { name: "Chilli Garlic Potato Nuggets (10 pcs)", price: "130" },
    { name: "Peri Peri Fries", price: "130" },
    { name: "Masala Fries", price: "140" },
    { name: "Potato Cheese Pops (10 pcs)", price: "160" },
    { name: "Cocktail Samosa (6 pcs)", price: "120" },
    { name: "Cheese Corn Samosa (6 pcs)", price: "140" },
    { name: "Chicken Nuggets (8 pcs)", price: "200" }
  ],
  "SALAD": [
    { name: "Green Salad", price: "70" },
    { name: "Kachumber", price: "100" },
    { name: "Coleslaw", price: "100" },
    { name: "Corn Chaat", price: "120" }
  ]
};

// Database menu data from the migration file
const databaseMenuData = {
  "China Wall": [
    { name: "Spring Roll", price: 180 },
    { name: "Honey Chilli Potato", price: 180 },
    { name: "Crispy Chilly Paneer (Dry)", price: 260 },
    { name: "Crispy Chilly Paneer (Gravy)", price: 260 },
    { name: "Crispy Chilli Mushroom", price: 220 },
    { name: "Crispy Corn Salt n Pepper", price: 180 },
    { name: "Veg Manchurian (Dry)", price: 180 },
    { name: "Veg Manchurian (Gravy)", price: 200 },
    { name: "Veg Fried Rice", price: 200 },
    { name: "Veg Schezwan Rice", price: 210 },
    { name: "Steam Momos (6 pcs)", price: 130 },
    { name: "Fried Momos (6 pcs)", price: 140 },
    { name: "Vegetable Hakka Noodles", price: 150 },
    { name: "Chilli Garlic Noodles", price: 160 },
    { name: "Chicken Fried Rice", price: 210 },
    { name: "Chicken Hakka Noodles", price: 200 },
    { name: "Chilli Chicken", price: 290 }
  ],
  "Chef Special": [
    { name: "Jungli Chicken", price: 350 },
    { name: "Anda Ghotala (5 pcs)", price: 250 },
    { name: "Subz-E-Nizami", price: 260 }
  ],
  "Breads": [
    { name: "Tandoori Roti (Plain)", price: 18 },
    { name: "Tandoori Roti (Butter)", price: 22 },
    { name: "Missi Roti", price: 55 },
    { name: "Pudina Laccha Paratha (Plain)", price: 50 },
    { name: "Pudina Laccha Paratha (Butter)", price: 60 },
    { name: "Hari Mirch Laccha Paratha (Plain)", price: 55 },
    { name: "Hari Mirch Laccha Paratha (Butter)", price: 60 },
    { name: "Laccha Paratha (Plain)", price: 55 },
    { name: "Laccha Paratha (Butter)", price: 60 },
    { name: "Amritsari Kulcha", price: 90 },
    { name: "Paneer Kulcha", price: 90 },
    { name: "Onion Kulcha", price: 70 },
    { name: "Mix Kulcha", price: 80 },
    { name: "Naan (Plain)", price: 50 },
    { name: "Naan (Butter)", price: 55 },
    { name: "Garlic Naan (Plain)", price: 65 },
    { name: "Garlic Naan (Butter)", price: 75 },
    { name: "Cheese Naan", price: 90 },
    { name: "Cheese Garlic Naan", price: 110 },
    { name: "Chur Chur Naan", price: 80 }
  ],
  "Veg Main Course": [
    { name: "Palak Paneer (Half)", price: 200 },
    { name: "Palak Paneer (Full)", price: 280 },
    { name: "Shahi Paneer (Half)", price: 200 },
    { name: "Shahi Paneer (Full)", price: 280 },
    { name: "Kadhai Paneer (Half)", price: 190 },
    { name: "Kadhai Paneer (Full)", price: 280 },
    { name: "Paneer Tikka Masala (Half)", price: 210 },
    { name: "Paneer Tikka Masala (Full)", price: 290 },
    { name: "Paneer Lababdar (Half)", price: 200 },
    { name: "Paneer Lababdar (Full)", price: 290 },
    { name: "Paneer Makhanwala (Half)", price: 210 },
    { name: "Paneer Makhanwala (Full)", price: 300 },
    { name: "Paneer Bhurji (Half)", price: 210 },
    { name: "Paneer Bhurji (Full)", price: 290 },
    { name: "Paneer Sirka Pyaaz (Half)", price: 200 },
    { name: "Paneer Sirka Pyaaz (Full)", price: 300 },
    { name: "Matar Paneer (Half)", price: 190 },
    { name: "Matar Paneer (Full)", price: 280 },
    { name: "Paneer Rajwada (Half)", price: 210 },
    { name: "Paneer Rajwada (Full)", price: 300 },
    { name: "Malai Kofta (Half)", price: 190 },
    { name: "Malai Kofta (Full)", price: 300 },
    { name: "Soya Chaap Korma (Half)", price: 200 },
    { name: "Soya Chaap Korma (Full)", price: 280 },
    { name: "Soya Chaap Tikka Masala (Half)", price: 200 },
    { name: "Soya Chaap Tikka Masala (Full)", price: 290 },
    { name: "Matar Mushroom (Half)", price: 180 },
    { name: "Matar Mushroom (Full)", price: 270 },
    { name: "Kadhai Mushroom (Half)", price: 190 },
    { name: "Kadhai Mushroom (Full)", price: 280 },
    { name: "Amritsari Chole (Half)", price: 180 },
    { name: "Amritsari Chole (Full)", price: 260 },
    { name: "Jeera Aloo (Half)", price: 150 },
    { name: "Jeera Aloo (Full)", price: 210 },
    { name: "Mix-Veg (Half)", price: 160 },
    { name: "Mix-Veg (Full)", price: 240 },
    { name: "Bhindi Masala (Half)", price: 150 },
    { name: "Bhindi Masala (Full)", price: 220 },
    { name: "Bhindi Do Pyaza (Half)", price: 140 },
    { name: "Bhindi Do Pyaza (Full)", price: 210 },
    { name: "Sev Tamatar (Half)", price: 150 },
    { name: "Sev Tamatar (Full)", price: 220 },
    { name: "Sev Bhaji (Half)", price: 180 },
    { name: "Sev Bhaji (Full)", price: 240 },
    { name: "Veg Kolhapuri (Half)", price: 180 },
    { name: "Veg Kolhapuri (Full)", price: 260 },
    { name: "Veg Jaipuri (Half)", price: 190 },
    { name: "Veg Jaipuri (Full)", price: 270 },
    { name: "Kashmiri Dum Aloo (Half)", price: 200 },
    { name: "Kashmiri Dum Aloo (Full)", price: 280 },
    { name: "Kaju Curry (Half)", price: 220 },
    { name: "Kaju Curry (Full)", price: 300 },
    { name: "Cheese Corn Masala (Half)", price: 210 },
    { name: "Cheese Corn Masala (Full)", price: 300 }
  ],
  "Dal Darshan": [
    { name: "Dal Maharani (Half)", price: 190 },
    { name: "Dal Maharani (Full)", price: 260 },
    { name: "Dal Dhaba (Half)", price: 170 },
    { name: "Dal Dhaba (Full)", price: 210 },
    { name: "Dal Lehsuni (Half)", price: 170 },
    { name: "Dal Lehsuni (Full)", price: 210 },
    { name: "Dal Tadka (Half)", price: 160 },
    { name: "Dal Tadka (Full)", price: 210 },
    { name: "Dal Fry (Half)", price: 160 },
    { name: "Dal Fry (Full)", price: 210 }
  ],
  "Rice": [
    { name: "Navaratna Pulao", price: 280 },
    { name: "Jeera Rice", price: 200 },
    { name: "Plain Rice", price: 180 },
    { name: "Masala Rice", price: 220 },
    { name: "Paneer Bhurji Pulao", price: 240 },
    { name: "Dal Khichdi", price: 200 },
    { name: "Curd Rice", price: 210 }
  ],
  "Veg Biryani": [
    { name: "Veg Biryani", price: 260 },
    { name: "Kolkata Sabz Biryani", price: 280 },
    { name: "Paneer Tikka Biryani", price: 280 },
    { name: "Hyderabadi Biryani", price: 270 }
  ],
  "Non-Veg Main Course": [
    { name: "Butter Chicken (Bone) (Half)", price: 410 },
    { name: "Butter Chicken (Bone) (Full)", price: 620 },
    { name: "Butter Chicken (Boneless) (Half)", price: 430 },
    { name: "Butter Chicken (Boneless) (Full)", price: 640 },
    { name: "Chicken Tikka Masala (Half)", price: 410 },
    { name: "Chicken Tikka Masala (Full)", price: 630 },
    { name: "Chicken Patiala (Half)", price: 380 },
    { name: "Chicken Patiala (Full)", price: 600 },
    { name: "Chicken Rara (Half)", price: 400 },
    { name: "Chicken Rara (Full)", price: 600 },
    { name: "Chicken Champaran (Half)", price: 360 },
    { name: "Chicken Champaran (Full)", price: 560 },
    { name: "Kolkata Chicken (Half)", price: 410 },
    { name: "Kolkata Chicken (Full)", price: 620 },
    { name: "Chicken Kadhai (Half)", price: 400 },
    { name: "Chicken Kadhai (Full)", price: 610 },
    { name: "Methi Murgh (Half)", price: 400 },
    { name: "Methi Murgh (Full)", price: 600 },
    { name: "Hyderabadi Mutton Keema (Half)", price: 650 },
    { name: "Hyderabadi Mutton Keema (Full)", price: 980 },
    { name: "Lal Mass (Half)", price: 600 },
    { name: "Lal Mass (Full)", price: 980 },
    { name: "Mutton Curry (Half)", price: 600 },
    { name: "Mutton Curry (Full)", price: 980 },
    { name: "Mutton Rogan Josh (Half)", price: 600 },
    { name: "Mutton Rogan Josh (Full)", price: 980 },
    { name: "Egg Curry", price: 260 },
    { name: "Egg Bhurji", price: 220 }
  ],
  "Non-Veg Biryani": [
    { name: "Hyderabadi Dum Murg Biryani (Half)", price: 250 },
    { name: "Hyderabadi Dum Murg Biryani (Full)", price: 360 },
    { name: "Chicken Tikka Biryani (Half)", price: 270 },
    { name: "Chicken Tikka Biryani (Full)", price: 380 },
    { name: "Egg Biryani (Half)", price: 200 },
    { name: "Egg Biryani (Full)", price: 270 },
    { name: "Mutton Keema Pulao (Half)", price: 280 },
    { name: "Mutton Keema Pulao (Full)", price: 400 }
  ]
};

console.log('🔍 COOK HOUSE MENU DISCREPANCY ANALYSIS\n');

// Function to flatten image menu data for comparison
function flattenImageMenu(imageData) {
  const flattened = [];
  
  for (const [category, items] of Object.entries(imageData)) {
    if (Array.isArray(items)) {
      items.forEach(item => {
        flattened.push({
          category: category,
          name: item.name,
          price: item.price,
          description: item.description || null
        });
      });
    } else if (typeof items === 'object') {
      for (const [subCategory, subItems] of Object.entries(items)) {
        if (Array.isArray(subItems)) {
          subItems.forEach(item => {
            flattened.push({
              category: `${category} - ${subCategory}`,
              name: item.name,
              price: item.price,
              description: item.description || null
            });
          });
        }
      }
    }
  }
  
  return flattened;
}

// Function to flatten database menu data for comparison
function flattenDatabaseMenu(dbData) {
  const flattened = [];
  
  for (const [category, items] of Object.entries(dbData)) {
    items.forEach(item => {
      flattened.push({
        category: category,
        name: item.name,
        price: item.price
      });
    });
  }
  
  return flattened;
}

const imageMenu = flattenImageMenu(imageMenuData);
const databaseMenu = flattenDatabaseMenu(databaseMenuData);

console.log(`📊 SUMMARY:`);
console.log(`  - Items in images: ${imageMenu.length}`);
console.log(`  - Items in database: ${databaseMenu.length}\n`);

// Find missing items (in images but not in database)
console.log('❌ MISSING ITEMS (in images but not in database):');
const missingItems = [];
imageMenu.forEach(imageItem => {
  const found = databaseMenu.find(dbItem => 
    dbItem.name.toLowerCase().includes(imageItem.name.toLowerCase()) ||
    imageItem.name.toLowerCase().includes(dbItem.name.toLowerCase())
  );
  if (!found) {
    missingItems.push(imageItem);
    console.log(`  - ${imageItem.name} (${imageItem.category}): ₹${imageItem.price}`);
  }
});

if (missingItems.length === 0) {
  console.log('  ✅ No missing items found');
}

console.log(`\n📈 Missing items count: ${missingItems.length}\n`);

// Find extra items (in database but not in images)
console.log('➕ EXTRA ITEMS (in database but not in images):');
const extraItems = [];
databaseMenu.forEach(dbItem => {
  const found = imageMenu.find(imageItem => 
    dbItem.name.toLowerCase().includes(imageItem.name.toLowerCase()) ||
    imageItem.name.toLowerCase().includes(dbItem.name.toLowerCase())
  );
  if (!found) {
    extraItems.push(dbItem);
    console.log(`  - ${dbItem.name} (${dbItem.category}): ₹${dbItem.price}`);
  }
});

if (extraItems.length === 0) {
  console.log('  ✅ No extra items found');
}

console.log(`\n📈 Extra items count: ${extraItems.length}\n`);

// Find price mismatches
console.log('💰 PRICE MISMATCHES:');
const priceMismatches = [];
imageMenu.forEach(imageItem => {
  const found = databaseMenu.find(dbItem => 
    dbItem.name.toLowerCase().includes(imageItem.name.toLowerCase()) ||
    imageItem.name.toLowerCase().includes(dbItem.name.toLowerCase())
  );
  if (found) {
    // Parse image price (handle formats like "200/280", "200", "MRP")
    const imagePriceStr = imageItem.price.toString();
    const imagePrices = imagePriceStr.includes('/') ? 
      imagePriceStr.split('/').map(p => parseInt(p.trim())) : 
      [parseInt(imagePriceStr)];
    
    // Check if any image price matches database price
    const hasMatch = imagePrices.some(ip => ip === found.price);
    
    if (!hasMatch && !imagePriceStr.includes('MRP')) {
      priceMismatches.push({
        name: imageItem.name,
        category: imageItem.category,
        imagePrice: imageItem.price,
        databasePrice: found.price
      });
      console.log(`  - ${imageItem.name} (${imageItem.category})`);
      console.log(`    Image: ₹${imageItem.price} | Database: ₹${found.price}`);
    }
  }
});

if (priceMismatches.length === 0) {
  console.log('  ✅ No price mismatches found');
}

console.log(`\n📈 Price mismatches count: ${priceMismatches.length}\n`);

// Summary
console.log('📋 FINAL SUMMARY:');
console.log(`  - Total items in images: ${imageMenu.length}`);
console.log(`  - Total items in database: ${databaseMenu.length}`);
console.log(`  - Missing items: ${missingItems.length}`);
console.log(`  - Extra items: ${extraItems.length}`);
console.log(`  - Price mismatches: ${priceMismatches.length}`);
console.log(`  - Items needing updates: ${missingItems.length + priceMismatches.length}`);

if (missingItems.length > 0 || priceMismatches.length > 0) {
  console.log('\n🔧 ACTION REQUIRED:');
  console.log('  - Create SQL script to add missing items');
  console.log('  - Create SQL script to update price mismatches');
  console.log('  - Consider removing extra items if not needed');
}
