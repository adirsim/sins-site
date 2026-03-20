function bootSystem() {
    document.getElementById('welcome-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('welcome-screen').style.display = 'none';
        
        const blackScreen = document.getElementById('black-screen');
        blackScreen.classList.add('active');
        
        setTimeout(() => {
            blackScreen.classList.remove('active');
            
            setTimeout(() => {
                document.getElementById('core-system').classList.add('online');
                startAlertScanner();
            }, 500);
            
        }, 1500);
    }, 500);
}

function navSwitch(tabId, element) {
    const links = document.querySelectorAll('.nav-menu a');
    links.forEach(link => link.classList.remove('active', 'active-alert'));
    
    if(tabId === 'alerts') {
        element.classList.add('active-alert');
        setTimeout(() => {
            if(typeof map !== 'undefined') {
                map.invalidateSize();
            }
        }, 100);
    } else {
        element.classList.add('active');
    }

    const tabs = document.querySelectorAll('.tab-layer');
    tabs.forEach(tab => {
        tab.classList.remove('show', 'win11-in');
    });

    const activeTab = document.getElementById(tabId);
    activeTab.classList.add('show');
    setTimeout(() => activeTab.classList.add('win11-in'), 10);
}

// === המערכת של המפה ===

let map;
let currentAlertLayers = []; 
let geojsonData = null;      

function initMap() {
    map = L.map('map').setView([31.5, 34.8], 7); 
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    fetch('https://raw.githubusercontent.com/idoflug/redalert/master/cities.json')
        .then(res => res.json())
        .then(data => {
            geojsonData = data;
        })
        .catch(err => console.error("שגיאה בטעינת נתוני מפה:", err));
}

function showPolygonsOnMap(cityNamesArray) {
    clearMapAlerts(); 

    if (!geojsonData) return; 

    const alertLayer = L.geoJSON(geojsonData, {
        filter: function(feature) {
            const nameHebrew = feature.properties.name || feature.properties.name_he || "";
            return cityNamesArray.includes(nameHebrew);
        },
        style: function() {
            return {
                color: "#ff003c",      
                weight: 2,             
                fillColor: "#ff003c",  
                fillOpacity: 0.5       
            };
        }
    }).addTo(map);

    currentAlertLayers.push(alertLayer);

    if (alertLayer.getBounds().isValid()) {
        map.flyToBounds(alertLayer.getBounds(), { maxZoom: 11, duration: 1.5 });
    }
}

function clearMapAlerts() {
    currentAlertLayers.forEach(layer => map.removeLayer(layer));
    currentAlertLayers = [];
}

// === מערכת התראות ===

let isTestMode = false;

function triggerTestAlert() {
    isTestMode = true;
    document.getElementById('active-alarm').style.display = 'block';
    document.getElementById('alarm-cities').innerText = 'טבריה, חיפה - הדר ועיר תחתית';
    
    showPolygonsOnMap(['טבריה', 'חיפה - הדר ועיר תחתית']);

    setTimeout(() => {
        isTestMode = false;
        document.getElementById('active-alarm').style.display = 'none';
        clearMapAlerts();
        map.flyTo([31.5, 34.8], 7, { duration: 1.5 }); 
    }, 10000); 
}

async function fetchAlerts() {
    if (isTestMode) return; 

    try {
        // פנייה לשרת ה-Vercel שלך שמביא את הטקסט מהשרת בפתח תקווה.
        // שים לב: אם קראת לקובץ ב-Vercel בשם אחר (למשל tzofar.js), תשנה את הקישור בהתאם!
        const response = await fetch('/api/tzofar'); // הלינק היחסי ל-API שלך ב-Vercel
        
        if (!response.ok) {
            handleNoAlerts();
            return;
        }

        // מקבלים את הטקסט (למשל: "טבריה, חיפה")
        const text = await response.text();
        
        // אם הטקסט ריק - אין אזעקות
        if (!text || text.trim() === "") {
            handleNoAlerts();
            return;
        }

        // הופכים את הטקסט של הערים לרשימה מסודרת שמפרידה בין הפסיקים
        const cities = text.split(',').map(city => city.trim()).filter(city => city !== "");

        // אם הרשימה לא ריקה, מפעילים את האזעקה והמפה!
        if (cities.length > 0) {
            document.getElementById('active-alarm').style.display = 'block';
            document.getElementById('alarm-cities').innerText = cities.join(', ');
            
            showPolygonsOnMap(cities);
        } else {
            handleNoAlerts();
        }

    } catch (error) {
        handleNoAlerts();
    }
}

function handleNoAlerts() {
    if (isTestMode) return;
    
    document.getElementById('active-alarm').style.display = 'none';
    
    if (currentAlertLayers.length > 0) {
        clearMapAlerts();
        map.flyTo([31.5, 34.8], 7, { duration: 1.5 });
    }
}

function startAlertScanner() {
    setInterval(fetchAlerts, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
});
