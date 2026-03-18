// === הגדרות המפה של SINS ===
// מאתחלים את המפה ומתמקדים על מרכז הארץ בערך
const map = L.map('map').setView([31.5, 34.8], 7);

// טוענים את העיצוב (התמונות) של המפה
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
}).addTo(map);

// מערך שישמור את הצורות (הפוליגונים) האדומים כדי למחוק אותם בסוף האזעקה
let activeAlertsOnMap = [];

// === מילון פוליגונים מדויק של SINS (הטריק המגנטי) ===
// הגדרנו כאן את הקואורדינטות המדויקות של הגבולות עבור יישובי הטסט.
// זה נראה "צבאי" כמו פיקוד העורף!
const cityPolygons = {
    "טבריה": [
        [32.8021, 35.5226],
        [32.8058, 35.5367],
        [32.7972, 35.5422],
        [32.7885, 35.5370],
        [32.7891, 35.5230],
        [32.7970, 35.5180],
        [32.8021, 35.5226] // סגירת הצורה
    ],
    "תל אביב - מרכז": [
        [32.0910, 34.7700],
        [32.0950, 34.7850],
        [32.0800, 34.7900],
        [32.0650, 34.7800],
        [32.0650, 34.7650],
        [32.0800, 34.7600],
        [32.0910, 34.7700] // סגירת הצורה
    ]
    // ליישובים אחרים נוסיף בעתיד או שנמצא מאגרGeoJSON מלא
};


// === מערכת התראות מול השרת בפתח תקווה ===
let alarmActive = false;
let checkInterval;

// פונקציה שעושה סאונד כשמופיעה אזעקה
function playAlarmSound() {
    try {
        const audio = new Audio('https://www.myinstants.com/media/sounds/red-alert.mp3'); 
        audio.volume = 0.5;
        audio.play();
    } catch (e) {
        console.log("Audio play failed (maybe blocked by browser)");
    }
}

async function checkAlerts() {
    try {
        // פנייה לשרת הישראלי החדש שלנו שעוקף את החסימה
        const response = await fetch('http://185.28.154.120', {
            cache: 'no-store'
        });
        
        const data = await response.text();
        
        if (data.trim() !== "") {
            try {
                const jsonData = JSON.parse(data);
                if (jsonData.data && jsonData.data.length > 0) {
                    triggerAlarm(jsonData.title, jsonData.data);
                } else {
                    resetAlarm();
                }
            } catch (e) {
                console.log("Error parsing JSON:", e);
                resetAlarm();
            }
        } else {
            resetAlarm();
        }
        
    } catch (error) {
        console.error("Connection error:", error);
    }
}

function triggerAlarm(title, citiesArray) {
    if (!alarmActive) {
        alarmActive = true;
        playAlarmSound(); 
        
        document.getElementById('main-radar-box').style.background = 'rgba(255,0,60,0.1)';
        document.getElementById('main-radar-box').style.borderColor = '#ff003c';
        
        document.getElementById('radar-ui').style.borderColor = 'rgba(255,0,60,0.5)';
        document.getElementById('radar-icon').style.color = '#ff003c';
        document.getElementById('status-dot-ui').style.background = '#ff003c';
        document.getElementById('status-dot-ui').style.boxShadow = '0 0 15px #ff003c';
        
        document.getElementById('status-text').innerHTML = '<span class="status-dot" id="status-dot-ui" style="background: #ff003c; box-shadow: 0 0 15px #ff003c;"></span> זוהתה סכנה מוחשית!';
        
        document.getElementById('active-alarm').style.display = 'block';
    }
    
    document.getElementById('alarm-title').innerHTML = `<i class="fas fa-rocket"></i> ${title || 'ירי רקטות וטילים'}`;
    document.getElementById('alarm-cities').innerText = citiesArray.join(', ');

    // === קוראים לפונקציה של המפה שתצייר את הפוליגונים ה"צבאיים" ===
    drawAlertsOnMap(citiesArray);
}

