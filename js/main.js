// מערך לשמירת הקוקטיילים
let cocktails = [];

// הוספת משתנים גלובליים חדשים
let ingredients = [];
let bases = [
    'וודקה',
    'ג\'ין',
    'רום',
    'טקילה',
    'וויסקי',
    'אחר'
];

// הוספת משתנה גלובלי חדש לתקופות
let eras = [
    'טרום תקופת היובש',
    'תקופת היובש',
    'אחרי תקופת היובש',
    'מודרני',
    'אחר'
];

// הוספת משתנה גלובלי חדש לקישוטים
let garnishes = [
    'פלח לימון',
    'פלח תפוז',
    'זית',
    'דובדבן מרסקינו',
    'קליפת לימון',
    'קליפת תפוז',
    'עלה נענע',
    'מלח',
    'סוכר',
    'קינמון',
    'פרח',
    'אחר'
];

// הוספת משתנה גלובלי חדש ליחידות מידה
let measurementUnits = [
    'ml',
    'oz',
    'dash',
    'drops',
    'cube',
    'unit',
    'spoon',
    'tspoon',
    'אחר'
];

// הוספת משתנה גלובלי לסוגי כוסות
let glassTypes = [
    'כוס מרטיני',
    'כוס היי-בול',
    'כוס רוקס',
    'כוס קולינס',
    'כוס קופר',
    'כוס הוריקן',
    'כוס שמפניה',
    'כוס וויסקי',
    'כוס יין',
    'כוס טיקי',
    'כוס זכוכית',
    'אחר'
];

// הוספת מאגר אייקונים לסוגי כוסות
const glassEmojis = {
    'כוס מרטיני': '🍸',
    'כוס היי-בול': '🥃',
    'כוס רוקס': '🥃',
    'כוס קולינס': '🥛',
    'כוס קופר': '🍺',
    'כוס הוריקן': '🍹',
    'כוס שמפניה': '🥂',
    'כוס וויסקי': '🥃',
    'כוס יין': '🍷',
    'כוס טיקי': '🗿',
    'כוס זכוכית': '🥛',
    'אחר': '🥤'
};

// הוספת מאגר אימוג'ים לעונות השנה
const seasonEmojis = {
    'קיץ': '☀️',
    'חורף': '❄️',
    'סתיו': '🍂',
    'אביב': '🌸',
    'כל השנה': '🗓️'
};

// הוספת פונקציות API
const API_URL = 'https://cocktails-book.onrender.com/api';  // החלף ל-URL שקיבלת מ-Render

// פונקציה חדשה לבדיקת חיבור
async function checkConnection() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        console.log('Server health check:', data);
        return data;
    } catch (error) {
        console.error('Server health check failed:', error);
        throw error;
    }
}

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // בדיקת חיבור לפני טעינת הנתונים
        await checkConnection();
        
        // קודם כל נטען את הקוקטיילים מהשרת
        const response = await fetch(`${API_URL}/cocktails`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        cocktails = data;
        
        // אחר כך נטען את שאר הנתונים
        loadIngredients();
        loadGarnishes();
        loadUnits();
        
        // טעינת סוגי כוסות שמורים
        const savedGlasses = localStorage.getItem('savedGlasses');
        if (savedGlasses) {
            glassTypes = JSON.parse(savedGlasses);
        }
        updateGlassesDatalist();
        
        // נרנדר את הקוקטיילים
        renderCocktails();
        
        // נוסיף את כל מאזיני האירועים
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        document.getElementById('cocktailsList').innerHTML = 
            '<div class="error-message">שגיאה בטעינת הנתונים. אנא רענן את הדף.</div>';
    }
});

