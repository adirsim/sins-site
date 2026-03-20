// משתנה שישמור את הפוליגון האדום, כדי שנוכל למחוק אותו כשהאזעקה נגמרת
let currentAlertLayer = null;

async function showPolygonOnMap(cityName) {
    // 1. אם יש כבר פוליגון קודם על המפה, מוחקים אותו קודם
    if (currentAlertLayer) {
        map.removeLayer(currentAlertLayer);
    }

    try {
        // 2. מביאים את קובץ ה-GeoJSON מהרשת (אוסף של כל הפוליגונים בארץ)
        // הערה: כרגע נשתמש במאגר גיטהאב פתוח שעשו מפתחים ישראלים
        const response = await fetch('https://raw.githubusercontent.com/idoflug/redalert/master/cities.json');
        const geojsonData = await response.json();

        // 3. מציירים את השכבה על המפה - אבל מסננים רק את העיר שקיבלנו!
        currentAlertLayer = L.geoJSON(geojsonData, {
            filter: function(feature) {
                // בודקים אם שם היישוב בפוליגון תואם לשם שקיבלנו
                // בחלק מקבצי ה-JSON קוראים לזה name, בחלק name_he. נכסה את האופציות:
                return feature.properties.name === cityName || feature.properties.name_he === cityName; 
            },
            style: function(feature) {
                return {
                    color: "#ff003c", // מסגרת אדומה (כמו הצבע של ההתראות באתר שלך)
                    weight: 2, // עובי המסגרת
                    fillColor: "#ff003c", // מילוי אדום
                    fillOpacity: 0.5 // חצי שקוף כדי שיראו את הרחובות למטה
                };
            }
        }).addTo(map);

        // 4. בונוס: עושים זום פנימה אוטומטית לעיר שמופעלת בה אזעקה!
        if (currentAlertLayer.getBounds().isValid()) {
            map.flyToBounds(currentAlertLayer.getBounds(), { maxZoom: 12, duration: 1.5 });
        }
        
    } catch (error) {
        console.error("שגיאה בטעינת הפוליגונים:", error);
    }
}

// פונקציה לניקוי המפה כשהאזעקה נגמרת
function clearMapAlerts() {
    if (currentAlertLayer) {
        map.removeLayer(currentAlertLayer);
        // מחזירים את המפה לזום הכללי של ישראל
        map.flyTo([31.5, 34.8], 7, { duration: 1.5 }); 
    }
}
