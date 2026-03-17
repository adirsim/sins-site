// מנוע טפסים
document.getElementById('staff-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    const btn = document.getElementById('btn-submit-apply');
    btn.innerHTML = 'שולח... <i class="fas fa-spinner fa-spin"></i>'; 
    fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(this) })
    .then(res => { if(res.ok) { document.getElementById('staff-form').style.display = 'none'; document.getElementById('apply-success').style.display = 'block'; }});
});

document.getElementById('report-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-report');
    btn.innerHTML = 'שולח... <i class="fas fa-spinner fa-spin"></i>'; 
    fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(this) })
    .then(res => { if(res.ok) { document.getElementById('report-form').style.display = 'none'; document.getElementById('report-success').style.display = 'block'; }});
});

function bootSystem() {
    const welcome = document.getElementById('welcome-screen');
    const blackScreen = document.getElementById('black-screen');
    const core = document.getElementById('core-system');

    welcome.style.opacity = '0';
    setTimeout(() => { welcome.style.display = 'none'; }, 500);

    setTimeout(() => {
        blackScreen.classList.add('active');
        document.getElementById('bg-music').src = "https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1&loop=1&playlist=5qap5aO4i9A&controls=0";
    }, 500);

    setTimeout(() => {
        blackScreen.style.opacity = '0';
        setTimeout(() => { blackScreen.style.display = 'none'; }, 500);
        setTimeout(() => { core.classList.add('online'); }, 3000); 
    }, 3000);
}

let isAnimating = false;
function navSwitch(tabId, element) {
    if (isAnimating) return;
    const currentTab = document.querySelector('.tab-layer.show');
    const newTab = document.getElementById(tabId);
    if (currentTab === newTab) return;

    isAnimating = true;

    document.querySelectorAll('.nav-menu a').forEach(a => {
        a.classList.remove('active');
        if(a.classList.contains('nav-alert')) a.classList.remove('active-alert');
    });
    
    if(element.classList.contains('nav-alert')) { element.classList.add('active-alert'); } else { element.classList.add('active'); }

    currentTab.classList.remove('win11-in');
    currentTab.classList.add('win11-out');

    setTimeout(() => {
        currentTab.classList.remove('show', 'win11-out');
        newTab.classList.add('show', 'win11-in');
        setTimeout(() => { isAnimating = false; }, 350); 
    }, 100);
}

// ==========================================
// מנוע התראות חכם - מחובר לשרת Vercel הסודי שלנו!
// ==========================================
let lastAlertId = "";
let alertActive = false;

async function fetchRealAlerts() {
    try {
        // פונים למנוע החדש שלנו שיצרת עכשיו בתיקיית api
        const targetUrl = '/api/tzofar?v=' + new Date().getTime();
        
        const response = await fetch(targetUrl, { cache: 'no-store' });
        if (!response.ok) return; 
        
        const textData = await response.text();
        
        // אם הקובץ ריק (שגרה)
        if (!textData || textData.trim() === "") {
            if (alertActive) {
                setTimeout(turnOffAlert, 8000); 
            }
            return; 
        }

        // פענוח בזמן אמת
        try {
            const alertData = JSON.parse(textData);
            
            if (alertData && alertData.data && alertData.data.length > 0) {
                const cities = alertData.data.join(', ');
                const title = alertData.title;
                const alertId = alertData.id || new Date().getTime().toString(); 
                
                if (alertId !== lastAlertId) {
                    lastAlertId = alertId;
                    triggerRealAlert(title, cities);
                }
            }
        } catch (parseError) {
            // מתעלמים משגיאות פענוח
        }

    } catch (error) {
        // מתעלמים משגיאות רשת
    }
}