function drawAlertsOnMap(citiesList) {
    // מוחקים אזעקות ישנות מהמפה
    activeAlertsOnMap.forEach(marker => map.removeLayer(marker));
    activeAlertsOnMap = [];

    // מציירים את הצורות החדשות (הפוליגונים)
    citiesList.forEach(cityName => {
        // מחפשים במילון הפוליגונים שלנו
        const polyCoords = cityPolygons[cityName];
        
        if (polyCoords) {
            // אם מצאנו את גבולות העיר - מציירים פוליגון כמו פיקוד העורף
            const polygon = L.polygon(polyCoords, {
                color: '#ff003c',       // מסגרת אדומה בהירה (סגנון פיקוד העורף)
                weight: 2,               // עובי המסגרת
                fillColor: '#ff003c',   // מילוי אדום
                fillOpacity: 0.5        // שקיפות מילוי
            }).addTo(map);
            
            polygon.bindPopup(`<b>${cityName}</b><br>סכנה מיידית, היכנסו למרחב מוגן!`);
            
            // הוספת האפקט ה"מגנטי" - הפוליגון יהבהב (נצטרך להוסיף CSS ל-html)
            polygon.getElement().classList.add('pulsing-polygon');
            
            activeAlertsOnMap.push(polygon);
        }
    });
}

function resetAlarm() {
    if (alarmActive) {
        alarmActive = false;
        
        document.getElementById('main-radar-box').style.background = 'rgba(0,0,0,0.3)';
        document.getElementById('main-radar-box').style.borderColor = 'rgba(255, 255, 255, 0.06)';
        
        document.getElementById('radar-ui').style.borderColor = 'rgba(20, 184, 166, 0.3)';
        document.getElementById('radar-icon').style.color = '#14b8a6';
        
        document.getElementById('status-text').innerHTML = '<span class="status-dot" id="status-dot-ui"></span> סורק התראות אמת (פיקוד העורף)';
        
        document.getElementById('active-alarm').style.display = 'none';

        // מוחקים את הצורות מהמפה כשהאזעקה נגמרת
        activeAlertsOnMap.forEach(marker => map.removeLayer(marker));
        activeAlertsOnMap = [];
    }
}

// פונקציית טסט למנהלים (עכשיו היא בודקת על טבריה כדי שתראה את הפוליגון)
function triggerTestAlert() {
    triggerAlarm("טסט למערכת (ירי רקטות)", ["טבריה", "תל אביב - מרכז"]);
    
    // בטסט, מתמקדים על טבריה כדי לראות את הצורה יפה
    map.setView([32.7940, 35.5331], 12);
    
    setTimeout(() => {
        if (alarmActive) {
            resetAlarm();
            // מחזירים את המפה למרכז אחרי הטסט
            map.setView([31.5, 34.8], 7);
        }
    }, 15000);
}

// הפעלה אוטומטית כשהאתר עולה
checkInterval = setInterval(checkAlerts, 1000); // בודק כל שנייה

// === פונקציות עיצוב ומעברים (אל תיגע) ===
function bootSystem() {
    document.getElementById('welcome-screen').style.opacity = '0';
    document.getElementById('welcome-screen').style.pointerEvents = 'none';
    
    setTimeout(() => {
        document.getElementById('black-screen').classList.add('active');
        
        setTimeout(() => {
            document.getElementById('black-screen').classList.remove('active');
            document.getElementById('core-system').classList.add('online');
            
            // טריק חשוב ל-Leaflet: כשהמפה מוסתרת בטאב אחר היא מאבדת פרופורציות
            setTimeout(() => { map.invalidateSize(); }, 500);

        }, 2000);
    }, 500);
}

function navSwitch(tabId, el) {
    document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active', 'active-alert'));
    if (tabId === 'alerts') { el.classList.add('active-alert'); } else { el.classList.add('active'); }
    
    document.querySelectorAll('.tab-layer').forEach(tab => {
        if (tab.classList.contains('show')) {
            tab.classList.add('win11-out');
            setTimeout(() => {
                tab.classList.remove('show', 'win11-out');
                showNewTab(tabId);
            }, 100);
        }
    });
}

function showNewTab(tabId) {
    const newTab = document.getElementById(tabId);
    newTab.classList.add('show', 'win11-in');
    setTimeout(() => newTab.classList.remove('win11-in'), 350);

    // מתקן את גודל המפה אם עוברים לטאב ההתראות
    if (tabId === 'alerts') {
        setTimeout(() => { map.invalidateSize(); }, 100);
    }
}
