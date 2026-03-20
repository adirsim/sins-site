export default async function handler(req, res) {
    // פותחים דלתות לאתר שלך ב-Vercel (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    // אומרים לדפדפן שאנחנו מחזירים טקסט נקי בעברית
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    try {
        // פונים לשרת הישראלי הפרטי בפתח תקווה
        const response = await fetch('http://185.28.154.120', {
            cache: 'no-store'
        });
        
        // לוקחים את הטקסט הנקי שהשרת הכין
        const data = await response.text();
        
        // שולחים לאתר. ה-trim מנקה רווחים מיותרים בהתחלה ובסוף
        res.status(200).send(data.trim());
    } catch (error) {
        // אם יש נפילה, נחזיר טקסט ריק כדי לא להקריס את האתר שלך
        res.status(500).send("");
    }
}
