// ========================================================================
// SINS CORE - REALTIME ALERTS (CONNECTED TO INTERNAL API)
// ========================================================================

const alertDisplayBox = document.getElementById('alert-display-box');
const alertHeaderTitle = document.getElementById('alert-header-title');
const alertCitiesList = document.getElementById('alert-cities-list');
const dangerTabTrigger = document.querySelector('.hud-trigger-danger');

function triggerRealtimeAlert(title, cities) {
    if (!alertDisplayBox) return;
    alertDisplayBox.style.display = 'block';
    alertHeaderTitle.innerText = title;
    alertCitiesList.innerText = cities;

    if (dangerTabTrigger) {
        dangerTabTrigger.style.animation = 'pulseChromaNode 0.4s infinite alternate';
    }
}

function clearActiveAlert() {
    if (alertDisplayBox) alertDisplayBox.style.display = 'none';
    if (dangerTabTrigger) dangerTabTrigger.style.animation = 'none';
}

// מנוע משיכת הנתונים המעודכן - פונה לשרת הפרטי שלך!
async function checkOrefAlerts() {
    try {
        // פנייה לנתיב של השרת הפנימי שלך שהגדרנו ב-image_88913c.png
        const response = await fetch('/api/tzofar');
        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const latestAlert = data[0];
            const alertTime = new Date(latestAlert.alert_time).getTime();
            const currentTime = new Date().getTime();
            
            // בדיקה אם האזעקה קרתה ב-25 השניות האחרונות
            if (currentTime - alertTime < 25000) {
                const zone = latestAlert.zone || "התראת חירום";
                const cities = latestAlert.cities ? latestAlert.cities.join(', ') : "אזור פעיל";
                
                triggerRealtimeAlert(`אזעקת ${zone}!`, cities);
            } else {
                clearActiveAlert();
            }
        }
    } catch (error) {
        console.log("> Internal API Gateway Standby.");
    }
}

// בדיקה רצה כל 4 שניות (עכשיו כשיש שרת זה בטוח ומהיר בהרבה!)
setInterval(checkOrefAlerts, 4000);
checkOrefAlerts();

// כפתור בדיקה / סימולציה
function runAlertSimulation() {
    triggerRealtimeAlert(
        "חדירת כלי טיס עוין!",
        "טבריה, מגדל, כל ערי סובב כנרת והגליל התחתון"
    );
}