// פונקציה חדשה להגדרת מאזיני אירועים
function setupEventListeners() {
    document.getElementById('addCocktailBtn').addEventListener('click', openModal);
    document.getElementById('cocktailForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('searchInput').addEventListener('input', filterCocktails);
    document.getElementById('filterBase').addEventListener('change', filterCocktails);
    document.getElementById('filterSeason').addEventListener('change', filterCocktails);
    document.getElementById('filterYear').addEventListener('change', filterCocktails);
    document.getElementById('manageIngredientsBtn').addEventListener('click', openIngredientsModal);
    document.getElementById('addNewIngredientBtn').addEventListener('click', () => {
        const input = document.getElementById('newIngredientInput');
        const newIngredient = input.value.trim();
        
        if (newIngredient) {
            saveNewIngredient(newIngredient);
            input.value = '';
            renderIngredientsList();
        }
    });
    document.getElementById('newIngredientInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('addNewIngredientBtn').click();
        }
    });
    document.getElementById('manageErasBtn').addEventListener('click', openErasModal);
    document.getElementById('addNewEraBtn').addEventListener('click', () => {
        const input = document.getElementById('newEraInput');
        const newEra = input.value.trim();
        
        if (newEra) {
            saveNewEra(newEra);
            input.value = '';
            renderErasList();
        }
    });
    document.getElementById('manageUnitsBtn').addEventListener('click', openUnitsModal);
    document.getElementById('addNewUnitBtn').addEventListener('click', () => {
        const input = document.getElementById('newUnitInput');
        const newUnit = input.value.trim();
        
        if (newUnit) {
            saveNewUnit(newUnit);
            input.value = '';
            renderUnitsList();
        }
    });
    document.getElementById('newUnitInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('addNewUnitBtn').click();
        }
    });

    // הוספת מאזין לשינוי בבסיס האלכוהול
    const imageInput = document.querySelector('input[name="image"]');
    const imagePreview = document.querySelector('.image-preview');

    imageInput.addEventListener('input', () => {
        const imageUrl = imageInput.value;
        if (imageUrl) {
            imagePreview.style.backgroundImage = `url('${fixImageUrl(imageUrl)}')`;
        } else {
            imagePreview.style.backgroundImage = 'none';
        }
    });

    // מאזין לשינוי בבסיס האלכוהול
    document.querySelector('select[name="base"]').addEventListener('change', (e) => {
        if (e.target.value === 'אחר') {
            const newBase = prompt('הכנס שם של בסיס אלכוהול חדש:');
            if (newBase) {
                saveNewBase(newBase);
                e.target.value = newBase;
            } else {
                e.target.value = '';
            }
        }
    });

    // הוספת מאזין לשדה התקופה
    const eraInput = document.querySelector('input[name="era"]');
    eraInput.addEventListener('change', () => {
        if (eraInput.value) {
            saveNewEra(eraInput.value);
        }
    });

    // הוספת מאזין לשדה הקישוט
    const garnishInput = document.querySelector('input[name="garnish"]');
    garnishInput.addEventListener('change', () => {
        if (garnishInput.value) {
            saveNewGarnish(garnishInput.value);
        }
    });

    document.getElementById('manageGlassesBtn').addEventListener('click', openGlassesModal);
    document.getElementById('addNewGlassBtn').addEventListener('click', () => {
        const input = document.getElementById('newGlassInput');
        const newGlass = input.value.trim();
        
        if (newGlass) {
            saveNewGlass(newGlass);
            input.value = '';
            renderGlassesList();
        }
    });

    // הוספת מאזין לשדה סוג הכוס
    const glassInput = document.querySelector('input[name="glass"]');
    glassInput.addEventListener('change', () => {
        if (glassInput.value) {
            saveNewGlass(glassInput.value);
        }
    });

    // הוספת מאזיני אירועים לתמונות
    setupImageListeners();

    // הוספת הכפתורים החדשים
    setupRandomButtons();
}

// פונקציית סינון קוקטיילים
function filterCocktails() {
    renderCocktails(); // זה יפעיל את הפילטור דרך filterCocktail
}

// פונקציות עזר
async function loadCocktails() {
    try {
        const response = await fetch(`${API_URL}/cocktails`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
            cocktails = data;
            renderCocktails();
        } else {
            console.error('Data is not an array:', data);
        }
    } catch (error) {
        console.error('Error loading cocktails:', error);
        document.getElementById('cocktailsList').innerHTML = 
            '<div class="error-message">שגיאה בטעינת הקוקטיילים. אנא נסה שוב מאוחר יותר.</div>';
    }
}

function saveCocktails() {
    localStorage.setItem('cocktails', JSON.stringify(cocktails));
}

function openModal(cocktail = null) {
    const modal = document.getElementById('cocktailModal');
    const form = document.getElementById('cocktailForm');
    const imagePreview = document.querySelector('.image-preview');
    
    // איפוס הטופס תמיד קודם
    form.reset();
    const ingredientsList = document.getElementById('ingredientsList');
    ingredientsList.innerHTML = '';

    if (cocktail) {
        // מילוי הטופס בנתוני הקוקטייל לעריכה
        form.elements['name'].value = cocktail.name || '';
        form.elements['image'].value = cocktail.image || '';
        form.elements['base'].value = cocktail.base || '';
        form.elements['era'].value = cocktail.era || '';
        form.elements['season'].value = cocktail.season || '';
        form.elements['year'].value = cocktail.year || '';
        form.elements['instructions'].value = cocktail.instructions || '';
        form.elements['garnish'].value = cocktail.garnish || '';
        form.elements['background'].value = cocktail.background || '';
        form.elements['glass'].value = cocktail.glass || '';
        
        // עדכון תצוגה מקדימה של התמונה
        if (cocktail.image) {
            imagePreview.style.backgroundImage = `url('${fixImageUrl(cocktail.image)}')`;
        } else {
            imagePreview.style.backgroundImage = 'none';
        }
        
        // מילוי המרכיבים הקיימים
        cocktail.ingredients?.forEach(ing => {
            addIngredientToForm(ing);
        });
        
        // שמירת ה-_id בדאטה של הטופס
        form.dataset.editId = cocktail._id;
    } else {
        // הוספת 3 שורות ריקות למרכיבים כברירת מחדל
        for (let i = 0; i < 3; i++) {
            addIngredientToForm();
        }
        // מחיקת ה-id במקרה של קוקטייל חדש
        delete form.dataset.editId;
    }

    // עדכון כותרת המודל
    const modalTitle = modal.querySelector('h2');
    if (modalTitle) {
        modalTitle.textContent = cocktail ? 'עריכת קוקטייל' : 'הוספת קוקטייל חדש';
    }

    modal.style.display = 'block';

    // סגירת המודל המפורט אם הוא פתוח
    const detailedModal = document.querySelector('.cocktail-modal');
    if (detailedModal) {
        detailedModal.remove();
    }
}

