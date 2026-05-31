// ========================================================================
// SINS SERVER API - TZOFAR REALTIME FETCH
// ========================================================================

export default async function handler(req, res) {
    // הגדרת כותרות (Headers) כדי שהדפדפן לא יחסום את הבקשה
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        // פנייה ישירה לשרת ההתראות של צופר
        const response = await fetch('https://api.tzevaadom.co.il/alerts-history', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        if (!response.ok) {
            return res.status(500).json({ error: 'Failed to fetch data from Tzofar' });
        }

        const data = await response.json();
        
        // החזרת המידע הנקי ישירות לאתר שלך
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: 'Server Connection Error', details: error.message });
    }
}