// הפונקציה החכמה שמנתחת את האיום
function getThreatStyles(title) {
    if (title.includes("מחבלים") || title.includes("פשיטה")) {
        return { color: "#9333ea", icon: "fas fa-skull-crossbones", bgGlow: "rgba(147, 51, 234, 0.2)", cardBg: "rgba(147, 51, 234, 0.15)", type: "חדירת מחבלים!", flash: true };
    }
    if (title.includes("כלי טיס") || title.includes("כטב\"ם")) {
        return { color: "#f97316", icon: "fas fa-fighter-jet", bgGlow: "rgba(249, 115, 22, 0.2)", cardBg: "rgba(249, 115, 22, 0.15)", type: "חדירת כלי טיס עוין!", flash: true };
    }
    if (title.includes("חומרים מסוכנים") || title.includes("חומ\"ס")) {
        return { color: "#84cc16", icon: "fas fa-radiation", bgGlow: "rgba(132, 204, 22, 0.2)", cardBg: "rgba(132, 204, 22, 0.15)", type: "אירוע חומרים מסוכנים!", flash: true };
    }
    if (title.includes("מבזק") || title.includes("הנחיות") || title.includes("עדכון") || title.includes("התרעה מקדימה")) {
        return { color: "#f59e0b", icon: "fas fa-info-circle", bgGlow: "rgba(245, 158, 11, 0.2)", cardBg: "rgba(245, 158, 11, 0.15)", type: "עדכון פיקוד העורף:", flash: false };
    }
    return { color: "#ff003c", icon: "fas fa-rocket", bgGlow: "rgba(255, 0, 60, 0.2)", cardBg: "rgba(255, 0, 60, 0.15)", type: "ירי רקטות וטילים!", flash: true };
}

function triggerRealAlert(title, cities) {
    alertActive = true;
    const radar = document.getElementById('radar-ui');
    const radarIcon = document.getElementById('radar-icon');
    const statusText = document.getElementById('status-text');
    const dot = document.getElementById('status-dot-ui');
    const alarmCard = document.getElementById('active-alarm');
    const bg = document.getElementById('core-system');
    
    const threat = getThreatStyles(title);
    
    document.getElementById('alarm-title').innerHTML = `<i class="${threat.icon}"></i> ${title}`;
    document.getElementById('alarm-cities').innerText = !threat.flash ? `תוכן: ${cities}` : `אזורים: ${cities}`;

    radar.style.borderColor = threat.color;
    radarIcon.className = threat.icon;
    radarIcon.style.color = threat.color;
    radarIcon.style.animation = "pulseDot 0.5s infinite alternate";
    
    dot.style.background = threat.color;
    dot.style.boxShadow = `0 0 15px ${threat.color}`;
    statusText.innerHTML = `<span class="status-dot" style="background: ${threat.color}; box-shadow: 0 0 15px ${threat.color};"></span> ${threat.type}`;
    statusText.style.color = threat.color;
    
    alarmCard.style.display = "block";
    alarmCard.style.borderColor = threat.color;
    alarmCard.style.backgroundColor = threat.cardBg;
    
    alarmCard.style.animation = threat.flash ? "flashRed 1s infinite alternate" : "none";
    if(threat.flash) {
        alarmCard.style.boxShadow = `0 0 20px ${threat.color}`; 
    }
    
    bg.style.boxShadow = `inset 0 0 100px ${threat.bgGlow}`;
}

function turnOffAlert() {
    alertActive = false;
    lastAlertId = ""; 
    const radar = document.getElementById('radar-ui');
    const radarIcon = document.getElementById('radar-icon');
    const statusText = document.getElementById('status-text');
    const alarmCard = document.getElementById('active-alarm');
    const bg = document.getElementById('core-system');

    radar.style.borderColor = "rgba(20, 184, 166, 0.3)";
    radarIcon.className = "fas fa-shield-alt";
    radarIcon.style.color = "#14b8a6";
    radarIcon.style.animation = "none";
    
    statusText.innerHTML = '<span class="status-dot"></span> סורק התראות אמת מחובר לשרת';
    statusText.style.color = "#f3f4f6";
    alarmCard.style.display = "none";
    bg.style.boxShadow = "none";
}

function triggerTestAlert() {
    triggerRealAlert("חדירת כלי טיס עוין", "טבריה (טסט מערכת)");
    setTimeout(turnOffAlert, 15000);
}

// קצב סריקה של חמ"ל אמיתי: 3 שניות
setInterval(fetchRealAlerts, 3000);
