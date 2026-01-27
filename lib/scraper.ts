import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { ScraperResult } from './types'

// Optional: Load local puppeteer for dev if needed, or rely on core with local chrome path
// We can use a conditional import or just logic.
// For simplicity in this environment, we'll try to detect.
const isProduction = process.env.NODE_ENV === 'production'

// Main entry point
export async function scrape(source: 'ebay' | 'facebook' | 'craigslist', keywords: string, maxPrice: number, negativeKeywords: string[] = [], vehicleString?: string, exactMatch?: boolean): Promise<ScraperResult[]> {
    let items: ScraperResult[] = []

    if (source === 'ebay') {
        items = await scrapeEbay(keywords, maxPrice, negativeKeywords, vehicleString)
    } else if (source === 'facebook') {
        items = await scrapeFacebook(keywords, maxPrice, negativeKeywords, vehicleString)
    }

    // Exact Match Filtering
    if (exactMatch && items.length > 0) {
        const normalizedKeywords = keywords.toLowerCase().trim()
        items = items.filter(item => item.title.toLowerCase().includes(normalizedKeywords))
    }

    // Negative Keywords are already handled in scrapeEbay/scrapeFacebook usually, or we can enforce here?
    // Let's enforce here just in case scraper misses it
    if (negativeKeywords.length > 0) {
        items = items.filter(item => !negativeKeywords.some(nk => item.title.toLowerCase().includes(nk.toLowerCase())))
    }

    return items
}

async function getBrowser() {
    if (isProduction) {
        // Vercel / Production configuration
        return puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'),
            headless: true,
        })
    } else {
        // Local Development configuration
        // REFACTOR: Dynamic import to avoid bundling full puppeteer in Vercel
        const { default: puppeteerLocal } = await import('puppeteer')
        return puppeteerLocal.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
    }
}

async function scrapeEbay(keywords: string, maxPrice: number, negativeKeywords: string[] = [], vehicleString?: string): Promise<ScraperResult[]> {
    let browser = null
    try {
        browser = await getBrowser()
        const page = await browser.newPage()

        // Set Viewport to Desktop to ensure standard classes
        await page.setViewport({ width: 1920, height: 1080 })

        // Set a realistic User-Agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        // Add extra headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        })

        // Construct search URL
        // _nkw = keywords
        // _sacat = 0 (all categories)
        // _udhi = max price
        // _sop = 10 (newly listed)
        // Construct search URL
        const fullKeywords = vehicleString ? `${vehicleString} ${keywords}` : keywords
        const encodedKeywords = encodeURIComponent(fullKeywords)
        const url = `https://www.ebay.com/sch/i.html?_nkw=${encodedKeywords}&_sacat=0&_udhi=${maxPrice}&_sop=10&rt=nc`

        console.log(`[Scrape Debug] Navigating to: ${url}`)
        // Switch to networkidle2 to ensure AJAX results load
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

        // Wait for items to likely appear - increased timeout and check for main container
        try {
            await page.waitForSelector('.s-item', { timeout: 10000 })
        } catch (e) {
            console.warn('[Scrape Debug] Timeout waiting for .s-item selector. Checking for alternatives...')
            // Try waiting for the main result list container
            try { await page.waitForSelector('.srp-results', { timeout: 5000 }) } catch (e2) { }
        }

        // Check if we hit a captcha or block
        const pageTitle = await page.title()
        console.log(`[Scrape Debug] Page Title: ${pageTitle}`)

        // Extract items
        const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.s-item'))
            const standardResults = items.map(item => {
                // Skip "Shop on eBay" or "Results matching..." headers which share the class
                if (item.querySelector('.s-item__title--has-tags')) return null

                const titleEl = item.querySelector('.s-item__title')
                const priceEl = item.querySelector('.s-item__price')
                const linkEl = item.querySelector('.s-item__link')
                const imgEl = item.querySelector('.s-item__image-img')

                if (!titleEl || !priceEl || !linkEl) return null

                const title = titleEl.textContent?.trim() || ''
                // Filter out "Shop on eBay" if it sneaks through
                if (title === 'Shop on eBay') return null

                const priceText = priceEl.textContent?.trim() || ''
                const url = linkEl.getAttribute('href') || ''
                const imageUrl = imgEl?.getAttribute('src') || ''

                // Extract ID from URL is safer than class names sometimes
                // format: /itm/1234567890
                const idMatch = url.match(/\/itm\/(\d+)/)
                const listingId = idMatch ? idMatch[1] : null

                if (!listingId) return null

                // Clean price
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))

                return {
                    listingId,
                    title,
                    price,
                    url,
                    imageUrl
                }
            }).filter(item => item !== null)

            if (standardResults.length > 0) return standardResults;

            // Fallback: Try finding links that look like items
            // This captures cases where the class names might differ (e.g. mobile view)
            const fallbackLinks = Array.from(document.querySelectorAll('a[href*="/itm/"]'));
            return fallbackLinks.map(link => {
                const url = link.getAttribute('href') || '';
                const idMatch = url.match(/\/itm\/(\d+)/);
                if (!idMatch) return null;

                // Try to find title/price relative to the link
                // This is a naive heuristic but better than 0 results
                const container = link.closest('li') || link.closest('div');
                const title = container?.innerText.split('\n')[0] || 'Unknown Item';
                const priceText = container?.innerText.match(/\$[\d,.]+/)?.[0] || '0';
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                const imageUrl = container?.querySelector('img')?.getAttribute('src') || '';

                return {
                    listingId: idMatch[1],
                    title: title.substring(0, 100), // Safety cap
                    price: price || 0,
                    url: url,
                    imageUrl: imageUrl
                }
            }).filter(i => {
                if (!i || i.price <= 0) return false;
                // strict junk filter
                const lowerTitle = i.title.toLowerCase();
                if (lowerTitle.includes('shop on ebay')) return false;
                if (i.price === 20.00 && lowerTitle.includes('shop')) return false;
                return true;
            }).slice(0, 10); // Limit fallbacks
        }) as ScraperResult[]

        if (results.length === 0) {
            const bodySnippet = await page.evaluate(() => document.body.innerText.slice(0, 500))
            console.log(`[Scrape Debug] 0 items found. Body snippet: ${bodySnippet}`)
        }

        // Filter negative keywords
        const filteredResults = results.filter(item => {
            if (!item) return false
            const titleLower = item.title.toLowerCase()
            return !negativeKeywords.some(neg => titleLower.includes(neg.toLowerCase()))
        })

        return filteredResults

    } catch (error) {
        console.error('eBay Scraping failed:', error)
        return []
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}

async function scrapeFacebook(keywords: string, maxPrice: number, negativeKeywords: string[] = [], vehicleString?: string): Promise<ScraperResult[]> {
    // MOCK: Real FB scraping requires complex auth/proxy handling.
    // Returning a mock result to demonstrate the UI capability.
    console.log(`[MOCK] Scraping Facebook Marketplace for ${keywords}...`)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    return [
        {
            listingId: 'fb-mock-12345',
            title: `[FB] ${keywords} - Like New`,
            price: maxPrice * 0.8,
            url: 'https://facebook.com/marketplace/item/12345',
            imageUrl: 'https://placehold.co/400x300?text=FB+Item'
        }
    ]
}
