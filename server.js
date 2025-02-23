require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

// בדיקת טעינת משתני הסביבה
console.log('Environment variables:', {
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT
});

// הגדרות חיבור למונגו
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // זמן המתנה לחיבור
    socketTimeoutMS: 45000, // זמן המתנה לפעולות
};

// הוספת אזהרת strictQuery
mongoose.set('strictQuery', false);

// אובייקטים גלובליים
const defaultOptions = {
    bases: ['רום', 'וודקה', 'ג׳ין', 'טקילה', 'וויסקי', 'ברנדי', 'מזקל', 'קוניאק', 'אפרול', 'קמפרי', 'ורמוט'],
    glassTypes: ['היייבול', 'מרטיני', 'רוקס', 'קולינס', 'שמפניה', 'קופה', 'ניק ונורה', 'הוריקן', 'מרגריטה', 'כוס קופ'],
    seasons: ['קיץ', 'חורף', 'סתיו', 'אביב', 'כל השנה'],
    eras: ['תור הזהב', 'פרה-פרוהיבישן', 'פרוהיבישן', 'מודרני', 'טיקי', 'פוסט-מודרני'],
    units: ['מ״ל', 'אונקיה', 'כפית', 'כף', 'דאש', 'טיפות', 'חלק', 'יחידה', 'פרוסה', 'קוביה', 'כוס', 'בקבוק'],
    garnishes: ['לימון', 'תפוז', 'ליים', 'נענע', 'בזיליקום', 'מלפפון', 'זית', 'דובדבן', 'אננס', 'תות', 'ליים ורים מלח'],
    backgrounds: ['היסטוריה של המשקה תופיע כאן'] // ברירת מחדל
};

// הגדרת סכמה לקוקטייל
const cocktailSchema = new mongoose.Schema({
    name: String,
    image: String,
    ingredients: [{
        name: String,
        amount: String,
        unit: { 
            type: String,
            enum: defaultOptions.units
        }
    }],
    instructions: String,
    glass: {
        type: String,
        // enum: defaultOptions.glassTypes
    },
    base: {
        type: String,
        enum: defaultOptions.bases
    },
    year: String,
    era: {
        type: String,
        // enum: defaultOptions.eras  // הסרנו את הוולידציה כדי לאפשר טקסט חופשי
    },
    season: {
        type: String,
        enum: defaultOptions.seasons
    },
    garnish: {
        type: String,
        // enum: defaultOptions.garnishes
    },
    background: {
        type: String,
        default: 'היסטוריה של המשקה תופיע כאן'
    }
});

const Cocktail = mongoose.model('Cocktail', cocktailSchema);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname)));

// נקודות קצה של ה-API
app.get('/api/cocktails', async (req, res) => {
    try {
        const cocktails = await Cocktail.find();
        res.json(cocktails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cocktails', async (req, res) => {
    try {
        const cocktail = new Cocktail(req.body);
        await cocktail.save();
        res.status(201).json(cocktail);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// עדכון קוקטייל קיים
app.put('/api/cocktails/:id', async (req, res) => {
    try {
        const cocktail = await Cocktail.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!cocktail) {
            return res.status(404).json({ error: 'קוקטייל לא נמצא' });
        }
        
        res.json(cocktail);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// מחיקת קוקטייל
app.delete('/api/cocktails/:id', async (req, res) => {
    try {
        const cocktail = await Cocktail.findByIdAndDelete(req.params.id);
        
        if (!cocktail) {
            return res.status(404).json({ error: 'קוקטייל לא נמצא' });
        }
        
        res.json({ message: 'הקוקטייל נמחק בהצלחה' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// נוסיף נקודת קצה חדשה להחזרת האופציות
app.get('/api/options', (req, res) => {
    res.json(defaultOptions);
});

// בדיקת חיבור
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// נקודת קצה נפרדת להיסטוריה
app.post('/api/generate-history', async (req, res) => {
    try {
        const { name, base } = req.body;
        
        if (!name) {
            return res.status(400).json({ 
                error: 'שם הקוקטייל חסר',
                details: { receivedBody: req.body }
            });
        }

        // בדיקה שיש API key של Gemini
        if (!process.env.GEMINI_API_KEY) {
            console.error('Missing Gemini API key');
            return res.status(500).json({ error: 'תצורת שרת שגויה' });
        }

        // יצירת מופע של Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `ספר לי על ההיסטוריה של קוקטייל ${name}${base ? ` שמבוסס על ${base}` : ''}. 
            אני רוצה תשובה בעברית שכוללת:
            1. מתי ואיפה הומצא הקוקטייל
            2. סיפור מעניין על הרקע להמצאתו
            3. איך הוא השפיע על תרבות הקוקטיילים
            התשובה צריכה להיות בין 3-4 משפטים.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const history = response.text();

        res.json({ history });
        
    } catch (error) {
        console.error('Error in generate-history:', error);
        res.status(500).json({ 
            error: 'שגיאה ביצירת היסטוריה',
            details: error.message
        });
    }
});

// עדכון נקודת קצה לניהול פריטים - אחרי נתיב ההיסטוריה
app.post('/api/:type', async (req, res) => {
    const { type } = req.params;
    const { value } = req.body;
    
    try {
        if (!value) {
            throw new Error('Value is required');
        }

        switch(type) {
            case 'ingredients':
                if (!defaultOptions.ingredients) {
                    defaultOptions.ingredients = [];
                }
                defaultOptions.ingredients.push(value);
                break;
            case 'bases':
                defaultOptions.bases.push(value);
                break;
            case 'glasses':
                defaultOptions.glassTypes.push(value);
                break;
            case 'eras':
                defaultOptions.eras.push(value);
                break;
            default:
                throw new Error('Invalid type');
        }
        
        res.status(201).json({ message: 'Item added successfully', value });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// עדכון פריט קיים
app.put('/api/:type/:oldValue', async (req, res) => {
    const { type } = req.params;
    const { oldValue } = req.params;
    const { value: newValue } = req.body;
    
    try {
        if (!newValue) {
            throw new Error('New value is required');
        }

        switch(type) {
            case 'ingredients':
                if (!defaultOptions.ingredients) {
                    defaultOptions.ingredients = [];
                }
                const ingIndex = defaultOptions.ingredients.indexOf(oldValue);
                if (ingIndex !== -1) {
                    defaultOptions.ingredients[ingIndex] = newValue;
                }
                break;
            case 'bases':
                const baseIndex = defaultOptions.bases.indexOf(oldValue);
                if (baseIndex !== -1) {
                    defaultOptions.bases[baseIndex] = newValue;
                }
                break;
            case 'glasses':
                const glassIndex = defaultOptions.glassTypes.indexOf(oldValue);
                if (glassIndex !== -1) {
                    defaultOptions.glassTypes[glassIndex] = newValue;
                }
                break;
            case 'eras':
                const eraIndex = defaultOptions.eras.indexOf(oldValue);
                if (eraIndex !== -1) {
                    defaultOptions.eras[eraIndex] = newValue;
                }
                break;
            default:
                throw new Error('Invalid type');
        }
        
        res.json({ message: 'Item updated successfully', value: newValue });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// חיבור למונגו והפעלת השרת
mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
    .then(() => {
        console.log('Connected to MongoDB successfully');
        console.log('Database:', mongoose.connection.db.databaseName);
        
        app.listen(3001, () => {
            console.log('Server running on http://localhost:3001');
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        console.error('Connection string:', process.env.MONGODB_URI);
    });

// הוספת מאזינים לחיבור
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
}); 