// פונקציית עזר להוספת שורת מרכיב לטופס
function addIngredientToForm(ingredient = null) {
    const ingredientsList = document.getElementById('ingredientsList');
    const ingredientItem = document.createElement('div');
    ingredientItem.className = 'ingredient-item';
    ingredientItem.innerHTML = `
        <input type="text" name="ingredient-name[]" value="${ingredient?.name || ''}" required list="ingredientsList-options">
        <input type="number" name="ingredient-amount[]" value="${ingredient?.amount || ''}" required>
        <div class="unit-wrapper">
            <select name="ingredient-unit[]" required>
                ${measurementUnits.map(unit => 
                    `<option value="${unit}" ${ingredient?.unit === unit ? 'selected' : ''}>${getUnitLabel(unit)}</option>`
                ).join('')}
            </select>
            <input type="text" class="custom-unit-input" style="display: none" placeholder="הכנס יחידת מידה חדשה">
        </div>
        <button type="button" class="btn-remove-ingredient" onclick="removeIngredient(this)">×</button>
    `;
    ingredientsList.appendChild(ingredientItem);

    // הוספת מאזין לשדה יחידת המידה
    setupIngredientItemListeners(ingredientItem);
}

// פונקציית עזר להגדרת מאזינים לשורת מרכיב
function setupIngredientItemListeners(ingredientItem) {
    const unitSelect = ingredientItem.querySelector('select[name="ingredient-unit[]"]');
    const customUnitInput = ingredientItem.querySelector('.custom-unit-input');
    
    unitSelect.addEventListener('change', (e) => {
        if (e.target.value === 'אחר') {
            customUnitInput.style.display = 'block';
            customUnitInput.focus();
        } else {
            customUnitInput.style.display = 'none';
        }
    });

    customUnitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newUnit = e.target.value.trim();
            if (newUnit) {
                saveNewUnit(newUnit);
                unitSelect.value = newUnit;
                customUnitInput.style.display = 'none';
                customUnitInput.value = '';
            }
        }
    });
}

function closeModal() {
    document.getElementById('cocktailModal').style.display = 'none';
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const cocktailData = {
        name: formData.get('name'),
        image: formData.get('image'),
        base: formData.get('base'),
        era: formData.get('era'),
        season: formData.get('season'),
        year: formData.get('year'),
        instructions: formData.get('instructions'),
        garnish: formData.get('garnish'),
        background: formData.get('background'),
        glass: formData.get('glass'),
        ingredients: getIngredientsFromForm()
    };

    // הוספת ה-_id רק אם זו עריכה וה-ID קיים
    const editId = event.target.dataset.editId;
    if (editId && editId !== 'undefined') {
        cocktailData._id = editId;
    }

    console.log('Form data before save:', cocktailData);

    try {
        const savedCocktail = await saveCocktail(cocktailData);
        console.log('Cocktail saved successfully:', savedCocktail);
        closeModal();
        await loadCocktails(); // טעינה מחדש של הרשימה
    } catch (error) {
        console.error('Error in form submission:', error);
        alert('שגיאה בשמירת הקוקטייל: ' + error.message);
    }
}

function renderCocktails() {
    const filteredCocktails = getFilteredCocktails();
    const container = document.getElementById('cocktailsList');
    
    if (filteredCocktails.length === 0) {
        container.innerHTML = '<div class="no-cocktails">לא נמצאו קוקטיילים</div>';
        return;
    }

    container.innerHTML = filteredCocktails.map(cocktail => `
        <div class="cocktail-card" onclick="openDetailedModal(${JSON.stringify(cocktail).replace(/"/g, '&quot;')}, event)">
            <img 
                class="cocktail-image" 
                src="${fixImageUrl(cocktail.image)}" 
                alt="${cocktail.name}"
                onerror="this.src='images/default-cocktail.jpg'"
            >
            ${cocktail.year ? `<div class="year-badge">${cocktail.year}</div>` : ''}
            ${cocktail.era ? `<div class="era-badge">${cocktail.era}</div>` : ''}
            <h3 class="cocktail-name">${cocktail.name}</h3>
            <div class="cocktail-preview">
                <h4 class="preview-title">${cocktail.name}</h4>
                <div class="preview-ingredients">
                    ${cocktail.ingredients.map(ing => 
                        `<div class="preview-ingredient">
                            ${ing.amount} ${getUnitDisplay(ing.unit, ing.amount)} ${ing.name}
                        </div>`
                    ).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// פונקציית סינון קוקטיילים
function filterCocktail(cocktail) {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const selectedBase = document.getElementById('filterBase')?.value || '';
    const selectedSeason = document.getElementById('filterSeason')?.value || '';
    const selectedYear = document.getElementById('filterYear')?.value || '';

    // בדיקת חיפוש טקסט
    const matchesSearch = cocktail.name.toLowerCase().includes(searchTerm);
    
    // בדיקת בסיס אלכוהול
    const matchesBase = !selectedBase || cocktail.base === selectedBase;
    
    // בדיקת עונה
    const matchesSeason = !selectedSeason || cocktail.season === selectedSeason;
    
    // בדיקת שנה
    let matchesYear = true;
    if (selectedYear && cocktail.year) {
        const year = parseInt(cocktail.year);
        switch(selectedYear) {
            case '1800-1900':
                matchesYear = year >= 1800 && year <= 1900;
                break;
            case '1901-1920':
                matchesYear = year >= 1901 && year <= 1920;
                break;
            case '1921-1950':
                matchesYear = year >= 1921 && year <= 1950;
                break;
            case '1951-2000':
                matchesYear = year >= 1951 && year <= 2000;
                break;
            case '2001-היום':
                matchesYear = year >= 2001;
                break;
        }
    }

    // החזרת תוצאת הסינון
    return matchesSearch && matchesBase && matchesSeason && matchesYear;
}

async function deleteCocktail(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק קוקטייל זה?')) {
        try {
            const response = await fetch(`${API_URL}/cocktails/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // מחיקה מהמערך המקומי
                cocktails = cocktails.filter(c => c._id !== id);
                // טעינה מחדש של הקוקטיילים מהשרת
                await loadCocktails();
                // רינדור מחדש של הרשימה
                renderCocktails();
            } else {
                throw new Error('Failed to delete cocktail');
            }
        } catch (error) {
            console.error('Error deleting cocktail:', error);
            alert('שגיאה במחיקת הקוקטייל. אנא נסה שוב.');
        }
    }
}

