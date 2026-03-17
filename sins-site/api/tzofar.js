export default async function handler(req, res) {
    // פותחים דלתות לאתר שלך
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    // הטריק: רשימה של כתובות IP ישראליות אמיתיות (בזק, הוט, סלקום)
    const israeliIPs = [
        '77.137.54.21', 
        '2.55.192.14', 
        '31.154.8.12', 
        '84.228.114.5',
        '147.235.200.10'
    ];
    // בוחרים אחת אקראית בכל פעם כדי לא לעורר חשד
    const randomIP = israeliIPs[Math.floor(Math.random() * israeliIPs.length)];

    try {
        const response = await fetch('https://www.oref.org.il/WarningMessages/alert/alerts.json', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://www.oref.org.il/',
                'X-Forwarded-For': randomIP,
                'Client-IP': randomIP
            },
            cache: 'no-store'
        });

        const arrayBuffer = await response.arrayBuffer();
        
        // מתרגמים את השפה הסודית של פיקוד העורף
        let text = new TextDecoder('utf-16le').decode(arrayBuffer);
        
        text = text.trim();
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
        }

        if (text.length > 0 && !text.startsWith('{') && !text.startsWith('[')) {
            text = new TextDecoder('utf-8').decode(arrayBuffer);
            text = text.trim();
        }

        res.status(200).send(text);
    } catch (error) {
        res.status(500).send("");
    }
}
