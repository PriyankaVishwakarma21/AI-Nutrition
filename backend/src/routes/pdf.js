import express from 'express';
import { generateNutritionReport } from '../controllers/pdfController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/report', generateNutritionReport);

export default router;
