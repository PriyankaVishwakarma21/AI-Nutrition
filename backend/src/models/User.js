import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Name is required'],
    trim: true, maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String, required: [true, 'Email is required'],
    unique: true, lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: {
    type: String, required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'], select: false
  },
  age:    { type: Number, min: 1, max: 120 },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  weight: { type: Number, min: 1 }, // kg
  height: { type: Number, min: 1 }, // cm
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    default: 'moderate'
  },
  dailyCalorieGoal: { type: Number, default: 2000 },
  dailyProteinGoal: { type: Number, default: 150 }, // g
  dailyCarbsGoal:   { type: Number, default: 250 }, // g
  dailyFatGoal:     { type: Number, default: 65  }  // g
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
