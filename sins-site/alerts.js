// === הגדרות המפה של SINS ===
const map = L.map('map').setView([31.5, 34.8], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18,
}).addTo(map);

let activeAlertsOnMap = [];

// === מאגר המידע של המפה ===
// 1. פוליגונים מדויקים שיש לנו כרגע (כמו פיקוד העורף)
const exactPolygons = {
    "טבריה": [
        [32.8021, 35.5226], [32.8058, 35.5367], [32.7972, 35.5422], 
        [32.7885, 35.5370], [32.7891, 35.5230], [32.7970, 35.5180], [32.8021, 35.5226]
    ],
    "תל אביב - מרכז": [
        [32.0910, 34.7700], [32.0950, 34.7850], [32.0800, 34.7900], 
        [32.0650, 34.7800], [32.0650, 34.7650], [32.0800, 34.7600], [32.0910, 34.7700]
    ]
};

// 2. קואורדינטות מרכז עיר - גיבוי ליישובים שעדיין אין לנו את השרטוט המדויק שלהם
const fallbackCoordinates = {
    "משגב עם": [33.2530, 35.5441],
    "שדרות": [31.5226, 34.5954],
    "חיפה - כרמל": [32.7940, 34.9896],
    "אשדוד": [31.8014, 34.6435],
    "קריית שמונה": [33.2073, 35.5694]
    // בעתיד נטען קובץ JSON עצום שיחליף את כל זה אוטומטית!
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
        // פונים לשרת שעוקף חסימות (השרת הפיזי שלך)
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

    // ציור על המפה (פוליגונים או רדיוסים)
    drawAlertsOnMap(citiesArray);
}

// הפונקציה החכמה של המפה
async function drawAlertsOnMap(citiesList) {
    // מנקים מפה מאזעקות קודמות
    activeAlertsOnMap.forEach(marker => map.removeLayer(marker));
    activeAlertsOnMap = [];

    // אפקט זום קל למרכז הארץ כשיש מטח
    map.flyTo([31.8, 34.8], 8, { animate: true, duration: 1.5 });

    citiesList.forEach(cityName => {
        // 1. קודם כל, מנסים לצייר פוליגון צבאי מדויק (אם יש לנו אותו)
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
        // 2. אם אין פוליגון מדויק, נצייר עיגול התרעה על מרכז העיר (כדי שלא נפספס אף אזעקה!)
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
        // 3. בהמשך - כאן נתחבר ל-API שיחפש לבד ערים שאנחנו לא מכירים!
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
        
        // החזרת זום למצב שקט
        map.flyTo([31.5, 34.8], 7, { animate: true, duration: 2 });
    }
}

function triggerTestAlert() {
    // טסט משולב: טבריה ות"א יקבלו פוליגון, ושדרות תקבל עיגול רדיוס
    triggerAlarm("טסט למערכת החמ\"ל", ["טבריה", "תל אביב - מרכז", "שדרות"]);
    
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
