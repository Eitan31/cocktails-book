require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// בתחילת הקובץ, אחרי הדרישות
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // זמן המתנה לחיבור
    socketTimeoutMS: 45000, // זמן המתנה לפעולות
};

// הגדרת סכמה לקוקטייל
const cocktailSchema = new mongoose.Schema({
    name: String,
    image: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || v.startsWith('data:image') || v.startsWith('http');
            },
            message: 'Image must be either a base64 string or a valid URL'
        }
    },
    ingredients: [{
        name: String,
        amount: Number,
        unit: String
    }],
    instructions: String,
    garnish: String,
    base: String,
    era: String,
    season: String,
    year: String,
    background: String,
    glass: String
});

const Cocktail = mongoose.model('Cocktail', cocktailSchema);

// הוספת middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// נקודות קצה של ה-API
app.get('/api/cocktails', async (req, res) => {
    try {
        const cocktails = await Cocktail.find();
        console.log('Found cocktails:', cocktails.length);
        res.json(cocktails);
    } catch (error) {
        console.error('Error fetching cocktails:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
});

app.post('/api/cocktails', async (req, res) => {
    try {
        console.log('Received cocktail data:', JSON.stringify(req.body, null, 2));
        
        // בדיקת תקינות הנתונים
        if (!req.body.name) {
            return res.status(400).json({ error: 'שם הקוקטייל הוא שדה חובה' });
        }

        const cocktail = new Cocktail(req.body);
        console.log('Created cocktail document:', cocktail);
        
        const savedCocktail = await cocktail.save();
        console.log('Saved cocktail:', savedCocktail);
        
        res.status(201).json(savedCocktail);
    } catch (error) {   
        console.error('Error saving cocktail:', error);
        res.status(400).json({ 
            error: error.message,
            details: error 
        });
    }
});

app.put('/api/cocktails/:id', async (req, res) => {
    try {
        const cocktail = await Cocktail.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(cocktail);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/cocktails/:id', async (req, res) => {
    try {
        await Cocktail.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// הוספת route לבדיקת חיבור
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        env: {
            node_env: process.env.NODE_ENV,
            database: mongoose.connection.db?.databaseName
        }
    });
});

// הנתיב הכללי חייב להיות אחרון
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// שינוי החיבור ל-MongoDB
mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
    .then(() => {
        console.log('Connected to MongoDB successfully');
        console.log('Database:', mongoose.connection.db.databaseName);
        
        // בתחילת הקובץ, אחרי החיבור ל-MongoDB
        mongoose.connection.once('open', async () => {
            console.log('MongoDB connection is open');
            
            // בדיקת הקוקטיילים הקיימים
            try {
                const count = await Cocktail.countDocuments();
                console.log(`Found ${count} cocktails in database`);
            } catch (err) {
                console.error('Error counting cocktails:', err);
            }
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        // ניסיון חיבור חוזר אחרי 5 שניות
        setTimeout(() => {
            console.log('Retrying MongoDB connection...');
            mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
        }, 5000);
    });

// הוספת מאזין לאירועי חיבור
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy. Trying ${PORT + 1}`);
        server.listen(PORT + 1);
    } else {
        console.error('Server error:', err);
    }
}); 