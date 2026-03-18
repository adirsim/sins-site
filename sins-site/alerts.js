let alarmActive = false;
let checkInterval;

async function checkAlerts() {
    try {
        // פנייה לשרת הישראלי החדש שלנו שעוקף את החסימה בפתח תקווה!
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
        
        // צובע את הכל באדום
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
}

function resetAlarm() {
    if (alarmActive) {
        alarmActive = false;
        
        // מחזיר לירוק (מצב רגוע)
        document.getElementById('main-radar-box').style.background = 'rgba(0,0,0,0.3)';
        document.getElementById('main-radar-box').style.borderColor = 'rgba(255, 255, 255, 0.06)';
        
        document.getElementById('radar-ui').style.borderColor = 'rgba(20, 184, 166, 0.3)';
        document.getElementById('radar-icon').style.color = '#14b8a6';
        
        document.getElementById('status-text').innerHTML = '<span class="status-dot" id="status-dot-ui"></span> סורק התראות אמת (פיקוד העורף)';
        
        document.getElementById('active-alarm').style.display = 'none';
    }
}

function triggerTestAlert() {
    triggerAlarm("טסט למנהלים (ירי רקטות)", ["טבריה", "רמת גולן", "תל אביב - מרכז"]);
    
    setTimeout(() => {
        if (alarmActive) resetAlarm();
    }, 15000);
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
