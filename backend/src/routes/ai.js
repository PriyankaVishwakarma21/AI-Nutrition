import express from 'express';
import { analyzeNutrition, getMealSuggestions } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/analyze',           analyzeNutrition);
router.post('/meal-suggestions', getMealSuggestions);

export default router;
