export default async function handler(req, res) {
    // פותחים דלתות לאתר שלך ב-Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    try {
        // פונים לשרת הציבורי והחינמי של צופר במקום לשרת היקר שבוטל
        const response = await fetch('https://api.tzevaadom.co.il/alerts-history', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const historyData = await response.json();
        
        // מקבלים את הזמן הנוכחי (בשניות)
        const now = Math.floor(Date.now() / 1000);
        let activeCities = [];
        let alertTitle = "צבע אדום";

        // בודקים אם יש התראה טרייה מהמערכת (מהדקה-שתיים האחרונות)
        if (historyData && historyData.length > 0) {
            const latestAlert = historyData[0];
            const alertTime = latestAlert.alerts[0].time;
            
            // אם ההתראה קפצה ב-120 השניות האחרונות, זו אזעקת אמת פעילה
            if (now - alertTime < 120) {
                latestAlert.alerts.forEach(a => {
                    activeCities = activeCities.concat(a.cities);
                });
                
                // בודקים אם מדובר בכטב"ם או משהו אחר (0=טילים, 1=כלי טיס, 5=מחבלים)
                if (latestAlert.alerts[0].threat === 1) {
                    alertTitle = "חדירת כלי טיס עוין";
                } else if (latestAlert.alerts[0].threat === 5) {
                    alertTitle = "חדירת מחבלים";
                } else {
                    alertTitle = "ירי רקטות וטילים";
                }
            }
        }
        
        // שולחים לאתר שלך את המידע בצורה הנקייה שהוא אוהב לקבל (JSON)
        res.status(200).json({
            title: alertTitle,
            data: activeCities
        });
        
    } catch (error) {
        // אם יש שגיאה, מחזירים ריק כדי לא להקריס את האתר
        res.status(200).json({ title: "צבע אדום", data: [] });
    }
}
