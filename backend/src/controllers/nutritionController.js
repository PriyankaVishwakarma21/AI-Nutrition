import NutritionLog from '../models/NutritionLog.js';
import FoodItem from '../models/FoodItem.js';

const todayStart = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };

// ── GET /nutrition/today ──────────────────────────────────────────────────────
export const getTodayLog = async (req, res, next) => {
  try {
    let log = await NutritionLog.findOne({ user: req.user._id, date: todayStart() });
    if (!log) log = await NutritionLog.create({ user: req.user._id, date: todayStart(), foodEntries: [] });
    res.json({ success: true, log });
  } catch (err) { next(err); }
};

// ── GET /nutrition/logs?startDate&endDate ─────────────────────────────────────
export const getLogsByDateRange = async (req, res, next) => {
  try {
    const start = new Date(req.query.startDate || Date.now() - 7 * 86400000);
    start.setHours(0,0,0,0);
    const end = new Date(req.query.endDate || Date.now());
    end.setHours(23,59,59,999);
    const logs = await NutritionLog.find({ user: req.user._id, date: { $gte: start, $lte: end } }).sort({ date: -1 });
    res.json({ success: true, logs });
  } catch (err) { next(err); }
};

// ── GET /nutrition/weekly-summary ─────────────────────────────────────────────
export const getWeeklySummary = async (req, res, next) => {
  try {
    const start = new Date(); start.setDate(start.getDate() - 6); start.setHours(0,0,0,0);
    const logs = await NutritionLog.find({ user: req.user._id, date: { $gte: start } }).sort({ date: 1 });
    const avg = (field) => logs.length ? Math.round(logs.reduce((s,l) => s + l[field], 0) / logs.length) : 0;
    res.json({ success: true, summary: {
      totalDays: logs.length,
      avgCalories: avg('totalCalories'), avgProtein: avg('totalProtein'),
      avgCarbs: avg('totalCarbs'), avgFat: avg('totalFat'),
      logs
    }});
  } catch (err) { next(err); }
};

// ── POST /nutrition/log/entry ─────────────────────────────────────────────────
export const addFoodEntry = async (req, res, next) => {
  try {
    const { foodItem, quantity, unit, mealType } = req.body;
    let log = await NutritionLog.findOne({ user: req.user._id, date: todayStart() });
    if (!log) log = new NutritionLog({ user: req.user._id, date: todayStart(), foodEntries: [] });
    log.foodEntries.push({ foodItem, quantity, unit, mealType, time: new Date() });
    await log.save();
    res.status(201).json({ success: true, log });
  } catch (err) { next(err); }
};

// ── DELETE /nutrition/log/:logId/entry/:entryId ───────────────────────────────
export const removeFoodEntry = async (req, res, next) => {
  try {
    const log = await NutritionLog.findOne({ _id: req.params.logId, user: req.user._id });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    log.foodEntries = log.foodEntries.filter(e => e._id.toString() !== req.params.entryId);
    await log.save();
    res.json({ success: true, log });
  } catch (err) { next(err); }
};

// ── PATCH /nutrition/log/water ────────────────────────────────────────────────
export const updateWaterIntake = async (req, res, next) => {
  try {
    const log = await NutritionLog.findOneAndUpdate(
      { user: req.user._id, date: todayStart() },
      { $set: { waterIntake: req.body.amount } },
      { new: true, upsert: true }
    );
    res.json({ success: true, log });
  } catch (err) { next(err); }
};

// ── GET /nutrition/foods/search?q= ────────────────────────────────────────────
export const searchFoodItems = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ success: true, items: [] });
    let items = await FoodItem.find({ $text: { $search: q } }).limit(20);
    if (!items.length) items = await FoodItem.find({ name: { $regex: q, $options: 'i' } }).limit(20);
    res.json({ success: true, items });
  } catch (err) { next(err); }
};
