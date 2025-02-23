// מבנה הנתונים של קוקטייל
const cocktailStructure = {
    name: '',           // שם הקוקטייל
    image: '',         // תמונה
    ingredients: [],    // מערך של מרכיבים {name, amount, unit}
    instructions: '',   // הוראות הכנה
    glass: '',         // סוג כוס
    garnish: '',       // קישוט
    base: '',          // בסיס אלכוהולי
    year: '',          // שנת המצאה
    era: '',           // תקופה
    season: '',         // עונה
    background: ''      // היסטוריה
};

// מערכים גלובליים
let cocktails = [];     // מערך הקוקטיילים
let ingredients = [];   // מערך המרכיבים
let glassTypes = [];    // סוגי כוסות
let bases = [];        // סוגי בסיסים
let eras = [];         // תקופות
let seasons = ['קיץ', 'חורף', 'סתיו', 'אביב', 'כל השנה'];
let units = [];         // יחידות מידה
let garnishes = [];     // קישוטים

// קבועים
const API_URL = 'http://localhost:3001/api';

// פונקציה לבדיקת חיבור לשרת
async function checkConnection() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error('Connection check failed:', error);
        return false;
    }
}

// פונקציה לטעינת קוקטיילים מהשרת
async function loadCocktails() {
    try {
        const response = await fetch(`${API_URL}/cocktails`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        cocktails = data;
        renderCocktails();
    } catch (error) {
        console.error('Error loading cocktails:', error);
        document.getElementById('cocktailsList').innerHTML = 
            '<div class="error-message">שגיאה בטעינת הנתונים. אנא רענן את הדף.</div>';
    }
}

// פונקציה להצגת הקוקטיילים - נשתמש באותה פונקציה בכל מקום
function renderCocktails(cocktailsToRender = cocktails) {
    const container = document.getElementById('cocktailsList');
    container.innerHTML = cocktailsToRender.map(cocktail => `
        <div class="cocktail-card" onclick="showCocktailDetails(${JSON.stringify(cocktail).replace(/"/g, '&quot;')})">
            <img class="cocktail-image" src="${cocktail.image}" alt="${cocktail.name}">
            
            <!-- מידע בסיסי שתמיד מוצג -->
            <div class="cocktail-info-basic">
                <h3 class="cocktail-name">${cocktail.name}</h3>
                <div class="cocktail-year-era">
                    ${cocktail.year ? cocktail.year + ' • ' : ''}${cocktail.era || ''}
                </div>
            </div>

            <!-- מידע שמופיע בהובר -->
            <div class="cocktail-hover-info">
                <h3>מרכיבים</h3>
                <ul>
                    ${cocktail.ingredients.map(ing => 
                        `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`
                    ).join('')}
                </ul>
            </div>

            ${cocktail.base ? `<div class="cocktail-base">${cocktail.base}</div>` : ''}
            ${cocktail.season ? `<div class="cocktail-season">${cocktail.season}</div>` : ''}
        </div>
    `).join('');
}

// פונקציה להצגת פרטי קוקטייל
function showCocktailDetails(cocktail) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="cocktail-image-container" onclick="this.closest('.modal').remove()">
                <img src="${cocktail.image}" alt="${cocktail.name}" title="לחץ לסגירה">
            </div>
            <h2>${cocktail.name}</h2>
            
            <div class="cocktail-meta">
                <span class="era">${cocktail.era || 'תקופה לא ידועה'}</span>
                <span class="year">${cocktail.year ? '• ' + cocktail.year : ''}</span>
            </div>

            <div class="cocktail-background">
                <h3>היסטוריה:</h3>
                <p>${cocktail.background || 'היסטוריה של המשקה תופיע כאן'}</p>
            </div>

            <div class="cocktail-info">
                <p><strong>בסיס:</strong> ${cocktail.base}</p>
                <p><strong>כוס:</strong> ${cocktail.glass}</p>
                <p><strong>קישוט:</strong> ${cocktail.garnish || 'ללא'}</p>
                <p><strong>עונה:</strong> ${cocktail.season}</p>
            </div>
            <div class="ingredients-list">
                <h3>מרכיבים:</h3>
                <ul>
                    ${cocktail.ingredients.map(ing => 
                        `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`
                    ).join('')}
                </ul>
            </div>
            <div class="instructions">
                <h3>הוראות הכנה:</h3>
                <p>${cocktail.instructions}</p>
            </div>
            <div class="actions">
                <button onclick="editCocktail(${JSON.stringify(cocktail).replace(/"/g, '&quot;')})">ערוך</button>
                <button onclick="deleteCocktail('${cocktail.name}')">מחק</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close').onclick = () => modal.remove();
}

