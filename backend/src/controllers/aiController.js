import Groq from 'groq-sdk';
import NutritionLog from '../models/NutritionLog.js';
import User from '../models/User.js';

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── GET /ai/analyze ───────────────────────────────────────────────────────────
export const analyzeNutrition = async (req, res, next) => {
  try {
    const user  = await User.findById(req.user._id);
    const start = new Date(); start.setDate(start.getDate() - 7); start.setHours(0,0,0,0);
    const logs  = await NutritionLog.find({ user: req.user._id, date: { $gte: start } });

    const avg = (f) => logs.length ? Math.round(logs.reduce((s,l) => s + l[f], 0) / logs.length) : 0;

    const prompt = `You are a professional nutritionist AI. Analyze this user's nutrition data and give personalized advice.

User Profile:
- Name: ${user.name} | Age: ${user.age || 'N/A'} | Gender: ${user.gender || 'N/A'}
- Weight: ${user.weight ? user.weight + ' kg' : 'N/A'} | Height: ${user.height ? user.height + ' cm' : 'N/A'}
- Activity Level: ${user.activityLevel}
- Goals: ${user.dailyCalorieGoal} kcal, ${user.dailyProteinGoal}g protein, ${user.dailyCarbsGoal}g carbs, ${user.dailyFatGoal}g fat

Last 7-Day Average:
- Calories: ${avg('totalCalories')} kcal | Protein: ${avg('totalProtein')}g
- Carbs: ${avg('totalCarbs')}g | Fat: ${avg('totalFat')}g
- Days tracked: ${logs.length}/7

Please respond with:
1. **Overall Assessment** – 2-3 sentences on overall health of diet
2. **What's Working** – 2 positives
3. **Areas to Improve** – 2-3 specific gaps
4. **Actionable Recommendations** – 4 bullet points with specific changes
5. **Motivational Closing** – 1 encouraging sentence

Be concise, evidence-based, and encouraging.`;

    const completion = await getGroq().chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are a professional, encouraging registered dietitian. Provide practical, science-based nutrition guidance.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 900,
      temperature: 0.7
    });

    const analysis = completion.choices[0].message.content;

    // Persist analysis to today's log
    const today = new Date(); today.setHours(0,0,0,0);
    await NutritionLog.findOneAndUpdate(
      { user: req.user._id, date: today },
      { aiAnalysis: analysis },
      { upsert: true }
    );

    res.json({ success: true, analysis });
  } catch (err) {
    if (err.status === 429) return res.status(503).json({ message: 'Groq rate limit hit. Try again in a moment.' });
    next(err);
  }
};

// ── POST /ai/meal-suggestions ─────────────────────────────────────────────────
export const getMealSuggestions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { mealType = 'lunch', remainingCalories = 500, preferences = '' } = req.body;

    const prompt = `Suggest 3 healthy ${mealType} options for someone with:
- Remaining calories today: ~${remainingCalories} kcal
- Protein goal: ${user.dailyProteinGoal}g/day
- Preferences / restrictions: ${preferences || 'None'}

For each, provide: name, brief description, and approximate macros (cal / protein / carbs / fat).
Format: numbered list. Be practical and delicious.`;

    const completion = await getGroq().chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are a friendly nutritionist helping plan healthy, delicious meals.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 600,
      temperature: 0.8
    });

    res.json({ success: true, suggestions: completion.choices[0].message.content });
  } catch (err) { next(err); }
};
