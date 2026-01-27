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
    return items.slice(0, 100)
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
    const MAX_PAGES = 3 // Deep Search

    // Pagination Results Accumulator
    const allItems = new Map<string, ScraperResult>()

    try {
        if (!browser || !browser.isConnected()) {
            console.warn('[Scrape Debug] Browser disconnected or missing. Launching new instance...')
            browser = await getBrowser()
            weLaunchedBrowser = true
        }
        const page = await browser.newPage()

        // Set Viewport
        await page.setViewport({ width: 1920, height: 1080 })

        // OPTIMIZATION: Block images, fonts, css to save memory and prevent crashes
        // await page.setRequestInterception(true)
        // page.on('request', (req: HTTPRequest) => {
        //     const resourceType = req.resourceType()
        //     if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        //         req.abort()
        //     } else {
        //         req.continue()
        //     }
        // })

        // Set User-Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        // Add extra headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        })

        // Pagination Loop
        let currentPage = 1
        while (currentPage <= MAX_PAGES) {
            try {
                const fullKeywords = vehicleString ? `${vehicleString} ${keywords}` : keywords
                const encodedKeywords = encodeURIComponent(fullKeywords)
                // Add _pgn for pagination
                const url = `https://www.ebay.com/sch/i.html?_nkw=${encodedKeywords}&_sacat=0&_udhi=${maxPrice}&_sop=10&rt=nc&_pgn=${currentPage}`

                console.log(`[Scrape Debug] Navigating to Page ${currentPage} (Attempt 1): ${url}`)

                // Robust Navigation with Retry
                let navSuccess = false
                for (let navAttempt = 0; navAttempt < 3; navAttempt++) {
                    try {
                        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
                        navSuccess = true
                        break
                    } catch (navErr: any) {
                        console.warn(`[Scrape Debug] Navigation attempt ${navAttempt + 1} failed: ${navErr.message}`)
                        if (navErr.message.includes('detached') || navErr.message.includes('closed')) {
                            await new Promise(r => setTimeout(r, 2000))
                            continue
                        }
                        break
                    }
                }

                if (!navSuccess) {
                    console.warn(`[Scrape Debug] Failed to navigate to page ${currentPage}. Stopping pagination.`)
                    break
                }

                // Small buffer
                await new Promise(r => setTimeout(r, 3000))

                // Wait for items
                try {
                    await page.waitForSelector('.s-item', { timeout: 15000 })
                } catch (e: any) {
                    console.warn(`[Scrape Debug] Timeout waiting for items on page ${currentPage}.`)
                }

                // Extract items
                const pageResults = await page.evaluate(() => {
                    const items = Array.from(document.querySelectorAll('.s-item'))
                    const standardResults = items.map(item => {
                        if (item.querySelector('.s-item__title--has-tags')) return null

                        const titleEl = item.querySelector('.s-item__title')
                        const priceEl = item.querySelector('.s-item__price')
                        const linkEl = item.querySelector('.s-item__link')
                        const imgEl = item.querySelector('.s-item__image-img')

                        if (!titleEl || !priceEl || !linkEl) return null

                        const title = titleEl.textContent?.trim() || ''
                        if (title === 'Shop on eBay') return null

                        const priceText = priceEl.textContent?.trim() || ''
                        const url = linkEl.getAttribute('href') || ''
                        const idMatch = url.match(/\/itm\/(\d+)/)
                        const listingId = idMatch ? idMatch[1] : null

                        if (!listingId) return null

                        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
                        let finalImageUrl = imgEl?.getAttribute('src') || ''
                        if (!finalImageUrl) finalImageUrl = imgEl?.getAttribute('data-src') || ''

                        if (finalImageUrl.startsWith('/')) finalImageUrl = `https://www.ebay.com${finalImageUrl}`
                        if (!finalImageUrl) finalImageUrl = 'https://placehold.co/400x300?text=No+Image'

                        return {
                            listingId,
                            title,
                            price,
                            url: `https://www.ebay.com/itm/${listingId}`,
                            imageUrl: finalImageUrl
                        }
                    }).filter(item => item !== null) as ScraperResult[]

                    if (standardResults.length > 0) return standardResults;

                    // Fallback: Try finding links that look like items (for different layouts)
                    const fallbackLinks = Array.from(document.querySelectorAll('a[href*="/itm/"]'))
                    return fallbackLinks.map(link => {
                        const url = link.getAttribute('href') || ''
                        const idMatch = url.match(/\/itm\/(\d+)/)
                        if (!idMatch) return null

                        // Try to find title/price relative to the link
                        const container = link.closest('li') || link.closest('div')
                        const title = container?.innerText.split('\n')[0] || 'Unknown Item'
                        const priceText = container?.innerText.match(/\$[\d,.]+/)?.[0] || '0'
                        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
                        const imageUrl = container?.querySelector('img')?.getAttribute('src') || ''

                        return {
                            listingId: idMatch[1],
                            title: title.substring(0, 100),
                            price: price || 0,
                            url,
                            imageUrl
                        }
                    }).filter(i => {
                        if (!i || i.price <= 0) return false
                        const lowerTitle = i.title.toLowerCase()
                        if (lowerTitle.includes('shop on ebay')) return false
                        return true
                    }).slice(0, 10) // Limit fallbacks
                })

                if (pageResults.length === 0) {
                    const pageTitle = await page.title()
                    const bodySnippet = await page.evaluate(() => document.body.innerText.slice(0, 300).replace(/\n/g, ' '))
                    console.warn(`[Scrape Debug] 0 items found on page ${currentPage}. Title: "${pageTitle}" Body: "${bodySnippet}..."`)

                    if (currentPage > 1) break;
                }

                console.log(`[Scrape Debug] Page ${currentPage} found ${pageResults.length} items.`)

                // Deduplicate and Add
                let newOnPage = 0
                for (const item of pageResults) {
                    if (!item) continue
                    if (!allItems.has(item.listingId)) {
                        allItems.set(item.listingId, item)
                        newOnPage++
                    }
                }

                if (newOnPage === 0 && currentPage > 1) {
                    console.log(`[Scrape Debug] No new unique items on page ${currentPage}. Stopping.`)
                    break
                }

                currentPage++
                // Delay between pages
                if (currentPage <= MAX_PAGES) {
                    await new Promise(r => setTimeout(r, Math.random() * 2000 + 1000))
                }

            } catch (pageError: any) {
                console.warn(`[Scrape Debug] Error on page ${currentPage}: ${pageError.message}. Stopping pagination but keeping previous results.`)
                break // Stop pagination loops on critical page error
            }
        }

        const results = Array.from(allItems.values())

        // Filter negative keywords
        const filteredResults = results.filter(item => {
            if (!item) return false
            const titleLower = item.title.toLowerCase()
            return !negativeKeywords.some(neg => titleLower.includes(neg.toLowerCase()))
        })

        return filteredResults

    } catch (error: any) {
        console.error(`eBay Scraping Critical Failure:`, error.message)
        // Recover whatever items we found before the critical crash
        return Array.from(allItems.values())
    } finally {
        if (browser && weLaunchedBrowser) {
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
