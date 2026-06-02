import mongoose from 'mongoose';

const foodEntrySchema = new mongoose.Schema({
  foodItem: {
    name:     { type: String, required: true },
    calories: { type: Number, required: true },
    protein:  { type: Number, default: 0 },
    carbs:    { type: Number, default: 0 },
    fat:      { type: Number, default: 0 },
    fiber:    { type: Number, default: 0 },
    sugar:    { type: Number, default: 0 },
    sodium:   { type: Number, default: 0 }
  },
  quantity: { type: Number, required: true, min: [0.1, 'Quantity must be positive'] },
  unit: {
    type: String, default: 'serving',
    enum: ['serving', 'g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece']
  },
  mealType: {
    type: String, required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  },
  time: { type: Date, default: Date.now }
}, { _id: true });

const nutritionLogSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: {
    type: Date, required: true,
    default: () => { const d = new Date(); d.setHours(0,0,0,0); return d; }
  },
  foodEntries:    [foodEntrySchema],
  totalCalories:  { type: Number, default: 0 },
  totalProtein:   { type: Number, default: 0 },
  totalCarbs:     { type: Number, default: 0 },
  totalFat:       { type: Number, default: 0 },
  totalFiber:     { type: Number, default: 0 },
  waterIntake:    { type: Number, default: 0 }, // ml
  notes:          { type: String, maxlength: 500 },
  aiAnalysis:     { type: String, default: null }
}, { timestamps: true });

nutritionLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Auto-calculate totals
nutritionLogSchema.pre('save', function (next) {
  const sum = (field) => this.foodEntries.reduce((acc, e) => acc + (e.foodItem[field] || 0) * e.quantity, 0);
  this.totalCalories = Math.round(sum('calories') * 10) / 10;
  this.totalProtein  = Math.round(sum('protein')  * 10) / 10;
  this.totalCarbs    = Math.round(sum('carbs')    * 10) / 10;
  this.totalFat      = Math.round(sum('fat')      * 10) / 10;
  this.totalFiber    = Math.round(sum('fiber')    * 10) / 10;
  next();
});

export default mongoose.model('NutritionLog', nutritionLogSchema);
