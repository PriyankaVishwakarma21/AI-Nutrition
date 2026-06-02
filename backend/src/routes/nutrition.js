import express from 'express';
import {
  getTodayLog, getLogsByDateRange, addFoodEntry,
  removeFoodEntry, updateWaterIntake, getWeeklySummary, searchFoodItems
} from '../controllers/nutritionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/today',             getTodayLog);
router.get('/logs',              getLogsByDateRange);
router.get('/weekly-summary',    getWeeklySummary);
router.post('/log/entry',        addFoodEntry);
router.delete('/log/:logId/entry/:entryId', removeFoodEntry);
router.patch('/log/water',       updateWaterIntake);
router.get('/foods/search',      searchFoodItems);

export default router;