// הוספת פונקציות חדשות לטיפול במרכיבים
function addIngredient() {
    const ingredientsList = document.getElementById('ingredientsList');
    const newIngredient = document.createElement('div');
    newIngredient.className = 'ingredient-item';
    newIngredient.innerHTML = `
        <input type="text" name="ingredient-name[]" placeholder="שם המרכיב" required list="ingredientsList-options">
        <input type="number" name="ingredient-amount[]" placeholder="כמות" required>
        <div class="unit-wrapper">
            <select name="ingredient-unit[]" required>
                ${measurementUnits.map(unit => `<option value="${unit}">${getUnitLabel(unit)}</option>`).join('')}
            </select>
            <input type="text" class="custom-unit-input" style="display: none" placeholder="הכנס יחידת מידה חדשה">
        </div>
        <button type="button" class="btn-remove-ingredient" onclick="removeIngredient(this)">×</button>
    `;
    ingredientsList.appendChild(newIngredient);

    // הוספת מאזין לשדה המרכיב החדש
    const newInput = newIngredient.querySelector('input[name="ingredient-name[]"]');
    newInput.addEventListener('change', () => {
        if (newInput.value) {
            saveNewIngredient(newInput.value);
        }
    });

    // הוספת מאזין ליחידת המידה
    const unitSelect = newIngredient.querySelector('select[name="ingredient-unit[]"]');
    const customUnitInput = newIngredient.querySelector('.custom-unit-input');
    
    unitSelect.addEventListener('change', (e) => {
        if (e.target.value === 'אחר') {
            customUnitInput.style.display = 'block';
            customUnitInput.focus();
        } else {
            customUnitInput.style.display = 'none';
        }
    });

    customUnitInput.addEventListener('blur', (e) => {
        const newUnit = e.target.value.trim();
        if (newUnit) {
            saveNewUnit(newUnit);
            unitSelect.value = newUnit;
            customUnitInput.style.display = 'none';
            customUnitInput.value = '';
        } else {
            unitSelect.value = 'ml'; // ברירת מחדל
            customUnitInput.style.display = 'none';
        }
    });
}

function removeIngredient(button) {
    const ingredientsList = document.getElementById('ingredientsList');
    if (ingredientsList.children.length > 1) {
        button.parentElement.remove();
    }
}

// פונקציה לתיקון כתובות URL של תמונות
function fixImageUrl(url) {
    if (!url) return 'images/default-cocktail.jpg';
    
    // אם זו תמונת base64, נחזיר אותה כמו שהיא
    if (url.startsWith('data:image')) {
        return url;
    }

    // אם זו כתובת URL רגילה, נוודא שהיא תקינה
    try {
        const urlObj = new URL(url);
        return urlObj.toString();
    } catch (e) {
        console.warn('Invalid image URL:', url);
        return 'images/default-cocktail.jpg';
    }
}

// פונקציה לטעינת המרכיבים השמורים
function loadIngredients() {
    const savedIngredients = localStorage.getItem('savedIngredients');
    if (savedIngredients) {
        ingredients = JSON.parse(savedIngredients);
    }
    const savedBases = localStorage.getItem('savedBases');
    if (savedBases) {
        bases = JSON.parse(savedBases);
    }
    const savedEras = localStorage.getItem('savedEras');
    if (savedEras) {
        eras = JSON.parse(savedEras);
    }
    updateIngredientsDatalist();
    updateBasesSelect();
    updateErasSelect();
}

// פונקציה לשמירת מרכיבים חדשים
function saveNewIngredient(name) {
    if (name && !ingredients.includes(name)) {
        ingredients.push(name);
        localStorage.setItem('savedIngredients', JSON.stringify(ingredients));
        updateIngredientsDatalist();
    }
}

// פונקציה לשמירת בסיס אלכוהול חדש
function saveNewBase(name) {
    if (name && !bases.includes(name)) {
        bases.push(name);
        localStorage.setItem('savedBases', JSON.stringify(bases));
        updateBasesSelect();
    }
}

// פונקציה לעדכון רשימת המרכיבים ב-datalist
function updateIngredientsDatalist() {
    const datalist = document.getElementById('ingredientsList-options');
    if (!datalist) return;
    
    datalist.innerHTML = ingredients
        .map(ingredient => `<option value="${ingredient}">`)
        .join('');
}

// פונקציה לעדכון רשימת בסיסי האלכוהול
function updateBasesSelect() {
    const baseSelects = document.querySelectorAll('select[name="base"]');
    const filterBase = document.getElementById('filterBase');
    
    const options = bases.map(base => {
        const label = base === 'אחר' ? 'אחר' : base;
        return `<option value="${base}">${label}</option>`;
    }).join('');

    baseSelects.forEach(select => {
        select.innerHTML = `<option value="">בחר בסיס אלכוהול</option>${options}`;
    });
    
    filterBase.innerHTML = `<option value="">בחר בסיס אלכוהול</option>${options}`;
}

// פונקציה חדשה לשמירת תקופה חדשה
function saveNewEra(name) {
    if (name && !eras.includes(name)) {
        eras.push(name);
        localStorage.setItem('savedEras', JSON.stringify(eras));
        updateErasSelect();
    }
}

