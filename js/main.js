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
        loadGlassTypes();
        
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
    // הסרת מאזינים קיימים לפני הוספת חדשים
    const addCocktailBtn = document.getElementById('addCocktailBtn');
    const manageIngredientsBtn = document.getElementById('manageIngredientsBtn');
    const manageUnitsBtn = document.getElementById('manageUnitsBtn');
    const manageErasBtn = document.getElementById('manageErasBtn');
    const manageGlassesBtn = document.getElementById('manageGlassesBtn');
    
    // הסרת מאזינים קיימים
    addCocktailBtn.replaceWith(addCocktailBtn.cloneNode(true));
    manageIngredientsBtn.replaceWith(manageIngredientsBtn.cloneNode(true));
    manageUnitsBtn.replaceWith(manageUnitsBtn.cloneNode(true));
    manageErasBtn.replaceWith(manageErasBtn.cloneNode(true));
    manageGlassesBtn.replaceWith(manageGlassesBtn.cloneNode(true));
    
    // הוספת מאזינים חדשים
    document.getElementById('addCocktailBtn').addEventListener('click', () => openModal());
    document.getElementById('manageIngredientsBtn').addEventListener('click', openIngredientsModal);
    document.getElementById('manageUnitsBtn').addEventListener('click', openUnitsModal);
    document.getElementById('manageErasBtn').addEventListener('click', openErasModal);
    document.getElementById('manageGlassesBtn').addEventListener('click', openGlassesModal);
    
    document.getElementById('cocktailForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('searchInput').addEventListener('input', filterCocktails);
    document.getElementById('filterBase').addEventListener('change', filterCocktails);
    document.getElementById('filterSeason').addEventListener('change', filterCocktails);
    document.getElementById('filterYear').addEventListener('change', filterCocktails);
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

// פונקציה לסגירת כל החלוניות
function closeAllModals() {
    // סגירת חלוניות ניהול
    document.querySelectorAll('.modal-window').forEach(modal => {
        modal.style.display = 'none';
    });
    
    // סגירת חלוניות פרטים
    document.querySelectorAll('.cocktail-modal').forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
}

// עדכון פונקציות פתיחת חלוניות ניהול
function openModal() {
    closeAllModals();
    const modal = document.getElementById('addCocktailModal');
    modal.style.display = 'block';
}

function openIngredientsModal() {
    closeAllModals();
    const modal = document.getElementById('ingredientsModal');
    modal.style.display = 'block';
    renderIngredientsList();
}

function openUnitsModal() {
    closeAllModals();
    const modal = document.getElementById('unitsModal');
    modal.style.display = 'block';
    renderUnitsList();
}

function openErasModal() {
    closeAllModals();
    const modal = document.getElementById('erasModal');
    modal.style.display = 'block';
    renderErasList();
}

function openGlassesModal() {
    closeAllModals();
    const modal = document.getElementById('glassesModal');
    modal.style.display = 'block';
    renderGlassesList();
}

// עדכון פונקציית showCocktailDetails
function showCocktailDetails(event, element, cocktail) {
    event.stopPropagation();
    event.preventDefault();
    
    closeAllModals();
    
    const modal = document.getElementById('cocktailDetailsModal');
    
    // מיקום המודאל במרכז הכרטיס
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // חישוב מיקום מרכזי
    const centerX = rect.left + scrollLeft + (rect.width / 2);
    const centerY = rect.top + scrollTop + (rect.height / 2);
    
    modal.style.top = `${centerY - (rect.height / 2)}px`;
    modal.style.left = `${centerX - (rect.width / 2)}px`;
    modal.style.width = `${rect.width}px`;
    modal.style.height = `${rect.height}px`;
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <img class="modal-image" src="${cocktail.image}" alt="${cocktail.name}">
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <h2 class="modal-title">${cocktail.name}</h2>
                
                <div class="modal-info">
                    <div class="info-card">
                        <div class="info-label">שנת המצאה</div>
                        <div class="info-value">${cocktail.year || 'לא ידוע'}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">תקופה</div>
                        <div class="info-value">${cocktail.era || 'לא ידוע'}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">בסיס</div>
                        <div class="info-value">${cocktail.base}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">כוס</div>
                        <div class="info-value">${cocktail.glass || 'לא צוין'}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">עונה</div>
                        <div class="info-value">${cocktail.season || 'כל השנה'}</div>
                    </div>
                    ${cocktail.garnish ? `
                        <div class="info-card">
                            <div class="info-label">קישוט</div>
                            <div class="info-value">${cocktail.garnish}</div>
                        </div>
                    ` : ''}
                </div>

                <div class="ingredients-section">
                    <h3 class="section-title">מרכיבים</h3>
                    <div class="ingredients-grid">
                        ${cocktail.ingredients.map(ing => `
                            <div class="ingredient-card">
                                <span class="ingredient-amount">${ing.amount} ${getUnitDisplay(ing.unit, ing.amount)}</span>
                                <span class="ingredient-name">${ing.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="instructions-section">
                    <h3 class="section-title">הוראות הכנה</h3>
                    <div class="instructions-text">${cocktail.instructions}</div>
                </div>
            </div>
        </div>
    `;
    
    const closeModal = () => {
        modal.classList.remove('active');
        element.style.visibility = 'visible';
        document.removeEventListener('click', handleClickOutside);
    };
    
    element.style.visibility = 'hidden';
    modal.querySelector('.modal-close').addEventListener('click', closeModal, { once: true });
    
    const handleClickOutside = (e) => {
        if (!modal.querySelector('.modal-content').contains(e.target)) {
            closeModal();
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
    }, 100);
    
    modal.classList.add('active');
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
        <div class="cocktail-card" onclick="showCocktailDetails(event, this, ${JSON.stringify(cocktail).replace(/"/g, '&quot;')})">
            <img 
                class="cocktail-image" 
                src="${fixImageUrl(cocktail.image)}" 
                alt="${cocktail.name}"
                onerror="this.src='images/default-cocktail.jpg'"
            >
            <div class="front-title">${cocktail.name}</div>
            ${cocktail.era ? `<div class="era-badge">${cocktail.era}</div>` : ''}
            ${cocktail.year ? `<div class="year-badge">${cocktail.year}</div>` : ''}
            <div class="ingredients-preview">
                <h4>${cocktail.name}</h4>
                <div class="ingredients-preview-list">
                    ${cocktail.ingredients.map(ing => `
                        <div class="ingredient-preview-item">
                            ${ing.amount} ${getUnitDisplay(ing.unit, ing.amount)} ${ing.name}
                        </div>
                    `).join('')}
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

// פונקציה להצגת הקוקטיילים הנבחרים
function showRandomSelection(cocktailsList) {
    const container = document.getElementById('cocktailsList');
    
    container.innerHTML = cocktailsList.map(cocktail => `
        <div class="cocktail-card" onclick="showCocktailDetails(${JSON.stringify(cocktail).replace(/"/g, '&quot;')})">
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

// פונקציה לקבלת 5 קוקטיילים אקראיים
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

// פונקציה להצגת יחידות מידה בעברית
function getUnitDisplay(unit, amount) {
    if (unit === 'cube') {
        return amount === 1 ? 'קובייה' : 'קוביות';
    }
    return unit;
}

// עדכון פונקציית renderCocktails
function renderCocktails() {
    const filteredCocktails = getFilteredCocktails();
    const container = document.getElementById('cocktailsList');
    
    if (filteredCocktails.length === 0) {
        container.innerHTML = '<div class="no-cocktails">לא נמצאו קוקטיילים</div>';
        return;
    }
    
    container.innerHTML = filteredCocktails.map(cocktail => `
        <div class="cocktail-card" onclick="showCocktailDetails(event, this, ${JSON.stringify(cocktail).replace(/"/g, '&quot;')})">
            <img 
                class="cocktail-image" 
                src="${fixImageUrl(cocktail.image)}" 
                alt="${cocktail.name}"
                onerror="this.src='images/default-cocktail.jpg'"
            >
            <div class="front-title">${cocktail.name}</div>
            ${cocktail.era ? `<div class="era-badge">${cocktail.era}</div>` : ''}
            ${cocktail.year ? `<div class="year-badge">${cocktail.year}</div>` : ''}
            <div class="ingredients-preview">
                <h4>${cocktail.name}</h4>
                <div class="ingredients-preview-list">
                    ${cocktail.ingredients.map(ing => `
                        <div class="ingredient-preview-item">
                            ${ing.amount} ${getUnitDisplay(ing.unit, ing.amount)} ${ing.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// הוספת מאזיני אירועים לתמונות
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

// פונקציה לקבלת האייקון המתאים לסוג הכוס
function getGlassEmoji(glassType) {
    return glassEmojis[glassType] || '🥤';
}

// הוספת פונקציות לניהול סוגי כוסות
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

// פונקציה לטעינת קישוטים מה-localStorage
function loadGarnishes() {
    const savedGarnishes = localStorage.getItem('savedGarnishes');
    if (savedGarnishes) {
        garnishes = JSON.parse(savedGarnishes);
    }
    updateGarnishesDatalist();
}

// פונקציה לעדכון רשימת הקישוטים ב-datalist
function updateGarnishesDatalist() {
    const datalist = document.getElementById('garnishesList-options');
    if (!datalist) return;
    
    datalist.innerHTML = garnishes
        .map(garnish => `<option value="${garnish}">`)
        .join('');
}

// פונקציה לשמירת קישוט חדש
function saveNewGarnish(name) {
    if (name && !garnishes.includes(name)) {
        garnishes.push(name);
        localStorage.setItem('savedGarnishes', JSON.stringify(garnishes));
        updateGarnishesDatalist();
    }
}

// פונקציה לטעינת יחידות מידה מה-localStorage
function loadUnits() {
    const savedUnits = localStorage.getItem('savedUnits');
    if (savedUnits) {
        measurementUnits = JSON.parse(savedUnits);
    }
    updateUnitsDatalist();
}

// פונקציה לעדכון רשימת יחידות המידה ב-datalist
function updateUnitsDatalist() {
    const datalist = document.getElementById('unitsList-options');
    if (!datalist) return;
    
    datalist.innerHTML = measurementUnits
        .map(unit => `<option value="${unit}">`)
        .join('');
}

// פונקציה לשמירת יחידת מידה חדשה
function saveNewUnit(name) {
    if (name && !measurementUnits.includes(name)) {
        measurementUnits.push(name);
        localStorage.setItem('savedUnits', JSON.stringify(measurementUnits));
        updateUnitsDatalist();
    }
}

// פונקציה לטעינת סוגי כוסות מה-localStorage
function loadGlassTypes() {
    const savedGlasses = localStorage.getItem('savedGlasses');
    if (savedGlasses) {
        glassTypes = JSON.parse(savedGlasses);
    }
    updateGlassesDatalist();
}

// פונקציה לעדכון רשימת סוגי הכוסות ב-datalist
function updateGlassesDatalist() {
    const datalist = document.getElementById('glassList-options');
    if (!datalist) return;
    
    datalist.innerHTML = glassTypes
        .map(glass => `<option value="${glass}">`)
        .join('');
}

// פונקציה לשמירת סוג כוס חדש
function saveNewGlass(glass) {
    if (!glassTypes.includes(glass)) {
        glassTypes.push(glass);
        localStorage.setItem('savedGlasses', JSON.stringify(glassTypes));
        updateGlassesDatalist();
    }
}

// פונקציות לניהול מרכיבים
function renderIngredientsList() {
    const container = document.querySelector('.ingredients-container');
    container.innerHTML = ingredients
        .map(ingredient => `
            <div class="draggable-item" data-value="${ingredient}">
                <span><span class="drag-handle">☰</span> ${ingredient}</span>
                <button class="delete-ingredient" onclick="deleteIngredient('${ingredient}')">&times;</button>
            </div>
        `)
        .join('');
    
    initDraggableContainer('ingredients-container', ingredients, renderIngredientsList);
}

function deleteIngredient(ingredient) {
    if (confirm(`האם אתה בטוח שברצונך למחוק את המרכיב "${ingredient}"?`)) {
        const index = ingredients.indexOf(ingredient);
        if (index !== -1) {
            ingredients.splice(index, 1);
            localStorage.setItem('savedIngredients', JSON.stringify(ingredients));
            renderIngredientsList();
            updateIngredientsDatalist();
        }
    }
}

// פונקציות לניהול תקופות
function renderErasList() {
    const container = document.querySelector('.eras-container');
    container.innerHTML = eras
        .map(era => `
            <div class="draggable-item" data-value="${era}">
                <span><span class="drag-handle">☰</span> ${era}</span>
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

// פונקציות לניהול יחידות מידה
function renderUnitsList() {
    const container = document.querySelector('.units-container');
    container.innerHTML = measurementUnits
        .map(unit => `
            <div class="draggable-item" data-value="${unit}">
                <span><span class="drag-handle">☰</span> ${unit}</span>
                <button class="delete-unit" onclick="deleteUnit('${unit}')">&times;</button>
            </div>
        `)
        .join('');
    
    initDraggableContainer('units-container', measurementUnits, renderUnitsList);
}

function deleteUnit(unit) {
    if (confirm(`האם אתה בטוח שברצונך למחוק את יחידת המידה "${unit}"?`)) {
        const index = measurementUnits.indexOf(unit);
        if (index !== -1) {
            measurementUnits.splice(index, 1);
            localStorage.setItem('savedUnits', JSON.stringify(measurementUnits));
            renderUnitsList();
            updateUnitsDatalist();
        }
    }
}

// פונקציה לאתחול רשימות גרירה
function initDraggableLists() {
    const containers = document.querySelectorAll('.ingredients-container, .units-container, .eras-container, .glasses-container');
    containers.forEach(container => {
        new Sortable(container, {
            animation: 150,
            handle: '.drag-handle',
            onEnd: function(evt) {
                const itemsArray = Array.from(evt.to.children).map(item => item.dataset.value);
                const containerId = evt.to.className.split(' ')[0];
                
                switch(containerId) {
                    case 'ingredients-container':
                        ingredients = itemsArray;
                        localStorage.setItem('savedIngredients', JSON.stringify(ingredients));
                        break;
                    case 'units-container':
                        measurementUnits = itemsArray;
                        localStorage.setItem('savedUnits', JSON.stringify(measurementUnits));
                        break;
                    case 'eras-container':
                        eras = itemsArray;
                        localStorage.setItem('savedEras', JSON.stringify(eras));
                        break;
                    case 'glasses-container':
                        glassTypes = itemsArray;
                        localStorage.setItem('savedGlasses', JSON.stringify(glassTypes));
                        break;
                }
            }
        });
    });
} 