export default async function handler(req, res) {
    // מאפשרים לאתר שלך לדבר עם השרת
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');

    try {
        // ניסיון 1: פנייה ישירה לפיקוד העורף עם תחפושת של דפדפן ישראלי
        let response = await fetch('https://www.oref.org.il/WarningMessages/alert/alerts.json', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://www.oref.org.il/'
            },
            cache: 'no-store'
        });

        // ניסיון 2: אם צה"ל במצב מלחמה וחסם את אמריקה (Vercel), פותחים תעלת מעקף (פרוקסי)
        if (!response.ok) {
            response = await fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent('https://www.oref.org.il/WarningMessages/alert/alerts.json?v=' + Date.now()));
        }

        const arrayBuffer = await response.arrayBuffer();
        
        // תיקון קריטי: פיקוד העורף משתמש בקידוד שפה נדיר (UTF-16LE). אנחנו מתרגמים אותו!
        let text = new TextDecoder('utf-16le').decode(arrayBuffer);
        
        // ניקוי תווים שבורים
        text = text.trim();
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
        }

        // גיבוי למקרה שפתאום פיקוד העורף ישנה את הקידוד לרגיל
        if (text.length > 0 && !text.startsWith('{') && !text.startsWith('[')) {
            text = new TextDecoder('utf-8').decode(arrayBuffer);
            text = text.trim();
        }

        // שולחים את המידע הנקי לאתר שלך!
        res.status(200).send(text);
    } catch (error) {
        res.status(500).send("");
    }
}