// פונקציה חדשה לעדכון רשימת התקופות
function updateErasSelect() {
    const eraInput = document.querySelector('input[name="era"]');
    eraInput.setAttribute('list', 'erasList-options');
}

// פונקציה לעדכון רשימת התקופות ב-datalist
function updateErasDatalist() {
    const datalist = document.getElementById('erasList-options');
    if (!datalist) return;
    
    datalist.innerHTML = eras
        .map(era => `<option value="${era}">`)
        .join('');
}

// פונקציה חדשה לפתיחת מודל מפורט
function openDetailedModal(cocktail, event) {
    if (!event) return;  // אם אין event, נצא מהפונקציה
    
    const card = event.currentTarget;
    
    if (card.classList.contains('expanded')) {
        card.classList.remove('expanded');
        return;
    }
    
    document.querySelectorAll('.cocktail-card.expanded').forEach(expandedCard => {
        expandedCard.classList.remove('expanded');
    });
    
    card.classList.add('expanded');
    
    card.innerHTML = `
        <img 
            class="cocktail-image" 
            src="${fixImageUrl(cocktail.image)}" 
            alt="${cocktail.name}"
            onerror="this.src='images/default-cocktail.jpg'"
        >
        ${cocktail.year ? `<div class="year-badge">${cocktail.year}</div>` : ''}
        ${cocktail.era ? `<div class="era-badge">${cocktail.era}</div>` : ''}
        <div class="cocktail-preview">
            <h3 class="preview-title">${cocktail.name}</h3>
            
            <div class="meta-item">
                <div class="meta-label">בסיס</div>
                <div class="meta-value">${cocktail.base}</div>
            </div>
            
            ${cocktail.season ? `
                <div class="meta-item">
                    <div class="meta-label">עונה מועדפת</div>
                    <div class="meta-value">
                        <span role="img">${seasonEmojis[cocktail.season] || ''}</span>
                        ${cocktail.season}
                    </div>
                </div>
            ` : ''}
            
            <div class="ingredients-section">
                <h4>מרכיבים:</h4>
                <div class="ingredients-list">
                    ${cocktail.ingredients.map(ing => `
                        <div class="ingredient-item">
                            ${ing.amount} ${getUnitDisplay(ing.unit, ing.amount)} ${ing.name}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="instructions-section">
                <h4>הוראות הכנה:</h4>
                <p>${cocktail.instructions}</p>
            </div>
            
            <div class="actions-section">
                <button class="btn edit-btn" onclick="openModal(${JSON.stringify(cocktail).replace(/"/g, '&quot;')})">
                    ערוך
                </button>
                <button class="btn delete-btn" onclick="deleteCocktail('${cocktail._id}')">
                    מחק
                </button>
            </div>
        </div>
    `;
    
    document.addEventListener('click', function closeCard(e) {
        if (!card.contains(e.target)) {
            card.classList.remove('expanded');
            document.removeEventListener('click', closeCard);
        }
    });
}

// פונקציה להצגת/הסתרת מידע נוסף
function toggleAdditionalInfo(button) {
    const additionalInfo = button.parentElement.nextElementSibling;
    const icon = button.querySelector('.toggle-icon');
    
    additionalInfo.classList.toggle('visible');
    icon.textContent = additionalInfo.classList.contains('visible') ? '▲' : '▼';
}

// פונקציה חדשה לטעינת קישוטים שמורים
function loadGarnishes() {
    const savedGarnishes = localStorage.getItem('savedGarnishes');
    if (savedGarnishes) {
        garnishes = JSON.parse(savedGarnishes);
    }
    updateGarnishesDatalist();
}

// פונקציה חדשה לשמירת קישוט חדש
function saveNewGarnish(name) {
    if (name && !garnishes.includes(name)) {
        garnishes.push(name);
        localStorage.setItem('savedGarnishes', JSON.stringify(garnishes));
        updateGarnishesDatalist();
    }
}

// פונקציה חדשה לעדכון רשימת הקישוטים
function updateGarnishesDatalist() {
    const datalist = document.getElementById('garnishesList-options');
    datalist.innerHTML = garnishes
        .map(garnish => `<option value="${garnish}">`)
        .join('');
}

// פונקציה חדשה לטעינת יחידות מידה שמורות
function loadUnits() {
    const savedUnits = localStorage.getItem('savedUnits');
    if (savedUnits) {
        measurementUnits = JSON.parse(savedUnits);
    }
    updateUnitsSelect();
}

// פונקציה לשמירת יחידת מידה חדשה
function saveNewUnit(name) {
    if (name && !measurementUnits.includes(name)) {
        // הוספת היחידה החדשה לפני האופציה "אחר"
        const otherIndex = measurementUnits.indexOf('אחר');
        if (otherIndex !== -1) {
            measurementUnits.splice(otherIndex, 0, name);
        } else {
            measurementUnits.push(name);
        }
        localStorage.setItem('savedUnits', JSON.stringify(measurementUnits));
        updateUnitsSelect();
    }
}

// פונקציה לעדכון רשימת יחידות המידה
function updateUnitsSelect() {
    const unitSelects = document.querySelectorAll('select[name="ingredient-unit[]"]');
    
    // מיון היחידות כך ש"אחר" יהיה תמיד אחרון
    const sortedUnits = measurementUnits
        .filter(unit => unit !== 'אחר')
        .sort()
        .concat(['אחר']);
    
    const options = sortedUnits.map(unit => {
        const label = getUnitLabel(unit);
        return `<option value="${unit}">${label}</option>`;
    }).join('');

    unitSelects.forEach(select => {
        select.innerHTML = options;
    });
}

// פונקציה לקבלת תווית מתאימה ליחידת מידה
function getUnitLabel(unit) {
    switch(unit) {
        case 'ml': return 'מ"ל';
        case 'oz': return 'oz';
        case 'dash': return 'dash';
        case 'drops': return 'טיפות';
        case 'cube': return 'קוביית';
        case 'unit': return 'יחידה';
        case 'spoon': return 'כף';
        case 'tspoon': return 'כפית';
        case 'אחר': return 'אחר...';
        default: return unit;
    }
}

// פונקציה חדשה לקבלת תצוגת יחידת מידה עם התחשבות בכמות
function getUnitDisplay(unit, amount) {
    if (unit === 'cube') {
        return Number(amount) === 1 ? 'קוביית' : 'קוביות';
    }
    return getUnitLabel(unit);
}

// הוספת הפונקציות החדשות
function openIngredientsModal() {
    const modal = document.getElementById('ingredientsModal');
    modal.style.display = 'block';
    renderIngredientsList();
    initDraggableLists();
}

function closeIngredientsModal() {
    const modal = document.getElementById('ingredientsModal');
    modal.style.display = 'none';
}

function renderIngredientsList() {
    const container = document.querySelector('.ingredients-container');
    if (!container) return;

    container.innerHTML = ingredients
        .map(ing => `
            <div class="ingredient-list-item draggable-item" data-value="${ing}">
                <span>☰ ${ing}</span>
                <button class="delete-ingredient" onclick="deleteIngredient('${ing}')">&times;</button>
            </div>
        `)
        .join('');
    
    initDraggableContainer('ingredients-container', ingredients, renderIngredientsList);
}

function deleteIngredient(name) {
    if (confirm(`האם אתה בטוח שברצונך למחוק את המרכיב "${name}"?`)) {
        const index = ingredients.indexOf(name);
        if (index !== -1) {
            ingredients.splice(index, 1);
            localStorage.setItem('savedIngredients', JSON.stringify(ingredients));
            renderIngredientsList();
            updateIngredientsDatalist();
        }
    }
}

// הוספת הפונקציות החדשות לניהול תקופות
function openErasModal() {
    const modal = document.getElementById('erasModal');
    modal.style.display = 'block';
    renderErasList();
    initDraggableLists();
}

function closeErasModal() {
    const modal = document.getElementById('erasModal');
    modal.style.display = 'none';
}

// הוספת הפונקציות החדשות לניהול יחידות מידה
function openUnitsModal() {
    const modal = document.getElementById('unitsModal');
    modal.style.display = 'block';
    renderUnitsList();
    initDraggableLists();
}

function closeUnitsModal() {
    const modal = document.getElementById('unitsModal');
    modal.style.display = 'none';
}

function renderUnitsList() {
    const container = document.querySelector('.units-container');
    container.innerHTML = measurementUnits
        .map(unit => `
            <div class="unit-list-item draggable-item" data-value="${unit}">
                <span>${getUnitLabel(unit)}</span>
                <button class="delete-unit" onclick="deleteUnit('${unit}')">&times;</button>
            </div>
        `)
        .join('');
    
    initDraggableContainer('units-container', measurementUnits, renderUnitsList);
}

function deleteUnit(unit) {
    if (confirm(`האם אתה בטוח שברצונך למחוק את יחידת המידה "${getUnitLabel(unit)}"?`)) {
        const index = measurementUnits.indexOf(unit);
        if (index !== -1) {
            measurementUnits.splice(index, 1);
            localStorage.setItem('savedUnits', JSON.stringify(measurementUnits));
            renderUnitsList();
            updateUnitsSelect();
        }
    }
}

// הוספת הפונקציות החדשות לניהול תקופות
function renderErasList() {
    const container = document.querySelector('.eras-container');
    container.innerHTML = eras
        .map(era => `
            <div class="era-list-item draggable-item" data-value="${era}">
                <span>${era}</span>
                <button class="delete-era" onclick="deleteEra('${era}')">&times;</button>
            </div>
        `)
        .join('');
    
    initDraggableContainer('eras-container', eras, renderErasList);
}

function deleteEra(era) {
    if (confirm(`האם אתה בטוח שברצונך למחוק את התקופה "${era}"?`)) {
        const index = eras.indexOf(era);
        if (index !== -1) {
            eras.splice(index, 1);
            localStorage.setItem('savedEras', JSON.stringify(eras));
            renderErasList();
            updateErasDatalist();
        }
    }
}

// הוספת פונקציות גרירה ומיון
function initDraggableLists() {
    initDraggableContainer('ingredients-container', ingredients, renderIngredientsList);
    initDraggableContainer('units-container', measurementUnits, renderUnitsList);
    initDraggableContainer('eras-container', eras, renderErasList);
}

function initDraggableContainer(containerId, array, renderFunction) {
    const container = document.querySelector(`.${containerId}`);
    if (!container) return;

    const sortable = Sortable.create(container, {
        animation: 150,
        handle: '.drag-handle',  // שימוש בקלאס במקום בסמל
        draggable: '.draggable-item',
        ghostClass: 'drag-ghost',
        onEnd: function(evt) {
            const items = [...container.querySelectorAll('.draggable-item')];
            const newOrder = items.map(item => item.dataset.value);
            
            // עדכון המערך המתאים
            if (containerId === 'ingredients-container') {
                ingredients = [...newOrder];
                localStorage.setItem('savedIngredients', JSON.stringify(ingredients));
                updateIngredientsDatalist();
            } else if (containerId === 'units-container') {
                measurementUnits = [...newOrder];
                localStorage.setItem('savedUnits', JSON.stringify(measurementUnits));
                updateUnitsSelect();
            } else if (containerId === 'eras-container') {
                eras = [...newOrder];
                localStorage.setItem('savedEras', JSON.stringify(eras));
                updateErasDatalist();
            }
        }
    });

    return sortable;
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.draggable-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// פונקציה לשמירת קוקטייל חדש
async function saveCocktail(cocktailData) {
    try {
        // וידוא שיש שם לקוקטייל
        if (!cocktailData.name) {
            throw new Error('שם הקוקטייל הוא שדה חובה');
        }

        const method = cocktailData._id ? 'PUT' : 'POST';
        const url = cocktailData._id 
            ? `${API_URL}/cocktails/${cocktailData._id}`
            : `${API_URL}/cocktails`;

        console.log('Request method:', method);
        console.log('Request URL:', url);
        console.log('Sending data:', cocktailData);

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cocktailData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            throw new Error(errorData.error || `שגיאה בשמירת הקוקטייל (${response.status})`);
        }

        const savedCocktail = await response.json();
        console.log('Server response:', savedCocktail);

        // עדכון המערך המקומי
        if (method === 'POST') {
            cocktails.push(savedCocktail);
        } else {
            const index = cocktails.findIndex(c => c._id === cocktailData._id);
            if (index !== -1) {
                cocktails[index] = savedCocktail;
            }
        }
        
        renderCocktails();
        return savedCocktail;
    } catch (error) {
        console.error('Error saving cocktail:', error);
        throw error;
    }
}

// פונקציה לקבלת המרכיבים מהטופס
function getIngredientsFromForm() {
    const ingredientNames = document.getElementsByName('ingredient-name[]');
    const ingredientAmounts = document.getElementsByName('ingredient-amount[]');
    const ingredientUnits = document.getElementsByName('ingredient-unit[]');
    
    const ingredients = [];
    
    for (let i = 0; i < ingredientNames.length; i++) {
        if (ingredientNames[i].value) {
            ingredients.push({
                name: ingredientNames[i].value,
                amount: parseFloat(ingredientAmounts[i].value),
                unit: ingredientUnits[i].value
            });
        }
    }
    
    return ingredients;
}

// עדכון פונקציית handleFormSubmit
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const cocktailData = {
        name: formData.get('name'),
        image: formData.get('image'),
        base: formData.get('base'),
        era: formData.get('era'),
        season: formData.get('season'),
        year: formData.get('year'),
        instructions: formData.get('instructions'),
        garnish: formData.get('garnish'),
        background: formData.get('background'),
        glass: formData.get('glass'),
        ingredients: getIngredientsFromForm()
    };

    // הוספת ה-_id רק אם זו עריכה וה-ID קיים
    const editId = event.target.dataset.editId;
    if (editId && editId !== 'undefined') {
        cocktailData._id = editId;
    }

    console.log('Form data:', cocktailData);

    try {
        await saveCocktail(cocktailData);
        closeModal();
    } catch (error) {
        console.error('Error in form submission:', error);
    }
}

// פונקציה להעברת הנתונים הקיימים לשרת
async function migrateExistingDataToServer() {
    const savedCocktails = localStorage.getItem('cocktails');
    if (savedCocktails) {
        try {
            const existingCocktails = JSON.parse(savedCocktails);
            if (!Array.isArray(existingCocktails)) {
                console.error('Saved cocktails is not an array');
                return;
            }
            
            for (const cocktail of existingCocktails) {
                try {
                    await saveCocktail(cocktail);
                } catch (error) {
                    console.error('Error migrating cocktail:', cocktail.name, error);
                }
            }
            
            localStorage.removeItem('cocktails');
        } catch (error) {
            console.error('Error parsing saved cocktails:', error);
        }
    }
}

// פונקציות לניהול סוגי כוסות
function openGlassesModal() {
    const modal = document.getElementById('glassesModal');
    modal.style.display = 'block';
    renderGlassesList();
    initDraggableLists();
}

function closeGlassesModal() {
    const modal = document.getElementById('glassesModal');
    modal.style.display = 'none';
}

function renderGlassesList() {
    const container = document.querySelector('.glasses-container');
    container.innerHTML = glassTypes
        .map(glass => `
            <div class="draggable-item" data-value="${glass}">
                <span><span class="drag-handle">☰</span> ${glass}</span>
                <button class="delete-glass" onclick="deleteGlass('${glass}')">&times;</button>
            </div>
        `)
        .join('');
    
    initDraggableContainer('glasses-container', glassTypes, renderGlassesList);
}

function deleteGlass(glass) {
    if (confirm(`האם אתה בטוח שברצונך למחוק את סוג הכוס "${glass}"?`)) {
        const index = glassTypes.indexOf(glass);
        if (index !== -1) {
            glassTypes.splice(index, 1);
            localStorage.setItem('savedGlasses', JSON.stringify(glassTypes));
            renderGlassesList();
        }
    }
}

function saveNewGlass(glass) {
    if (!glassTypes.includes(glass)) {
        glassTypes.push(glass);
        localStorage.setItem('savedGlasses', JSON.stringify(glassTypes));
        updateGlassesDatalist();
    }
}

function updateGlassesDatalist() {
    const datalist = document.getElementById('glassList-options');
    datalist.innerHTML = glassTypes
        .map(glass => `<option value="${glass}">`)
        .join('');
}

// פונקציה לקבלת האייקון המתאים לסוג הכוס
function getGlassEmoji(glassType) {
    return glassEmojis[glassType] || '🥤';
}

// הוספת פונקציות להמרת תמונה ל-Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// עדכון מאזיני האירועים לתמונות
function setupImageListeners() {
    const imageFile = document.getElementById('imageFile');
    const imageUrl = document.getElementById('imageUrl');
    const imagePreview = document.querySelector('.image-preview');

    // מאזין לבחירת קובץ
    imageFile.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const base64Image = await getBase64(file);
                imagePreview.style.backgroundImage = `url('${base64Image}')`;
                imageUrl.value = base64Image; // שמירת התמונה כ-Base64 בשדה הקישור
            } catch (error) {
                console.error('Error converting image:', error);
                alert('שגיאה בטעינת התמונה');
            }
        }
    });

    // מאזין להזנת URL
    imageUrl.addEventListener('input', () => {
        const imageUrl = imageUrl.value;
        if (imageUrl) {
            imagePreview.style.backgroundImage = `url('${fixImageUrl(imageUrl)}')`;
            imageFile.value = ''; // איפוס שדה הקובץ
        } else {
            imagePreview.style.backgroundImage = 'none';
        }
    });
}

// פונקציה לבחירת 5 קוקטיילים אקראיים
function getRandomCocktails(count = 5) {
    const availableCocktails = [...cocktails];
    const selected = [];
    
    while (selected.length < count && availableCocktails.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableCocktails.length);
        selected.push(availableCocktails.splice(randomIndex, 1)[0]);
    }
    
    return selected;
}

// פונקציה לבחירת קוקטייל אקראי מכל תקופה
function getRandomCocktailsByEra() {
    // קבלת כל התקופות הייחודיות מהקוקטיילים
    const uniqueEras = [...new Set(cocktails.filter(c => c.era).map(c => c.era))];
    const selected = [];
    
    uniqueEras.forEach(era => {
        const cocktailsFromEra = cocktails.filter(c => c.era === era);
        if (cocktailsFromEra.length > 0) {
            const randomIndex = Math.floor(Math.random() * cocktailsFromEra.length);
            selected.push(cocktailsFromEra[randomIndex]);
        }
    });
    
    return selected;
}

// פונקציה להצגת הקוקטיילים הנבחרים
function showRandomSelection(cocktailsList) {
    const container = document.getElementById('cocktailsList');
    
    container.innerHTML = cocktailsList.map(cocktail => `
        <div class="cocktail-card" onclick="openDetailedModal(${JSON.stringify(cocktail).replace(/"/g, '&quot;')})">
            <img 
                class="cocktail-image" 
                src="${fixImageUrl(cocktail.image)}" 
                alt="${cocktail.name}"
                onerror="this.src='images/default-cocktail.jpg'"
            >
            <h3 class="cocktail-name">${cocktail.name}</h3>
            ${cocktail.era ? `<div class="era-badge">${cocktail.era}</div>` : ''}
            <div class="cocktail-preview">
                <h4 class="preview-title">${cocktail.name}</h4>
                <div class="preview-ingredients">
                    ${cocktail.ingredients.map(ing => 
                        `<div class="preview-ingredient">
                            ${ing.amount} ${getUnitDisplay(ing.unit, ing.amount)} ${ing.name}
                        </div>`
                    ).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    // הוספת כפתור חזרה
    container.insertAdjacentHTML('beforebegin', `
        <div class="return-button-container">
            <button class="btn secondary" onclick="resetDisplay()">
                <span>↩</span> חזור לכל הקוקטיילים
            </button>
        </div>
    `);
}

