import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  dailyCalorieGoal: user.dailyCalorieGoal,
  dailyProteinGoal: user.dailyProteinGoal,
  dailyCarbsGoal:   user.dailyCarbsGoal,
  dailyFatGoal:     user.dailyFatGoal
});

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, email, password, age, gender, weight, height, activityLevel } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, age, gender, weight, height, activityLevel });
    res.status(201).json({ success: true, token: generateToken(user._id), user: userPayload(user) });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ success: true, token: generateToken(user._id), user: userPayload(user) });
  } catch (err) { next(err); }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name','age','gender','weight','height','activityLevel',
      'dailyCalorieGoal','dailyProteinGoal','dailyCarbsGoal','dailyFatGoal'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
