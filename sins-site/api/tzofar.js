export default async function handler(req, res) {
    // פותחים דלתות לאתר שלך ב-Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    try {
        // פונים לשרת הציבורי והחינמי של צופר
        const response = await fetch('https://api.tzevaadom.co.il/alerts-history', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const historyData = await response.json();
        
        // מקבלים את הזמן הנוכחי (בשניות)
        const now = Math.floor(Date.now() / 1000);
        let activeCities = [];
        let alertTitle = "צבע אדום";

        // בודקים אם יש התראה טרייה
        if (historyData && historyData.length > 0) {
            const latestAlert = historyData[0];
            const alertTime = latestAlert.alerts[0].time;
            
            // אם ההתראה קפצה ב-120 השניות האחרונות
            if (now - alertTime < 120) {
                latestAlert.alerts.forEach(a => {
                    activeCities = activeCities.concat(a.cities);
                });
                
                // התיקון הקטלני: פשוט לוקחים את הכותרת המדויקת מהשרת במקום לנחש מספרים!
                if (latestAlert.title) {
                    alertTitle = latestAlert.title;
                } else if (latestAlert.alerts[0].title) {
                    alertTitle = latestAlert.alerts[0].title;
                }
            }
        }
        
        res.status(200).json({
            title: alertTitle,
            data: activeCities
        });
        
    } catch (error) {
        res.status(200).json({ title: "צבע אדום", data: [] });
    }
}
