const https = require('https');
const fs = require('fs');

const url = 'https://sfbay.craigslist.org/search/sss?query=honda+civic';

https.get(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
}, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        fs.writeFileSync('debug_output_utf8.html', data, 'utf8');
        console.log('Wrote to debug_output_utf8.html');
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
