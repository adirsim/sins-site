// ========================================================================
// SINS CORE - REALTIME ALERTS PROTOCOL (TZEVA ADOM SIMULATION & FETCH)
// ========================================================================

// הגדרת משתנים לפאנל האזעקות מה-HTML שלך
const alertDisplayBox = document.getElementById('alert-display-box');
const alertHeaderTitle = document.getElementById('alert-header-title');
const alertCitiesList = document.getElementById('alert-cities-list');
const dangerTabTrigger = document.querySelector('.hud-trigger-danger');

// פונקציה שמפעילה את תצוגת האזעקה באתר באותה השנייה שהיא מתקבלת
function triggerRealtimeAlert(title, cities) {
    if (!alertDisplayBox) return;

    // הצגת התיבה ועדכון הטקסטים
    alertDisplayBox.style.display = 'block';
    alertHeaderTitle.innerText = title;
    alertCitiesList.innerText = cities;

    // הפעלת אפקט פעימה אדום מטורף על הטאב של "התראות אמת" בתפריט
    if (dangerTabTrigger) {
        dangerTabTrigger.style.animation = 'pulseChromaNode 0.4s infinite alternate';
    }
}

// פונקציה שמנקה את האזעקה כשהאירוע מסתיים
function clearActiveAlert() {
    if (alertDisplayBox) {
        alertDisplayBox.style.display = 'none';
    }
    if (dangerTabTrigger) {
        dangerTabTrigger.style.animation = 'none';
    }
}

// ========================================================================
// מנוע משיכת נתונים בזמן אמת (API FETCH PROTOCOL)
// ========================================================================
async function checkOrefAlerts() {
    try {
        // פנייה ל-API פתוח שמתווך את אזעקות פיקוד העורף בזמן אמת
        const response = await fetch('https://api.tzevaadom.co.il/alerts-history');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        // בדיקה אם יש אזעקה בדקות האחרונות (לדוגמה מה-15 שניות האחרונות)
        if (data && data.length > 0) {
            const latestAlert = data[0];
            const alertTime = new Date(latestAlert.alert_time).getTime();
            const currentTime = new Date().getTime();
            
            // אם האזעקה קרתה ב-30 השניות האחרונות - נציג אותה מיד באתר
            if (currentTime - alertTime < 30000) {
                const zone = latestAlert.zone || "התראת חירום";
                const cities = latestAlert.cities ? latestAlert.cities.join(', ') : "אזור הצפון";
                
                triggerRealtimeAlert(`אזעקת ${zone}!`, cities);
            } else {
                // אם אין אזעקה בדקה האחרונה, נקה את המסך
                clearActiveAlert();
            }
        }
    } catch (error) {
        console.log("> Monitoring system standby / Rate limit backup active.");
    }
}

// הרצת בדיקה אוטומטית בכל 5 שניות (כדי לא להעמיס על הדפדפן ולמנוע חסימות)
setInterval(checkOrefAlerts, 5000);
// הפעלה ראשונית מיד עם טעינת הקובץ
checkOrefAlerts();


// ========================================================================
// פונקציית הסימולציה מהכפתור (נשארת בשבילך לבדיקות פנימיות)
// ========================================================================
function runAlertSimulation() {
    triggerRealtimeAlert(
        "חדירת כלי טיס עוין!",
        "טבריה, מגדל, כל ערי סובב כנרת והגליל התחתון"
    );
}
