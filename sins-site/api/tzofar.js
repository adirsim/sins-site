export default async function handler(req, res) {
    // פותחים דלתות לאתר
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    try {
        const response = await fetch('https://api.tzevaadom.co.il/alerts-history', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const historyData = await response.json();
        
        const now = Math.floor(Date.now() / 1000);
        let activeCities = [];
        let alertTitle = "התרעת צבע אדום"; // ברירת המחדל

        if (historyData && historyData.length > 0) {
            const latestAlert = historyData[0];
            const alertTime = latestAlert.alerts[0].time;
            
            // בודקים אם ההתראה טרייה (מה-120 שניות האחרונות)
            if (now - alertTime < 120) {
                latestAlert.alerts.forEach(a => {
                    activeCities = activeCities.concat(a.cities);
                });
                
                // רשת ביטחון משולשת: בודקים גם טקסט, גם threat וגם category
                const threatNum = latestAlert.alerts[0].threat;
                const categoryNum = latestAlert.alerts[0].category;
                const titleText = latestAlert.title || latestAlert.alerts[0].title || "";
                
                if (titleText.includes("כלי טיס") || threatNum === 2 || categoryNum === 2) {
                    alertTitle = "חדירת כלי טיס עוין";
                } else if (titleText.includes("מחבלים") || threatNum === 3 || categoryNum === 3) {
                    alertTitle = "חדירת מחבלים";
                } else if (titleText.includes("טילים") || threatNum === 1 || categoryNum === 1) {
                    alertTitle = "ירי רקטות וטילים";
                } else if (titleText !== "") {
                    // אם יש טקסט אחר שצופר שלחו, נשתמש בו
                    alertTitle = titleText;
                }
            }
        }
        
        res.status(200).json({
            title: alertTitle,
            data: activeCities
        });
        
    } catch (error) {
        res.status(200).json({ title: "התרעת צבע אדום", data: [] });
    }
}
