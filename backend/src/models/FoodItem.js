import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  name:     { type: String, required: [true, 'Food name required'], trim: true, maxlength: 100 },
  category: {
    type: String,
    enum: ['protein', 'vegetables', 'fruits', 'grains', 'dairy', 'fats', 'beverages', 'snacks', 'other'],
    default: 'other'
  },
  servingSize: { type: Number, default: 100 },
  servingUnit: { type: String, default: 'g' },
  calories:    { type: Number, required: true, min: 0 },
  protein:     { type: Number, default: 0, min: 0 },
  carbs:       { type: Number, default: 0, min: 0 },
  fat:         { type: Number, default: 0, min: 0 },
  fiber:       { type: Number, default: 0, min: 0 },
  sugar:       { type: Number, default: 0, min: 0 },
  sodium:      { type: Number, default: 0, min: 0 },
  isCustom:    { type: Boolean, default: false },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

foodItemSchema.index({ name: 'text', category: 'text' });

export default mongoose.model('FoodItem', foodItemSchema);