// טעינת האופציות מהשרת
async function loadOptions() {
    try {
        const response = await fetch(`${API_URL}/options`);
        const options = await response.json();
        bases = options.bases;
        glassTypes = options.glassTypes;
        seasons = options.seasons;
        eras = options.eras;
        units = options.units;
        garnishes = options.garnishes;
    } catch (error) {
        console.error('Error loading options:', error);
    }
}

// נעדכן את הטעינה הראשונית
document.addEventListener('DOMContentLoaded', async () => {
    await loadOptions();  // קודם טוען את האופציות
    await loadCocktails(); // ואז את הקוקטיילים
    setupManagementButtons();  // הוספת כפתורי ניהול
    setupFilters();  // הוספת פילטרים
});

// פונקציה לפתיחת טופס הוספת/עריכת קוקטייל
function openCocktailForm(cocktail = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${cocktail ? 'עריכת קוקטייל' : 'הוספת קוקטייל חדש'}</h2>
            <form id="cocktailForm">
                <div class="form-group">
                    <label>שם הקוקטייל:</label>
                    <input type="text" name="name" value="${cocktail?.name || ''}" required>
                </div>
                
                <div class="form-group">
                    <label>תמונה:</label>
                    <div class="image-upload">
                        <input type="file" id="imageFile" accept="image/*">
                        <span>או</span>
                        <input type="text" name="image" id="imageUrl" value="${cocktail?.image || ''}" placeholder="הכנס URL של תמונה">
                        <div class="image-preview" ${cocktail?.image ? `style="background-image: url('${cocktail.image}')"` : ''}></div>
                    </div>
                </div>
                
                <div class="ingredients-container">
                    <h3>מרכיבים:</h3>
                    <div id="ingredientsList">
                        ${cocktail ? 
                            (cocktail.ingredients || []).map((ing, index) => `
                                <div class="ingredient-row">
                                    <input type="text" name="ingredient-name[]" value="${ing.name}" placeholder="שם המרכיב">
                                    <input type="text" name="ingredient-amount[]" value="${ing.amount}" placeholder="כמות">
                                    <input type="text" name="ingredient-unit[]" value="${ing.unit}" placeholder="יחידה">
                                    <button type="button" onclick="this.parentElement.remove()">×</button>
                                </div>
                            `).join('')
                            : 
                            Array(3).fill('').map(() => `
                                <div class="ingredient-row">
                                    <input type="text" name="ingredient-name[]" placeholder="שם המרכיב">
                                    <input type="text" name="ingredient-amount[]" placeholder="כמות">
                                    <input type="text" name="ingredient-unit[]" value="מ״ל" placeholder="יחידה">
                                    <button type="button" onclick="this.parentElement.remove()">×</button>
                                </div>
                            `).join('')
                        }
                    </div>
                    <button type="button" onclick="addIngredientRow()">+ הוסף מרכיב</button>
                </div>
                
                <div class="form-group">
                    <label>תקופה:</label>
                    <input type="text" name="era" list="eraList" value="${cocktail?.era || ''}" required>
                    <datalist id="eraList">
                        ${eras.map(era => `<option value="${era}">`).join('')}
                    </datalist>
                </div>

                <div class="form-group">
                    <label>שנת המצאה:</label>
                    <input type="text" name="year" value="${cocktail?.year || ''}" placeholder="למשל: 1920">
                </div>

                <div class="form-group">
                    <label>בסיס:</label>
                    <input type="text" name="base" list="basesList" value="${cocktail?.base || ''}" required>
                    <datalist id="basesList">
                        ${bases.map(base => `<option value="${base}">`).join('')}
                    </datalist>
                </div>
                
                <div class="form-group">
                    <label>כוס:</label>
                    <input type="text" name="glass" list="glassesList" value="${cocktail?.glass || ''}">
                    <datalist id="glassesList">
                        ${glassTypes.map(glass => `<option value="${glass}">`).join('')}
                    </datalist>
                </div>

                <div class="form-group">
                    <label>קישוט:</label>
                    <input type="text" name="garnish" list="garnishesList" value="${cocktail?.garnish || ''}">
                    <datalist id="garnishesList">
                        ${garnishes.map(garnish => `<option value="${garnish}">`).join('')}
                    </datalist>
                </div>
                
                <div class="form-group">
                    <label>עונה:</label>
                    <select name="season">
                        <option value="">בחר עונה</option>
                        ${seasons.map(season => 
                            `<option value="${season}" ${cocktail?.season === season ? 'selected' : ''}>${season}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>היסטוריה:</label>
                    <div class="history-input-group">
                        <textarea name="background" placeholder="ספר את הסיפור מאחורי המשקה...">${cocktail?.background || ''}</textarea>
                        <button type="button" class="ai-history-btn" onclick="generateHistory(this)">
                            <span class="tooltip">צור היסטוריה עם AI</span>
                            🤖
                        </button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>הוראות הכנה:</label>
                    <textarea name="instructions" required>${cocktail?.instructions || ''}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit">${cocktail ? 'שמור שינויים' : 'הוסף קוקטייל'}</button>
                    <button type="button" onclick="this.closest('.modal').remove()">ביטול</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupImageUpload();
    
    modal.querySelector('.close').onclick = () => modal.remove();
    modal.querySelector('form').onsubmit = (e) => handleFormSubmit(e, cocktail?._id);
}

// פונקציה להוספת שורת מרכיב חדשה
function addIngredientRow() {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
        <input type="text" name="ingredient-name[]" placeholder="שם המרכיב">
        <input type="text" name="ingredient-amount[]" placeholder="כמות">
        <input type="text" name="ingredient-unit[]" value="מ״ל" placeholder="יחידה">
        <button type="button" onclick="this.parentElement.remove()">×</button>
    `;
    document.getElementById('ingredientsList').appendChild(row);
}

// פונקציה לטיפול בשמירת הטופס
async function handleFormSubmit(e, cocktailId = null) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // בדיקה והוספה של תקופה חדשה
    const newEra = formData.get('era');
    if (newEra && !eras.includes(newEra)) {
        eras.push(newEra);
        // שמירה בשרת
        fetch(`${API_URL}/eras`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newEra })
        }).catch(error => console.error('Error saving new era:', error));
    }
    
    // בדיקה והוספה של בסיס חדש
    const newBase = formData.get('base');
    if (newBase && !bases.includes(newBase)) {
        bases.push(newBase);
        // שמירה בשרת
        fetch(`${API_URL}/bases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newBase })
        }).catch(error => console.error('Error saving new base:', error));
    }
    
    // בדיקה והוספה של כוס חדשה
    const newGlass = formData.get('glass');
    if (newGlass && !glassTypes.includes(newGlass)) {
        glassTypes.push(newGlass);
        // שמירה בשרת
        fetch(`${API_URL}/glasses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newGlass })
        }).catch(error => console.error('Error saving new glass:', error));
    }
    
    // איסוף מרכיבים והוספה לרשימת האופציות
    const ingredients = [];
    const names = formData.getAll('ingredient-name[]');
    const amounts = formData.getAll('ingredient-amount[]');
    const units = formData.getAll('ingredient-unit[]');
    
    for (let i = 0; i < names.length; i++) {
        if (names[i]) {
            // הוספת מרכיב חדש לרשימת האופציות
            if (!ingredients.includes(names[i])) {
                fetch(`${API_URL}/ingredients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: names[i] })
                })
                .then(() => {
                    if (!ingredients.includes(names[i])) {
                        ingredients.push(names[i]);
                    }
                })
                .catch(error => console.error('Error saving ingredient:', error));
            }

            ingredients.push({
                name: names[i],
                amount: amounts[i],
                unit: units[i] || 'מ״ל'
            });
        }
    }

    // יצירת אובייקט הקוקטייל
    const cocktail = {
        name: formData.get('name'),
        image: formData.get('image'),
        base: newBase || formData.get('base'),
        glass: newGlass || formData.get('glass'),
        garnish: formData.get('garnish'),
        season: formData.get('season'),
        instructions: formData.get('instructions'),
        background: formData.get('background'),
        era: newEra || formData.get('era'),
        year: formData.get('year'),
        ingredients
    };

    try {
        console.log('Sending cocktail:', cocktail);

        const response = await fetch(`${API_URL}/cocktails${cocktailId ? `/${cocktailId}` : ''}`, {
            method: cocktailId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cocktail)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            
            // הצגת הודעת שגיאה ידידותית למשתמש
            let errorMessage = 'שגיאה בשמירת הקוקטייל: ';
            if (errorData.error.includes('validation failed')) {
                errorMessage += 'אחד או יותר מהערכים שהוזנו אינם תקינים. אנא בדוק את הערכים ונסה שוב.';
            } else {
                errorMessage += errorData.error;
            }
            
            alert(errorMessage);
            return;
        }
        
        await loadCocktails();
        await loadOptions(); // רענון האופציות גם כן
        
        e.target.closest('.modal').remove();
        
    } catch (error) {
        console.error('Error saving cocktail:', error);
        alert('שגיאה בשמירת הקוקטייל: ' + error.message);
    }
}

// פונקציה למחיקת קוקטייל
function deleteCocktail(cocktailName) {
    if (confirm(`האם אתה בטוח שברצונך למחוק את הקוקטייל "${cocktailName}"?`)) {
        cocktails = cocktails.filter(c => c.name !== cocktailName);
        localStorage.setItem('cocktails', JSON.stringify(cocktails));
        renderCocktails();
    }
}

// פונקציה לעריכת קוקטייל
function editCocktail(cocktail) {
    openCocktailForm(cocktail);
}

// מאזין לכפתור הוספת קוקטייל
document.getElementById('addCocktailBtn').addEventListener('click', () => openCocktailForm());

// פונקציה חדשה להגדרת העלאת תמונות
function setupImageUpload() {
    const imageFile = document.getElementById('imageFile');
    const imageUrl = document.getElementById('imageUrl');
    const preview = document.querySelector('.image-preview');

    imageFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64Image = e.target.result;
                    preview.style.backgroundImage = `url('${base64Image}')`;
                    imageUrl.value = base64Image;
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Error loading image:', error);
                alert('שגיאה בטעינת התמונה');
            }
        }
    });

    imageUrl.addEventListener('input', () => {
        const url = imageUrl.value;
        if (url) {
            preview.style.backgroundImage = `url('${url}')`;
        } else {
            preview.style.backgroundImage = 'none';
        }
    });
}

// הוספת פונקציות סינון ומיון
function setupFilters() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filters';
    filterContainer.innerHTML = `
        <div class="filter-dropdown">
            <button class="filter-btn">
                סינון
                <span>▼</span>
            </button>
            <div class="filter-content">
                <div class="filter-section">
                    <label>בסיס:</label>
                    <select id="filterBase" onchange="filterAndSortCocktails()">
                        <option value="">הכל</option>
                        ${bases.map(base => `<option value="${base}">${base}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-section">
                    <label>עונה:</label>
                    <select id="filterSeason" onchange="filterAndSortCocktails()">
                        <option value="">הכל</option>
                        ${seasons.map(season => `<option value="${season}">${season}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-section">
                    <label>כוס:</label>
                    <select id="filterGlass" onchange="filterAndSortCocktails()">
                        <option value="">הכל</option>
                        ${glassTypes.map(glass => `<option value="${glass}">${glass}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>
    `;
    
    document.querySelector('.toolbar').appendChild(filterContainer);
}

// פונקציה לסינון
function filterAndSortCocktails() {
    let filtered = [...cocktails];
    
    // סינון
    const base = document.getElementById('filterBase').value;
    const season = document.getElementById('filterSeason').value;
    const glass = document.getElementById('filterGlass').value;
    
    if (base) filtered = filtered.filter(c => c.base === base);
    if (season) filtered = filtered.filter(c => c.season === season);
    if (glass) filtered = filtered.filter(c => c.glass === glass);
    
    renderCocktails(filtered);
}

// פונקציות מיוחדות
function showRandomCocktails() {
    const randomCocktails = [...cocktails]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
    
    renderCocktails(randomCocktails);
}

function showCocktailsByEra() {
    const cocktailsByEra = {};
    cocktails.forEach(cocktail => {
        if (!cocktailsByEra[cocktail.era]) {
            cocktailsByEra[cocktail.era] = [];
        }
        cocktailsByEra[cocktail.era].push(cocktail);
    });
    
    const selectedCocktails = Object.values(cocktailsByEra)
        .map(eraGroup => eraGroup[Math.floor(Math.random() * eraGroup.length)])
        .slice(0, 5);
    
    renderCocktails(selectedCocktails);
}

// פונקציה להוספת כפתורי ניהול
function setupManagementButtons() {
    const container = document.createElement('div');
    container.className = 'toolbar-buttons';
    container.innerHTML = `
        <button class="btn" onclick="showRandomCocktails()">5 אקראיים</button>
        <button class="btn" onclick="showCocktailsByEra()">לפי תקופה</button>
        
        <div class="management-dropdown">
            <button class="management-btn">
                ניהול
                <span>▼</span>
            </button>
            <div class="management-content">
                <button onclick="openManagementModal('ingredients')">ניהול מרכיבים</button>
                <button onclick="openManagementModal('bases')">ניהול בסיסים</button>
                <button onclick="openManagementModal('glasses')">ניהול כוסות</button>
                <button onclick="openManagementModal('eras')">ניהול תקופות</button>
            </div>
        </div>
    `;
    
    const toolbar = document.querySelector('.toolbar');
    toolbar.insertBefore(container, toolbar.firstChild);
}

// פונקציה לפתיחת חלונית ניהול
function openManagementModal(type) {
    const titles = {
        ingredients: 'ניהול מרכיבים',
        bases: 'ניהול בסיסים',
        glasses: 'ניהול כוסות',
        eras: 'ניהול תקופות'
    };
    
    const arrays = {
        ingredients: ingredients,
        bases: bases,
        glasses: glassTypes,
        eras: eras
    };
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content management-modal">
            <span class="close">&times;</span>
            <h2>${titles[type]}</h2>
            
            <div class="add-item">
                <input type="text" id="newItem" placeholder="הוסף ${titles[type].slice(6)}..." autofocus>
                <button onclick="addNewItem('${type}')">הוסף</button>
            </div>
            
            <div class="items-list" id="${type}List">
                ${arrays[type].map(item => `
                    <div class="item">
                        <input type="text" value="${item}" 
                               onchange="updateItem('${type}', '${item}', this.value)"
                               class="editable-item">
                        <button onclick="deleteItem('${type}', '${item}')">מחק</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // מאזינים
    modal.querySelector('.close').onclick = () => modal.remove();
    const input = modal.querySelector('#newItem');
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNewItem(type);
        }
    });
}

// פונקציה חדשה לעדכון פריט
async function updateItem(type, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    const arrays = {
        ingredients: ingredients,
        bases: bases,
        glasses: glassTypes,
        eras: eras
    };
    
    try {
        // שמירה בשרת
        const response = await fetch(`${API_URL}/${type}/${encodeURIComponent(oldValue)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value: newValue })
        });

        if (!response.ok) throw new Error('Failed to update item');
        
        // עדכון המערך המקומי
        const index = arrays[type].indexOf(oldValue);
        if (index !== -1) {
            arrays[type][index] = newValue;
        }
        
        // שמירה בלוקל סטורג'
        localStorage.setItem(`saved${type.charAt(0).toUpperCase() + type.slice(1)}`, JSON.stringify(arrays[type]));
        
    } catch (error) {
        console.error('Error updating item:', error);
        alert('שגיאה בעדכון הפריט');
        // החזרת הערך הקודם
        const input = document.querySelector(`input[value="${oldValue}"]`);
        if (input) input.value = oldValue;
    }
}

// פונקציות לניהול פריטים
function addNewItem(type) {
    const input = document.getElementById('newItem');
    const value = input.value.trim();
    
    if (!value) return;
    
    const arrays = {
        ingredients: ingredients,
        bases: bases,
        glasses: glassTypes,
        eras: eras
    };
    
    if (!arrays[type].includes(value)) {
        arrays[type].push(value);
        
        // שמירה בשרת
        fetch(`${API_URL}/${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value })
        })
        .then(response => response.json())
        .then(() => {
            const list = document.getElementById(`${type}List`);
            const div = document.createElement('div');
            div.className = 'item';
            div.innerHTML = `
                <span>${value}</span>
                <button onclick="deleteItem('${type}', '${value}')">הסר</button>
            `;
            list.appendChild(div);
            input.value = '';
        })
        .catch(error => console.error('Error saving item:', error));
    }
}

function deleteItem(type, item) {
    if (!confirm(`האם למחוק את "${item}"?`)) return;
    
    const arrays = {
        ingredients: ingredients,
        bases: bases,
        glasses: glassTypes,
        eras: eras
    };
    
    arrays[type] = arrays[type].filter(i => i !== item);
    
    // שמירה בלוקל סטורג'
    localStorage.setItem(`saved${type.charAt(0).toUpperCase() + type.slice(1)}`, JSON.stringify(arrays[type]));
    
    // עדכון התצוגה
    document.getElementById(`${type}List`).innerHTML = arrays[type].map(i => `
        <div class="item">
            <span>${i}</span>
            <button onclick="deleteItem('${type}', '${i}')">מחק</button>
        </div>
    `).join('');
}

// פונקציה חדשה ליצירת היסטוריה עם AI
async function generateHistory(button) {
    const form = button.closest('form');
    const cocktailName = form.querySelector('input[name="name"]').value;
    const base = form.querySelector('input[name="base"]').value;
    
    if (!cocktailName) {
        alert('נא להזין שם קוקטייל לפני יצירת היסטוריה');
        return;
    }

    button.disabled = true;
    button.textContent = '...';

    try {
        const response = await fetch(`${API_URL}/generate-history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: cocktailName,
                base: base
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            throw new Error(errorData.error || 'Network response was not ok');
        }
        
        const data = await response.json();
        const textarea = form.querySelector('textarea[name="background"]');
        textarea.value = data.history;
        
    } catch (error) {
        console.error('Error generating history:', error);
        alert('שגיאה ביצירת ההיסטוריה. נסה שוב מאוחר יותר.');
    } finally {
        button.disabled = false;
        button.textContent = '🤖';
    }
}