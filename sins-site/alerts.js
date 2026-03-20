// ==========================================
// פונקציות ממשק משתמש (UI) ומעבר טאבים
// ==========================================

function bootSystem() {
    // 1. העלמת מסך הפתיחה
    document.getElementById('welcome-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('welcome-screen').style.display = 'none';
        
        // 2. הפעלת אפקט המסך השחור
        const blackScreen = document.getElementById('black-screen');
        blackScreen.classList.add('active');
        
        setTimeout(() => {
            blackScreen.classList.remove('active');
            
            // 3. הצגת המערכת המרכזית (כניסה לאתר)
            setTimeout(() => {
                document.getElementById('core-system').classList.add('online');
                // מתחילים לסרוק אזעקות ברגע שהמשתמש נכנס לאתר
                startAlertScanner();
            }, 500);
            
        }, 1500);
    }, 500);
}

function navSwitch(tabId, element) {
    // איפוס עיצוב לכל הכפתורים בתפריט
    const links = document.querySelectorAll('.nav-menu a');
    links.forEach(link => link.classList.remove('active', 'active-alert'));
    
    // סימון הכפתור שנלחץ
    if(tabId === 'alerts') {
        element.classList.add('active-alert');
        // תיקון חשוב: מרענן את המפה כשהטאב נפתח כדי שלא תיראה אפורה/שבורה
        setTimeout(() => {
            if(typeof map !== 'undefined') {
                map.invalidateSize();
            }
        }, 100);
    } else {
        element.classList.add('active');
    }

    // הסתרת כל הטאבים
    const tabs = document.querySelectorAll('.tab-layer');
    tabs.forEach(tab => {
        tab.classList.remove('show', 'win11-in');
    });

    // הצגת הטאב המבוקש עם אנימציה
    const activeTab = document.getElementById(tabId);
    activeTab.classList.add('show');
    setTimeout(() => activeTab.classList.add('win11-in'), 10);
}

// ==========================================
// מערכת המפה והפוליגונים (Leaflet)
// ==========================================

let map;
let currentAlertLayers = []; // שומר את הפוליגונים האדומים שעל המפה
let geojsonData = null;      // שומר את קובץ הערים כדי לא להוריד אותו מחדש כל שנייה

// אתחול המפה כשהדף עולה
function initMap() {
    map = L.map('map').setView([31.5, 34.8], 7); // מרכז ישראל
    
    // מפה בעיצוב כהה שתתאים לאתר שלך
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // מוריד מראש את הפוליגונים של כל הערים בארץ מגיטהאב
    fetch('https://raw.githubusercontent.com/idoflug/redalert/master/cities.json')
        .then(res => res.json())
        .then(data => {
            geojsonData = data;
            console.log("נתוני גבולות הערים נטענו בהצלחה למפה!");
        })
        .catch(err => console.error("שגיאה בטעינת נתוני מפה:", err));
}

// פונקציה שמקבלת רשימת ערים וצובעת אותן באדום
function showPolygonsOnMap(cityNamesArray) {
    clearMapAlerts(); // מנקה התראות קודמות מהמפה

    if (!geojsonData) return; // אם הקובץ עדיין לא ירד, אל תעשה כלום

    // יוצר שכבה אדומה רק לערים שנמצאות ברשימת האזעקות כרגע
    const alertLayer = L.geoJSON(geojsonData, {
        filter: function(feature) {
            const nameHebrew = feature.properties.name || feature.properties.name_he || "";
            return cityNamesArray.includes(nameHebrew);
        },
        style: function() {
            return {
                color: "#ff003c",      // גבול אדום
                weight: 2,             // עובי גבול
                fillColor: "#ff003c",  // מילוי אדום
                fillOpacity: 0.5       // חצי שקוף
            };
        }
    }).addTo(map);

    currentAlertLayers.push(alertLayer);

    // עושה זום אוטומטי ומחליק את המפה ישר לעיר שיש בה אזעקה
    if (alertLayer.getBounds().isValid()) {
        map.flyToBounds(alertLayer.getBounds(), { maxZoom: 11, duration: 1.5 });
    }
}

// מנקה את האדום מהמפה כשהאזעקה נגמרת
function clearMapAlerts() {
    currentAlertLayers.forEach(layer => map.removeLayer(layer));
    currentAlertLayers = [];
}

// ==========================================
// מערכת התראות בזמן אמת מתחברת ל-API
// ==========================================

let isTestMode = false;

// כפתור הטסט שיש לך באתר - עכשיו הוא מפעיל גם את המפה!
function triggerTestAlert() {
    isTestMode = true;
    document.getElementById('active-alarm').style.display = 'block';
    document.getElementById('alarm-cities').innerText = 'טבריה, חיפה - הדר ועיר תחתית (טסט)';
    
    // זורק למפה את טבריה ואת חיפה לבדיקה
    showPolygonsOnMap(['טבריה', 'חיפה - הדר ועיר תחתית']);

    // אחרי 10 שניות מכבה את הטסט ומחזיר את המפה למרכז
    setTimeout(() => {
        isTestMode = false;
        document.getElementById('active-alarm').style.display = 'none';
        clearMapAlerts();
        map.flyTo([31.5, 34.8], 7, { duration: 1.5 }); 
    }, 10000); 
}

// הפונקציה שסורקת התראות אמיתיות
async function fetchAlerts() {
    if (isTestMode) return; // לא לדרוס את המערכת אם מנהל עושה טסט

    try {
        // API פתוח של התראות פיקוד העורף
        const response = await fetch('https://api.tzevaadom.co.il/notifications');
        
        if (!response.ok || response.status === 204) {
            handleNoAlerts();
            return;
        }

        const text = await response.text();
        if (!text) {
            handleNoAlerts();
            return;
        }

        const data = JSON.parse(text);

        // אם יש אזעקות
        if (Array.isArray(data) && data.length > 0) {
            const cities = data.map(alert => alert.data).flat(); 
            
            // מפעיל את ההתרעה ב-HTML
            document.getElementById('active-alarm').style.display = 'block';
            document.getElementById('alarm-cities').innerText = cities.join(', ');
            
            // שולח למפה לצבוע אותן
            showPolygonsOnMap(cities);
        } else {
            handleNoAlerts();
        }

    } catch (error) {
        handleNoAlerts();
    }
}

// כשאין אזעקות - מכבה את ההתרעות באתר ובמפה
function handleNoAlerts() {
    if (isTestMode) return;
    
    document.getElementById('active-alarm').style.display = 'none';
    
    // אם המפה צבועה באדום, מנקה אותה וחוזר למבט על ישראל
    if (currentAlertLayers.length > 0) {
        clearMapAlerts();
        map.flyTo([31.5, 34.8], 7, { duration: 1.5 });
    }
}

// לופ שבודק את ה-API כל 2 שניות
function startAlertScanner() {
    setInterval(fetchAlerts, 2000);
}

// מפעיל את המפה ברגע שהקוד נטען
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});
