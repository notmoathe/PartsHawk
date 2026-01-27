import { scrape } from './lib/scraper'

async function test() {
    console.log('Testing scraper...')
    try {
        const results = await scrape('ebay', 'G35 Headlights', 200, ['broken'])
        console.log('Scraper results:', results)
        console.log(`Found ${results.length} items.`)
    } catch (e) {
        console.error('Scraper failed:', e)
    }
}

test()
