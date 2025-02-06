require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// התחברות לבסיס הנתונים
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

// הגדרת סכמה לקוקטייל
const cocktailSchema = new mongoose.Schema({
    name: String,
    image: String,
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

app.use(cors());
app.use(express.json());

// הוספת תמיכה בקבצים סטטיים
app.use(express.static(path.join(__dirname)));

// נקודות קצה של ה-API
app.get('/api/cocktails', async (req, res) => {
    try {
        const cocktails = await Cocktail.find();
        console.log('Found cocktails:', cocktails);
        res.json(cocktails || []);
    } catch (error) {
        console.error('Error fetching cocktails:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cocktails', async (req, res) => {
    try {
        console.log('Received cocktail data:', req.body);
        const cocktail = new Cocktail(req.body);
        const savedCocktail = await cocktail.save();
        console.log('Saved cocktail:', savedCocktail);
        res.status(201).json(savedCocktail);
    } catch (error) {
        console.error('Error saving cocktail:', error);
        res.status(400).json({ error: error.message });
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

// הנתיב הכללי חייב להיות אחרון
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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