// פונקציה לחזרה לתצוגה הרגילה
function resetDisplay() {
    document.querySelector('.return-button-container')?.remove();
    renderCocktails();
}

// הוספת מאזיני אירועים לכפתורים החדשים
function setupRandomButtons() {
    document.getElementById('randomFiveBtn').addEventListener('click', () => {
        const randomSelection = getRandomCocktails(5);
        showRandomSelection(randomSelection);
    });
    
    document.getElementById('randomEraBtn').addEventListener('click', () => {
        const eraSelection = getRandomCocktailsByEra();
        showRandomSelection(eraSelection);
    });
}

// הוספת פונקציית getFilteredCocktails
function getFilteredCocktails() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedBase = document.getElementById('filterBase').value;
    const selectedSeason = document.getElementById('filterSeason').value;
    const selectedYear = document.getElementById('filterYear').value;

    return cocktails.filter(cocktail => {
        const matchesSearch = cocktail.name.toLowerCase().includes(searchTerm);
        const matchesBase = !selectedBase || cocktail.base === selectedBase;
        const matchesSeason = !selectedSeason || cocktail.season === selectedSeason;
        const matchesYear = !selectedYear || (cocktail.year && isYearInRange(cocktail.year, selectedYear));
        
        return matchesSearch && matchesBase && matchesSeason && matchesYear;
    });
}

// פונקציית עזר לבדיקת טווח שנים
function isYearInRange(cocktailYear, rangeStr) {
    const year = parseInt(cocktailYear);
    switch (rangeStr) {
        case '1800-1900': return year >= 1800 && year <= 1900;
        case '1901-1920': return year >= 1901 && year <= 1920;
        case '1921-1950': return year >= 1921 && year <= 1950;
        case '1951-2000': return year >= 1951 && year <= 2000;
        case '2001-היום': return year >= 2001;
        default: return true;
    }
} 