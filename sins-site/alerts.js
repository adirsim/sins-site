// === הגדרות המפה ===
// יוצרים את המפה ומתמקדים על מרכז הארץ בערך
const map = L.map('map').setView([31.5, 34.8], 7);

// טוענים את העיצוב (התמונות) של המפה
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
}).addTo(map);

// מערך שישמור את הסימונים האדומים כדי שנוכל למחוק אותם בסוף האזעקה
let activeAlertsOnMap = [];

// מילון זמני - מתרגם שמות ערים לקואורדינטות GPS בשביל הטסטים
const cityCoordinates = {
    "טבריה": [32.7940, 35.5331],
    "תל אביב - מרכז": [32.0735, 34.7817],
    "משגב עם": [33.2530, 35.5441],
    "שדרות": [31.5226, 34.5954],
    // נוכל להוסיף עוד מאוחר יותר או להתחבר למאגר מלא
};


// === מערכת התראות מול השרת בפתח תקווה ===
let alarmActive = false;
let checkInterval;

// פונקציה שעושה סאונד כשמופיעה אזעקה
function playAlarmSound() {
    try {
        const audio = new Audio('https://www.myinstants.com/media/sounds/red-alert.mp3'); // צליל סירנה עדין שמצאתי
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
        playAlarmSound(); // מפעיל סאונד רק פעם אחת בתחילת האזעקה
        
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

    // --- קוראים לפונקציה של המפה שתצייר את האזעקות ---
    drawAlertsOnMap(citiesArray);
}

function drawAlertsOnMap(citiesList) {
    // מוחקים אזעקות ישנות מהמפה
    activeAlertsOnMap.forEach(marker => map.removeLayer(marker));
    activeAlertsOnMap = [];

    // מציירים את החדשות
    citiesList.forEach(cityName => {
        const coords = cityCoordinates[cityName];
        if (coords) {
            const circle = L.circle(coords, {
                color: 'red',
                fillColor: '#ff003c',
                fillOpacity: 0.6,
                radius: 4000 // רדיוס קצת יותר גדול כדי שייראה ברור
            }).addTo(map);
            
            circle.bindPopup(`<b>${cityName}</b><br>סכנה מיידית, היכנסו למרחב מוגן!`);
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

        // מוחקים את העיגולים מהמפה כשהאזעקה נגמרת
        activeAlertsOnMap.forEach(marker => map.removeLayer(marker));
        activeAlertsOnMap = [];
    }
}

// פונקציית טסט למנהלים (עכשיו היא בודקת על טבריה כדי שתראה את זה במפה)
function triggerTestAlert() {
    triggerAlarm("טסט למערכת (ירי רקטות)", ["טבריה", "תל אביב - מרכז"]);
    
    setTimeout(() => {
        if (alarmActive) resetAlarm();
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
            // זה מתקן אותה ברגע שהמערכת עולה
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
