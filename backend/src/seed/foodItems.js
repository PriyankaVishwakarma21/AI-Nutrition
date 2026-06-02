import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import FoodItem from '../models/FoodItem.js';

const foods = [
  // Proteins
  { name:'Chicken Breast (cooked)', category:'protein',   servingSize:100, servingUnit:'g',   calories:165, protein:31,  carbs:0,   fat:3.6, fiber:0,   sugar:0,   sodium:74  },
  { name:'Salmon Fillet',           category:'protein',   servingSize:100, servingUnit:'g',   calories:208, protein:20,  carbs:0,   fat:13,  fiber:0,   sugar:0,   sodium:59  },
  { name:'Eggs (large)',            category:'protein',   servingSize:50,  servingUnit:'g',   calories:78,  protein:6,   carbs:0.6, fat:5,   fiber:0,   sugar:0.5, sodium:62  },
  { name:'Greek Yogurt (plain)',    category:'dairy',     servingSize:170, servingUnit:'g',   calories:100, protein:17,  carbs:6,   fat:0.7, fiber:0,   sugar:6,   sodium:65  },
  { name:'Canned Tuna',             category:'protein',   servingSize:100, servingUnit:'g',   calories:116, protein:26,  carbs:0,   fat:1,   fiber:0,   sugar:0,   sodium:320 },
  { name:'Turkey Breast',           category:'protein',   servingSize:100, servingUnit:'g',   calories:135, protein:30,  carbs:0,   fat:1,   fiber:0,   sugar:0,   sodium:70  },
  { name:'Whey Protein Shake',      category:'protein',   servingSize:30,  servingUnit:'g',   calories:120, protein:24,  carbs:3,   fat:1.5, fiber:0,   sugar:2,   sodium:130 },
  // Grains
  { name:'Brown Rice (cooked)',     category:'grains',    servingSize:195, servingUnit:'g',   calories:216, protein:5,   carbs:45,  fat:1.8, fiber:3.5, sugar:0.7, sodium:10  },
  { name:'Oats (dry)',              category:'grains',    servingSize:40,  servingUnit:'g',   calories:150, protein:5,   carbs:27,  fat:2.5, fiber:4,   sugar:1,   sodium:1   },
  { name:'Whole Wheat Bread',       category:'grains',    servingSize:28,  servingUnit:'g',   calories:69,  protein:3.6, carbs:12,  fat:1,   fiber:1.9, sugar:1.4, sodium:132 },
  { name:'Quinoa (cooked)',         category:'grains',    servingSize:185, servingUnit:'g',   calories:222, protein:8,   carbs:39,  fat:3.5, fiber:5,   sugar:1.6, sodium:13  },
  { name:'Sweet Potato',            category:'vegetables',servingSize:130, servingUnit:'g',   calories:112, protein:2,   carbs:26,  fat:0.1, fiber:3.8, sugar:5.4, sodium:72  },
  // Vegetables
  { name:'Broccoli (raw)',          category:'vegetables',servingSize:100, servingUnit:'g',   calories:34,  protein:2.8, carbs:7,   fat:0.4, fiber:2.6, sugar:1.7, sodium:33  },
  { name:'Spinach (raw)',           category:'vegetables',servingSize:100, servingUnit:'g',   calories:23,  protein:2.9, carbs:3.6, fat:0.4, fiber:2.2, sugar:0.4, sodium:79  },
  { name:'Mixed Salad Greens',      category:'vegetables',servingSize:100, servingUnit:'g',   calories:20,  protein:1.8, carbs:3,   fat:0.3, fiber:2,   sugar:1.5, sodium:30  },
  { name:'Carrots (raw)',           category:'vegetables',servingSize:100, servingUnit:'g',   calories:41,  protein:0.9, carbs:10,  fat:0.2, fiber:2.8, sugar:4.7, sodium:69  },
  { name:'Avocado',                 category:'fats',      servingSize:150, servingUnit:'g',   calories:240, protein:3,   carbs:13,  fat:22,  fiber:10,  sugar:1,   sodium:11  },
  // Fruits
  { name:'Banana',                  category:'fruits',    servingSize:118, servingUnit:'g',   calories:105, protein:1.3, carbs:27,  fat:0.4, fiber:3.1, sugar:14,  sodium:1   },
  { name:'Apple (medium)',          category:'fruits',    servingSize:182, servingUnit:'g',   calories:95,  protein:0.5, carbs:25,  fat:0.3, fiber:4.4, sugar:19,  sodium:2   },
  { name:'Blueberries',             category:'fruits',    servingSize:148, servingUnit:'g',   calories:84,  protein:1.1, carbs:21,  fat:0.5, fiber:3.6, sugar:15,  sodium:1   },
  { name:'Orange',                  category:'fruits',    servingSize:131, servingUnit:'g',   calories:62,  protein:1.2, carbs:15,  fat:0.2, fiber:3.1, sugar:12,  sodium:0   },
  // Dairy
  { name:'Whole Milk (1 cup)',      category:'dairy',     servingSize:244, servingUnit:'ml',  calories:149, protein:8,   carbs:12,  fat:8,   fiber:0,   sugar:12,  sodium:105 },
  { name:'Cottage Cheese',          category:'dairy',     servingSize:113, servingUnit:'g',   calories:90,  protein:12,  carbs:5,   fat:2.5, fiber:0,   sugar:4,   sodium:360 },
  // Fats
  { name:'Olive Oil',               category:'fats',      servingSize:14,  servingUnit:'ml',  calories:119, protein:0,   carbs:0,   fat:14,  fiber:0,   sugar:0,   sodium:0   },
  { name:'Almonds',                 category:'fats',      servingSize:28,  servingUnit:'g',   calories:164, protein:6,   carbs:6,   fat:14,  fiber:3.5, sugar:1.2, sodium:0   },
  { name:'Peanut Butter',           category:'fats',      servingSize:32,  servingUnit:'g',   calories:190, protein:7,   carbs:8,   fat:16,  fiber:2,   sugar:3,   sodium:147 },
  // Beverages
  { name:'Coffee (black)',          category:'beverages', servingSize:240, servingUnit:'ml',  calories:2,   protein:0.3, carbs:0,   fat:0,   fiber:0,   sugar:0,   sodium:5   },
  { name:'Green Tea',               category:'beverages', servingSize:240, servingUnit:'ml',  calories:2,   protein:0,   carbs:0.5, fat:0,   fiber:0,   sugar:0,   sodium:2   },
  { name:'Orange Juice',            category:'beverages', servingSize:248, servingUnit:'ml',  calories:112, protein:1.7, carbs:26,  fat:0.5, fiber:0.5, sugar:21,  sodium:2   },
  // Snacks
  { name:'Protein Bar',             category:'snacks',    servingSize:60,  servingUnit:'g',   calories:230, protein:20,  carbs:25,  fat:7,   fiber:3,   sugar:10,  sodium:150 },
  { name:'Rice Cakes (plain)',      category:'snacks',    servingSize:18,  servingUnit:'g',   calories:70,  protein:1.4, carbs:14,  fat:0.6, fiber:0.4, sugar:0,   sodium:58  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await FoodItem.deleteMany({ isCustom: false });
    await FoodItem.insertMany(foods);
    console.log(`✅ Seeded ${foods.length} food items`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
