const https = require('https');

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
        // Print first 5000 chars to check structure
        console.log(data.slice(0, 5000));
        // Also try to match the regex we use
        const listingRegex = /<li[^>]*class="[^"]*cl-static-search-result[^"]*"[^>]*>[\s\S]*?<\/li>/gi;
        const matches = data.match(listingRegex);
        console.log('REGEX_MATCHES:', matches ? matches.length : 0);

        if (matches && matches.length > 0) {
            console.log('FIRST MATCH SAMPLE:', matches[0]);
        } else {
            // Try searching for title class directly
            const titleMatches = data.match(/class="[^"]*titlestring[^"]*"/g);
            console.log('TITLE_CLASS_MATCHES:', titleMatches ? titleMatches.length : 0);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
