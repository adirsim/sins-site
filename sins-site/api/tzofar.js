export default async function handler(req, res) {
    // פותחים דלתות לאתר שלך ב-Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    try {
        // פונים לשרת הישראלי הפרטי שלנו בפתח תקווה!
        const response = await fetch('http://185.28.154.120', {
            cache: 'no-store'
        });
        
        // השרת שלנו כבר עשה את כל העבודה הקשה של התרגום, אז רק לוקחים את הטקסט
        const data = await response.text();
        
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send("");
    }
}
