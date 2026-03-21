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
                startAlertScanner(); // מתחיל לחפש אזעקות
            }, 500);
            
        }, 1500);
    }, 500);
}

function navSwitch(tabId, element) {
    const links = document.querySelectorAll('.nav-menu a');
    links.forEach(link => link.classList.remove('active', 'active-alert'));
    
    if(tabId === 'alerts') {
        element.classList.add('active-alert');
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

// === טסט אזעקות ===
let isTestMode = false;

function triggerTestAlert() {
    isTestMode = true;
    document.getElementById('active-alarm').style.display = 'block';
    document.getElementById('alarm-title').innerHTML = `<i class="fas fa-exclamation-triangle"></i> צבע אדום`;
    document.getElementById('alarm-cities').innerText = 'טבריה, חיפה - הדר ועיר תחתית (טסט)';

    setTimeout(() => {
        isTestMode = false;
        document.getElementById('active-alarm').style.display = 'none';
    }, 10000); 
}

// === קריאה ל-API שלך ===
async function fetchAlerts() {
    if (isTestMode) return; 

    try {
        const response = await fetch('/api/tzofar'); 
        const text = await response.text();
        
        // אם אין טקסט, מכבים את האזעקה
        if (!text || text.trim() === "") {
            document.getElementById('active-alarm').style.display = 'none';
            return;
        }

        try {
            // מנסים להבין את חבילת הנתונים (JSON) שהגיעה מהשרת
            const data = JSON.parse(text);
            let cities = [];
            let alertTitle = "צבע אדום";

            // שולפים את הערים והכותרת מתוך הקוד המבולגן
            if (Array.isArray(data)) {
                data.forEach(alert => {
                    if (alert.data) cities = cities.concat(alert.data);
                    if (alert.title) alertTitle = alert.title;
                });
            } else {
                if (data.data) cities = data.data;
                if (data.title) alertTitle = data.title;
            }

            // מציגים הכל נקי באתר
            if (cities.length > 0) {
                document.getElementById('active-alarm').style.display = 'block';
                document.getElementById('alarm-title').innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${alertTitle}`;
                document.getElementById('alarm-cities').innerText = cities.join(', ');
            } else {
                document.getElementById('active-alarm').style.display = 'none';
            }

        } catch (e) {
            // גיבוי: אם השרת שלח סתם טקסט רגיל (לא JSON)
            document.getElementById('active-alarm').style.display = 'block';
            document.getElementById('alarm-title').innerHTML = `<i class="fas fa-exclamation-triangle"></i> צבע אדום`;
            document.getElementById('alarm-cities').innerText = text.trim();
        }

    } catch (error) {
        document.getElementById('active-alarm').style.display = 'none';
    }
}

function startAlertScanner() {
    setInterval(fetchAlerts, 2000);
}


// ==========================================
// מערכת שליחת טפסים למייל ללא ריפרש (Web3Forms)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. טיפול בטופס הגשת מועמדות לצוות
    const staffForm = document.getElementById('staff-form');
    if (staffForm) {
        staffForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // עוצר את הריפרש!

            const submitBtn = document.getElementById('btn-submit-apply');
            submitBtn.innerText = 'שולח... ממתין לאישור';
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: new FormData(this)
                });

                if (response.ok) {
                    staffForm.style.display = 'none';
                    document.getElementById('apply-success').style.display = 'block';
                } else {
                    submitBtn.innerText = 'שגיאה בשליחה. נסה שוב';
                    submitBtn.disabled = false;
                }
            } catch (error) {
                submitBtn.innerText = 'שגיאה ברשת. נסה שוב';
                submitBtn.disabled = false;
            }
        });
    }

    // 2. טיפול בטופס הדיווחים (Report)
    const reportForm = document.getElementById('report-form');
    if (reportForm) {
        reportForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // עוצר את הריפרש!

            const submitBtn = document.getElementById('btn-submit-report');
            submitBtn.innerHTML = 'שולח דיווח... <i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: new FormData(this)
                });

                if (response.ok) {
                    reportForm.style.display = 'none';
                    document.getElementById('report-success').style.display = 'block';
                } else {
                    submitBtn.innerHTML = 'שגיאה בשליחה <i class="fas fa-exclamation-triangle"></i>';
                    submitBtn.disabled = false;
                }
            } catch (error) {
                submitBtn.innerHTML = 'שגיאה ברשת. נסה שוב';
                submitBtn.disabled = false;
            }
        });
    }
});
