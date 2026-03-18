let alarmActive = false;
let checkInterval;

async function checkAlerts() {
    try {
        // פנייה למנהרה שלנו שעוקפת את החסימות
        const response = await fetch('/api/tzofar', {
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
    // בודקים אם זו הודעת חזל"ש (סיום אירוע)
    const isAllClear = title && (title.includes("הסתיים") || title.includes("סיום"));

    if (!alarmActive && !isAllClear) {
        // מפעיל סאונד סירנה רק אם זו אזעקה חדשה (ולא הודעת סיום)
        try {
            const audio = new Audio('https://www.myinstants.com/media/sounds/red-alert.mp3'); 
            audio.volume = 0.5;
            audio.play();
        } catch (e) {}
    }
    
    alarmActive = true;
    
    // שליפה של האלמנטים שצריך לשנות
    const radarBox = document.getElementById('main-radar-box');
    const radarUi = document.getElementById('radar-ui');
    const radarIcon = document.getElementById('radar-icon');
    const statusDot = document.getElementById('status-dot-ui');
    const statusText = document.getElementById('status-text');
    const activeAlarmBox = document.getElementById('active-alarm');
    const alarmTitle = document.getElementById('alarm-title');
    const alarmCities = document.getElementById('alarm-cities');
    const instructionText = alarmCities.nextElementSibling;

    activeAlarmBox.style.display = 'block';

    if (isAllClear) {
        // === נוהל חזל"ש (הכל ירוק ורגוע) ===
        radarBox.style.background = 'rgba(20, 184, 166, 0.1)';
        radarBox.style.borderColor = '#14b8a6';
        radarUi.style.borderColor = 'rgba(20, 184, 166, 0.5)';
        radarIcon.className = 'fas fa-check-circle';
        radarIcon.style.color = '#14b8a6';
        
        statusDot.style.background = '#14b8a6';
        statusDot.style.boxShadow = '0 0 15px #14b8a6';
        statusText.innerHTML = '<span class="status-dot" id="status-dot-ui" style="background: #14b8a6; box-shadow: 0 0 15px #14b8a6;"></span> חזל"ש - האירוע הסתיים';
        
        activeAlarmBox.style.background = 'rgba(20, 184, 166, 0.15)';
        activeAlarmBox.style.borderColor = '#14b8a6';
        activeAlarmBox.style.animation = 'none'; // מבטל את ההבהוב המלחיץ
        activeAlarmBox.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.3)';
        
        alarmTitle.innerHTML = `<i class="fas fa-info-circle"></i> ${title}`;
        alarmTitle.style.color = '#14b8a6';
        instructionText.innerText = "ניתן לצאת מהמרחב המוגן (אלא אם ניתנה הנחיה אחרת).";
        instructionText.style.color = '#14b8a6';
        
    } else {
        // === נוהל אזעקה רגיל (אדום ומלחיץ) ===
        radarBox.style.background = 'rgba(255,0,60,0.1)';
        radarBox.style.borderColor = '#ff003c';
        radarUi.style.borderColor = 'rgba(255,0,60,0.5)';
        radarIcon.className = 'fas fa-shield-alt';
        radarIcon.style.color = '#ff003c';
        
        statusDot.style.background = '#ff003c';
        statusDot.style.boxShadow = '0 0 15px #ff003c';
        statusText.innerHTML = '<span class="status-dot" id="status-dot-ui" style="background: #ff003c; box-shadow: 0 0 15px #ff003c;"></span> זוהתה סכנה מוחשית!';
        
        activeAlarmBox.style.background = 'rgba(255, 0, 60, 0.15)';
        activeAlarmBox.style.borderColor = '#ff003c';
        activeAlarmBox.style.animation = 'flashRed 1s infinite alternate';
        
        alarmTitle.innerHTML = `<i class="fas fa-rocket"></i> ${title || 'ירי רקטות וטילים'}`;
        alarmTitle.style.color = '#ff003c';
        instructionText.innerText = "היכנסו מיד למרחב מוגן ושהו בו 10 דקות.";
        instructionText.style.color = '#fff';
    }
    
    alarmCities.innerText = citiesArray.join(', ');
}

function resetAlarm() {
    if (alarmActive) {
        alarmActive = false;
        
        // מחזיר את המערכת למצב סריקה ניטרלי
        document.getElementById('main-radar-box').style.background = 'rgba(0,0,0,0.3)';
        document.getElementById('main-radar-box').style.borderColor = 'rgba(255, 255, 255, 0.06)';
        
        document.getElementById('radar-ui').style.borderColor = 'rgba(20, 184, 166, 0.3)';
        document.getElementById('radar-icon').className = 'fas fa-shield-alt';
        document.getElementById('radar-icon').style.color = '#14b8a6';
        
        document.getElementById('status-text').innerHTML = '<span class="status-dot" id="status-dot-ui"></span> סורק התראות אמת (פיקוד העורף)';
        
        document.getElementById('active-alarm').style.display = 'none';
        document.getElementById('active-alarm').style.animation = 'flashRed 1s infinite alternate';
    }
}

// טסט מתקדם: מדמה מחזור שלם של אזעקה וחזל"ש
function triggerTestAlert() {
    // 1. מדליק אזעקה אדומה
    triggerAlarm("טסט למנהלים (ירי רקטות)", ["טבריה", "רמת גולן", "תל אביב - מרכז"]);
    
    // 2. אחרי 5 שניות, מחליף להודעת סיום ירוקה
    setTimeout(() => {
        triggerAlarm("עדכון מפיקוד העורף - האירוע הסתיים", ["טבריה", "רמת גולן", "תל אביב - מרכז"]);
    }, 5000);
    
    // 3. אחרי עוד 5 שניות, מאפס את המערכת
    setTimeout(() => {
        resetAlarm();
    }, 10000);
}

// בודק אזעקות כל שנייה
checkInterval = setInterval(checkAlerts, 1000);

// === פונקציות העיצוב והמעברים של האתר ===
function bootSystem() {
    document.getElementById('welcome-screen').style.opacity = '0';
    document.getElementById('welcome-screen').style.pointerEvents = 'none';
    
    setTimeout(() => {
        document.getElementById('black-screen').classList.add('active');
        
        setTimeout(() => {
            document.getElementById('black-screen').classList.remove('active');
            document.getElementById('core-system').classList.add('online');
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
}
