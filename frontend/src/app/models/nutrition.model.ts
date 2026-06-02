export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Unit = 'serving' | 'g' | 'ml' | 'oz' | 'cup' | 'tbsp' | 'tsp' | 'piece';

export interface FoodItem {
  _id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  category?: string;
  servingSize?: number;
  servingUnit?: string;
}

export interface FoodEntry {
  _id?: string;
  foodItem: FoodItem;
  quantity: number;
  unit: Unit;
  mealType: MealType;
  time?: string;
}

export interface NutritionLog {
  _id: string;
  date: string;
  foodEntries: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  waterIntake: number;
  notes?: string;
  aiAnalysis?: string;
}

export interface WeeklySummary {
  totalDays: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  logs: NutritionLog[];
}
