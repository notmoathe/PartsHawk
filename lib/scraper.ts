import puppeteer, { HTTPRequest } from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { ScraperResult } from './types'

// Optional: Load local puppeteer for dev if needed, or rely on core with local chrome path
const isProduction = process.env.NODE_ENV === 'production'

// Main entry point
export async function scrape(source: 'ebay' | 'facebook' | 'craigslist', keywords: string, maxPrice: number, negativeKeywords: string[] = [], vehicleString?: string, exactMatch?: boolean, browserInstance?: any): Promise<ScraperResult[]> {
    let items: ScraperResult[] = []

    if (source === 'ebay') {
        items = await scrapeEbay(keywords, maxPrice, negativeKeywords, vehicleString, browserInstance)
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

    // Return more items to ensure we find "new" ones that might be pushed down by sticky listings
    return items.slice(0, 30)
}

export async function getBrowser() {
    if (isProduction) {
        // Vercel / Production configuration
        return puppeteer.launch({
            args: [
                ...chromium.args,
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--no-zygote',
                '--disable-features=site-per-process' // Fixes frame detached issues
            ],
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

async function scrapeEbay(keywords: string, maxPrice: number, negativeKeywords: string[] = [], vehicleString?: string, browserInstance?: any): Promise<ScraperResult[]> {
    let browser = browserInstance
    let weLaunchedBrowser = false
    const MAX_RETRIES = 2

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            if (!browser) {
                browser = await getBrowser()
                weLaunchedBrowser = true
            }
            const page = await browser.newPage()

            // Set Viewport
            await page.setViewport({ width: 1920, height: 1080 })

            // OPTIMIZATION: Block images, fonts, css to save memory and prevent crashes
            await page.setRequestInterception(true)
            page.on('request', (req: HTTPRequest) => {
                const resourceType = req.resourceType()
                if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                    req.abort()
                } else {
                    req.continue()
                }
            })

            // Set User-Agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

            // Add extra headers
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            })

            // Construct search URL
            const fullKeywords = vehicleString ? `${vehicleString} ${keywords}` : keywords
            const encodedKeywords = encodeURIComponent(fullKeywords)
            const url = `https://www.ebay.com/sch/i.html?_nkw=${encodedKeywords}&_sacat=0&_udhi=${maxPrice}&_sop=10&rt=nc`

            console.log(`[Scrape Debug] Navigating to (Attempt ${attempt}): ${url}`)
            // Switch to networkidle2 to ensure redirects/hydration finish
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })

            // Small buffer to allow redirects/frame-loading to settle
            await new Promise(r => setTimeout(r, 5000))

            // Wait for items to likely appear - increased timeout and check for main container
            try {
                await page.waitForSelector('.s-item', { timeout: 15000 })
            } catch (e: any) {
                console.warn(`[Scrape Debug] Timeout/Error waiting for .s-item: ${e.message}. Checking for alternatives...`)
                // Try waiting for the main result list container
                try { await page.waitForSelector('.srp-results', { timeout: 5000 }) } catch (e2) { }
            }

            // Check if we hit a captcha or block
            let pageTitle = 'Unknown'
            for (let i = 0; i < 3; i++) {
                try {
                    pageTitle = await page.title()
                    break;
                } catch (titleErr) {
                    // console.warn('[Scrape Debug] Could not get page title (Frame detached?), retrying...')
                    await new Promise(r => setTimeout(r, 1000))
                }
            }
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
                    const idMatch = url.match(/\/itm\/(\d+)/)
                    const listingId = idMatch ? idMatch[1] : null

                    if (!listingId) return null

                    // Clean price
                    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
                    // Clean Image URL
                    // Even effectively blocked, the <img> tag usually exists with src
                    let finalImageUrl = imgEl?.getAttribute('src') || ''
                    // Fallback: Check for data-src or other lazy load attributes if src is empty/blocked
                    if (!finalImageUrl) finalImageUrl = imgEl?.getAttribute('data-src') || ''

                    if (finalImageUrl.startsWith('/')) finalImageUrl = `https://www.ebay.com${finalImageUrl}`
                    // If still empty, use a placeholder
                    if (!finalImageUrl) finalImageUrl = 'https://placehold.co/400x300?text=No+Image'

                    return {
                        listingId,
                        title,
                        price,
                        url: `https://www.ebay.com/itm/${listingId}`,
                        imageUrl: finalImageUrl
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
                try {
                    const bodySnippet = await page.evaluate(() => document.body.innerText.slice(0, 500))
                    console.log(`[Scrape Debug] 0 items found. Body snippet: ${bodySnippet}`)
                } catch (e) {
                    console.log('[Scrape Debug] 0 items found (and could not read body)')
                }
            }

            // Filter negative keywords
            const filteredResults = results.filter(item => {
                if (!item) return false
                const titleLower = item.title.toLowerCase()
                return !negativeKeywords.some(neg => titleLower.includes(neg.toLowerCase()))
            })

            return filteredResults // SUCCESS

        } catch (error: any) {
            console.error(`eBay Scraping attempt ${attempt} failed:`, error.message)
            if (attempt === MAX_RETRIES) {
                return []
            }
            // Retry delay
            await new Promise(resolve => setTimeout(resolve, 2000))
        } finally {
            if (browser && weLaunchedBrowser) {
                await browser.close()
            }
        }
    }
    return []
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
