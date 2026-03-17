export default async function handler(req, res) {
    try {
        const response = await fetch('https://www.oref.org.il/WarningMessages/alert/alerts.json', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://www.oref.org.il/'
            },
            cache: 'no-store'
        });

        const data = await response.text();
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send("");
    }
}
