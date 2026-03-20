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
        // 👇👇 שים כאן את הלינק המדויק ל-API/Vercel שלך 👇👇
        const response = await fetch('/api/tzofar'); 
        const text = await response.text();
        
        if (text && text.trim() !== "") {
            document.getElementById('active-alarm').style.display = 'block';
            document.getElementById('alarm-cities').innerText = text.trim();
        } else {
            document.getElementById('active-alarm').style.display = 'none';
        }

    } catch (error) {
        document.getElementById('active-alarm').style.display = 'none';
    }
}

function startAlertScanner() {
    setInterval(fetchAlerts, 2000);
}
