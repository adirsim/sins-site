// === הגדרות המפה של SINS - רמה צבאית ===
const map = L.map('map').setView([31.5, 34.8], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18,
}).addTo(map);

let activeAlertsOnMap = [];

// === מאגר פוליגונים מדויקים (טעימה לפני הקובץ המלא) ===
// אלו שרטוטים מדויקים שמדמים את פיקוד העורף לערים מרכזיות לטסטים
const exactPolygons = {
    "טבריה": [
        [32.8021, 35.5226], [32.8058, 35.5367], [32.7972, 35.5422], 
        [32.7885, 35.5370], [32.7891, 35.5230], [32.7970, 35.5180], [32.8021, 35.5226]
    ],
    "תל אביב - מרכז": [
        [32.0910, 34.7700], [32.0950, 34.7850], [32.0800, 34.7900], 
        [32.0650, 34.7800], [32.0650, 34.7650], [32.0800, 34.7600], [32.0910, 34.7700]
    ],
    "חיפה - כרמל": [
        [32.8150, 34.9700], [32.8200, 35.0000], [32.7900, 35.0100], 
        [32.7800, 34.9800], [32.8150, 34.9700]
    ],
    "ירושלים - מרכז": [
        [31.7900, 35.2000], [31.7900, 35.2300], [31.7600, 35.2300], 
        [31.7600, 35.2000], [31.7900, 35.2000]
    ]
};

// גיבוי ליישובים שעוד לא העלינו את השרטוט שלהם (כדי שלא נפספס אף אזעקה)
const fallbackCoordinates = {
    "משגב עם": [33.2530, 35.5441],
    "שדרות": [31.5226, 34.5954],
    "אשדוד": [31.8014, 34.6435],
    "קריית שמונה": [33.2073, 35.5694]
};


// === מערכת התראות מול השרת בפתח תקווה ===
let alarmActive = false;
let checkInterval;

function playAlarmSound() {
    try {
        const audio = new Audio('https://www.myinstants.com/media/sounds/red-alert.mp3'); 
        audio.volume = 0.5;
        audio.play();
    } catch (e) {
        console.log("Audio play failed");
    }
}

async function checkAlerts() {
    try {
        const response = await fetch('http://185.28.154.120', { cache: 'no-store' });
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

    drawAlertsOnMap(citiesArray);
}

// הפונקציה החכמה שמציירת על המפה (פוליגון אם יש, רדיוס אם אין)
function drawAlertsOnMap(citiesList) {
    activeAlertsOnMap.forEach(marker => map.removeLayer(marker));
    activeAlertsOnMap = [];

    // זום פנימה למרכז הארץ כשיש מטח
    map.flyTo([31.8, 34.8], 8, { animate: true, duration: 1.5 });

    citiesList.forEach(cityName => {
        // מחפשים שרטוט מדויק של פיקוד העורף
        if (exactPolygons[cityName]) {
            const polygon = L.polygon(exactPolygons[cityName], {
                color: '#ff003c',
                weight: 2,
                fillColor: '#ff003c',
                fillOpacity: 0.5
            }).addTo(map);
            
            polygon.bindPopup(`<b>${cityName}</b><br>סכנה מיידית!`);
            polygon.getElement().classList.add('pulsing-polygon');
            activeAlertsOnMap.push(polygon);
        } 
        // אם אין שרטוט מדויק (עד שנעלה את הקובץ המלא), נשים עיגול חלופי חכם
        else if (fallbackCoordinates[cityName]) {
            const circle = L.circle(fallbackCoordinates[cityName], {
                color: 'red',
                fillColor: '#ff003c',
                fillOpacity: 0.6,
                radius: 4000
            }).addTo(map);
            
            circle.bindPopup(`<b>${cityName}</b><br>התרעה במרחב!`);
            activeAlertsOnMap.push(circle);
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

        activeAlertsOnMap.forEach(marker => map.removeLayer(marker));
        activeAlertsOnMap = [];
        
        map.flyTo([31.5, 34.8], 7, { animate: true, duration: 2 });
    }
}

// טסט למנהלים שמראה גם פוליגונים מדויקים וגם עיגולים
function triggerTestAlert() {
    triggerAlarm("טסט למערכת החמ\"ל", ["טבריה", "תל אביב - מרכז", "שדרות"]);
    
    // בטסט מתמקדים קצת יותר צפונה כדי לראות את טבריה ות"א
    setTimeout(() => { map.setView([32.4, 35.1], 9); }, 1500);
    
    setTimeout(() => {
        if (alarmActive) resetAlarm();
    }, 15000);
}

checkInterval = setInterval(checkAlerts, 1000);

// === פונקציות מעברים ===
function bootSystem() {
    document.getElementById('welcome-screen').style.opacity = '0';
    document.getElementById('welcome-screen').style.pointerEvents = 'none';
    
    setTimeout(() => {
        document.getElementById('black-screen').classList.add('active');
        setTimeout(() => {
            document.getElementById('black-screen').classList.remove('active');
            document.getElementById('core-system').classList.add('online');
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

    if (tabId === 'alerts') {
        setTimeout(() => { map.invalidateSize(); }, 100);
    }
}
