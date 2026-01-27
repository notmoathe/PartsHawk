import puppeteer, { Browser, Page, HTTPRequest } from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { ScraperResult } from './types'

const isProduction = process.env.NODE_ENV === 'production'

// ============================================================================
// CONFIGURATION - TUNED FOR VERCEL SERVERLESS (1024MB limit typically)
// ============================================================================
const CONFIG = {
    MAX_PAGES: 3,              // Reduced from 5 - memory constraints
    MAX_RETRIES: 2,            // Reduced retries
    NAVIGATION_TIMEOUT: 30000,
    SELECTOR_TIMEOUT: 10000,
    MIN_DELAY: 2000,           // Increased to look more human
    MAX_DELAY: 5000,
    // User agents - using only very common ones
    USER_AGENTS: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    ]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function randomDelay(min = CONFIG.MIN_DELAY, max = CONFIG.MAX_DELAY): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min
    return new Promise(resolve => setTimeout(resolve, delay))
}

function getRandomUserAgent(): string {
    return CONFIG.USER_AGENTS[Math.floor(Math.random() * CONFIG.USER_AGENTS.length)]
}

function log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [Scraper:${level.toUpperCase()}]`
    console[level](data ? `${prefix} ${message}` : `${prefix} ${message}`, data || '')
}

// ============================================================================
// BROWSER MANAGEMENT - MEMORY OPTIMIZED
// ============================================================================
export async function getBrowser(): Promise<Browser> {
    // CRITICAL: Minimal args for low memory footprint
    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--no-first-run',
        '--no-zygote',
        '--single-process',                        // CRITICAL for serverless
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-component-extensions-with-background-pages',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-domain-reliability',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--safebrowsing-disable-auto-update',
        // Anti-detection
        '--disable-blink-features=AutomationControlled',
        // Memory limits
        '--js-flags=--max-old-space-size=256',     // Limit JS heap
        '--disable-features=site-per-process',
    ]

    if (isProduction) {
        return puppeteer.launch({
            args: [...chromium.args, ...args],
            executablePath: await chromium.executablePath(
                'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
            ),
            headless: true,
        })
    } else {
        const { default: puppeteerLocal } = await import('puppeteer')
        return puppeteerLocal.launch({ headless: true, args })
    }
}

// ============================================================================
// PAGE SETUP - AGGRESSIVE RESOURCE BLOCKING
// ============================================================================
async function setupPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage()

    // Minimal viewport
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 })

    // User agent
    const userAgent = getRandomUserAgent()
    await page.setUserAgent(userAgent)

    // Headers that look like a real browser
    await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
    })

    // AGGRESSIVE request interception - block almost everything
    await page.setRequestInterception(true)
    page.on('request', (request: HTTPRequest) => {
        const resourceType = request.resourceType()
        const url = request.url()

        // ONLY allow document and script (needed for page to work)
        // Block: images, css, fonts, media, websocket, manifest, etc.
        const allowedTypes = ['document', 'script', 'xhr', 'fetch']

        if (!allowedTypes.includes(resourceType)) {
            request.abort()
            return
        }

        // Block known tracking/ad domains
        const blockedPatterns = [
            'google-analytics', 'googletagmanager', 'facebook', 'doubleclick',
            'adsystem', 'adservice', 'analytics', 'tracker', 'beacon',
            'pixel', 'hotjar', 'optimizely', 'segment', 'amplitude',
            'mixpanel', 'fullstory', 'crazyegg', 'clicktale', 'mouseflow',
            'ebay.com/sch/ajax', // eBay AJAX tracking
            'ebay.com/rovr',     // eBay tracking
            'ebaystatic.com/rs/v', // Some eBay static assets we don't need
        ]

        if (blockedPatterns.some(pattern => url.includes(pattern))) {
            request.abort()
            return
        }

        request.continue()
    })

    // Stealth: Override navigator properties
    await page.evaluateOnNewDocument(() => {
        // Hide webdriver
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined })

        // Delete the automation-related properties
        delete (navigator as any).__proto__.webdriver

        // Mock plugins to look like real Chrome
        Object.defineProperty(navigator, 'plugins', {
            get: () => {
                const plugins = [
                    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
                    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                    { name: 'Native Client', filename: 'internal-nacl-plugin' },
                ]
                const pluginArray = Object.create(PluginArray.prototype)
                plugins.forEach((p, i) => {
                    pluginArray[i] = p
                })
                pluginArray.length = plugins.length
                return pluginArray
            }
        })

        // Mock languages
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] })

        // Mock platform
        Object.defineProperty(navigator, 'platform', { get: () => 'Win32' })

        // Mock hardwareConcurrency (common value)
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 })

        // Mock deviceMemory
        Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 })

        // Chrome object
        const chrome = {
            runtime: {},
            loadTimes: function () { },
            csi: function () { },
            app: {}
        }
        Object.defineProperty(window, 'chrome', { get: () => chrome })

        // Override permissions
        const originalQuery = window.navigator.permissions.query
        window.navigator.permissions.query = (parameters: any) =>
            parameters.name === 'notifications'
                ? Promise.resolve({ state: 'prompt' } as PermissionStatus)
                : originalQuery(parameters)

        // WebGL Vendor/Renderer (common Intel values)
        const getParameterProxyHandler = {
            apply: function (target: any, thisArg: any, argumentsList: any[]) {
                const param = argumentsList[0]
                const gl = thisArg
                // UNMASKED_VENDOR_WEBGL
                if (param === 37445) return 'Intel Inc.'
                // UNMASKED_RENDERER_WEBGL
                if (param === 37446) return 'Intel Iris OpenGL Engine'
                return Reflect.apply(target, thisArg, argumentsList)
            }
        }

        try {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
            if (gl) {
                const originalGetParameter = (gl as any).getParameter
                    ; (gl as any).getParameter = new Proxy(originalGetParameter, getParameterProxyHandler)
            }
        } catch (e) { }
    })

    // Disable cache to save memory
    await page.setCacheEnabled(false)

    return page
}

// ============================================================================
// EBAY ITEM EXTRACTION - Simplified and robust
// ============================================================================
const extractItems = () => {
    const results: any[] = []
    const seen = new Set<string>()

    // Primary: .s-item
    document.querySelectorAll('.s-item').forEach(item => {
        try {
            if (item.querySelector('.s-item__title--has-tags')) return

            const titleEl = item.querySelector('.s-item__title')
            const priceEl = item.querySelector('.s-item__price')
            const linkEl = item.querySelector('.s-item__link') as HTMLAnchorElement | null

            if (!titleEl || !priceEl || !linkEl) return

            const title = titleEl.textContent?.trim() || ''
            if (title === 'Shop on eBay' || !title) return

            const href = linkEl.href || ''
            const idMatch = href.match(/\/itm\/(\d+)/)
            if (!idMatch) return

            const listingId = idMatch[1]
            if (seen.has(listingId)) return
            seen.add(listingId)

            const priceText = priceEl.textContent?.trim() || ''
            const priceMatch = priceText.match(/\$[\d,.]+/)
            const price = priceMatch ? parseFloat(priceMatch[0].replace(/[^0-9.]/g, '')) : 0

            if (price <= 0) return

            results.push({
                listingId,
                title: title.substring(0, 200),
                price,
                url: `https://www.ebay.com/itm/${listingId}`,
                imageUrl: 'https://placehold.co/400x300?text=eBay' // Skip images to save bandwidth
            })
        } catch { }
    })

    return results
}

// ============================================================================
// MAIN EBAY SCRAPER - SINGLE PAGE REUSE, MEMORY OPTIMIZED
// ============================================================================
async function scrapeEbay(
    keywords: string,
    maxPrice: number,
    negativeKeywords: string[] = [],
    vehicleString?: string,
    browserInstance?: Browser
): Promise<ScraperResult[]> {
    let browser: Browser | null = browserInstance || null
    let page: Page | null = null
    let ownsBrowser = false
    const allItems = new Map<string, ScraperResult>()
    let consecutiveFailures = 0
    const MAX_CONSECUTIVE_FAILURES = 2

    try {
        // Get or create browser
        if (!browser || !browser.isConnected()) {
            log('info', 'Launching browser')
            browser = await getBrowser()
            ownsBrowser = true
        }

        // Create ONE page and reuse it
        page = await setupPage(browser)

        const fullKeywords = vehicleString ? `${vehicleString} ${keywords}` : keywords
        const encodedKeywords = encodeURIComponent(fullKeywords)

        // Scrape pages
        for (let pageNum = 1; pageNum <= CONFIG.MAX_PAGES; pageNum++) {
            // Check if we've failed too many times in a row (likely blocked)
            if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                log('warn', `${MAX_CONSECUTIVE_FAILURES} consecutive failures, likely blocked. Stopping.`)
                break
            }

            let success = false

            for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
                try {
                    // Check page health - recreate if needed
                    if (!page || page.isClosed()) {
                        log('warn', 'Page closed, recreating')
                        // Force garbage collection opportunity
                        await randomDelay(1000, 2000)
                        page = await setupPage(browser!)
                    }

                    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodedKeywords}&_sacat=0&_udhi=${maxPrice}&_sop=10&rt=nc&_pgn=${pageNum}`
                    log('info', `Page ${pageNum} Attempt ${attempt}: ${url}`)

                    // Navigate with error handling
                    const response = await page.goto(url, {
                        waitUntil: 'domcontentloaded',
                        timeout: CONFIG.NAVIGATION_TIMEOUT
                    })

                    if (!response) {
                        throw new Error('No response')
                    }

                    // Check for block page
                    const pageTitle = await page.title()
                    if (pageTitle.includes('Pardon') || pageTitle.includes('Security')) {
                        log('warn', `BLOCKED: "${pageTitle}" - eBay detected bot`)
                        consecutiveFailures++

                        // Wait longer before retry
                        await randomDelay(5000, 10000)

                        // Close and recreate page with new fingerprint
                        await page.close()
                        page = await setupPage(browser!)
                        continue
                    }

                    // Wait for content
                    try {
                        await page.waitForSelector('.s-item, .srp-results', { timeout: CONFIG.SELECTOR_TIMEOUT })
                    } catch {
                        log('warn', `No items selector found on page ${pageNum}`)
                    }

                    // Small delay to let JS execute
                    await randomDelay(500, 1000)

                    // Extract items
                    const pageResults = await page.evaluate(extractItems)

                    log('info', `Page ${pageNum}: ${pageResults.length} items found`)

                    if (pageResults.length === 0 && pageNum > 1) {
                        log('info', 'No more results, stopping')
                        return Array.from(allItems.values())
                    }

                    // Add to results (with dedup and negative filtering)
                    let newCount = 0
                    for (const item of pageResults) {
                        if (allItems.has(item.listingId)) continue

                        const titleLower = item.title.toLowerCase()
                        if (negativeKeywords.some(nk => titleLower.includes(nk.toLowerCase()))) {
                            continue
                        }

                        allItems.set(item.listingId, item)
                        newCount++
                    }

                    log('info', `Page ${pageNum}: ${newCount} new items (${allItems.size} total)`)

                    // Stop if no new items
                    if (newCount === 0 && pageNum > 1) {
                        log('info', 'No new unique items, stopping')
                        return Array.from(allItems.values())
                    }

                    success = true
                    consecutiveFailures = 0 // Reset on success
                    break

                } catch (error: any) {
                    const errMsg = error.message || 'Unknown error'
                    log('warn', `Page ${pageNum} Attempt ${attempt} error: ${errMsg}`)

                    // Handle specific errors
                    if (errMsg.includes('ERR_INSUFFICIENT_RESOURCES')) {
                        log('error', 'OUT OF MEMORY - stopping scraper')
                        // Return what we have
                        return Array.from(allItems.values())
                    }

                    if (errMsg.includes('detached')) {
                        log('warn', 'Frame detached, recreating page')
                        try { await page?.close() } catch { }
                        page = null
                    }

                    if (attempt < CONFIG.MAX_RETRIES) {
                        await randomDelay(2000, 4000)
                    }
                }
            }

            if (!success) {
                consecutiveFailures++
            }

            // Delay between pages - look more human
            if (pageNum < CONFIG.MAX_PAGES) {
                await randomDelay()
            }
        }

        return Array.from(allItems.values())

    } catch (error: any) {
        log('error', `Critical error: ${error.message}`)
        return Array.from(allItems.values())

    } finally {
        // Cleanup
        try {
            if (page && !page.isClosed()) {
                await page.close()
            }
        } catch { }

        if (browser && ownsBrowser) {
            try {
                await browser.close()
            } catch { }
        }
    }
}

// ============================================================================
// FACEBOOK MARKETPLACE (Still Mock)
// ============================================================================
async function scrapeFacebook(
    keywords: string,
    maxPrice: number,
    negativeKeywords: string[] = [],
    vehicleString?: string
): Promise<ScraperResult[]> {
    log('info', `[MOCK] Facebook Marketplace: ${keywords}`)
    await randomDelay(500, 1000)
    return [{
        listingId: `fb-${Date.now()}`,
        title: `[FB] ${keywords} - Like New`,
        price: Math.round(maxPrice * 0.8),
        url: 'https://facebook.com/marketplace/item/12345',
        imageUrl: 'https://placehold.co/400x300?text=FB+Item',
    }]
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================
export async function scrape(
    source: 'ebay' | 'facebook' | 'craigslist',
    keywords: string,
    maxPrice: number,
    negativeKeywords: string[] = [],
    vehicleString?: string,
    exactMatch?: boolean,
    browserInstance?: Browser
): Promise<ScraperResult[]> {
    log('info', `Scrape start: ${source} "${keywords}" max=$${maxPrice}`)

    let items: ScraperResult[] = []

    try {
        if (source === 'ebay') {
            items = await scrapeEbay(keywords, maxPrice, negativeKeywords, vehicleString, browserInstance)
        } else if (source === 'facebook') {
            items = await scrapeFacebook(keywords, maxPrice, negativeKeywords, vehicleString)
        }

        // Exact match filter
        if (exactMatch && items.length > 0) {
            const kw = keywords.toLowerCase().trim()
            items = items.filter(i => i.title.toLowerCase().includes(kw))
        }

        // Final negative keyword filter (belt & suspenders)
        if (negativeKeywords.length > 0) {
            items = items.filter(i =>
                !negativeKeywords.some(nk => i.title.toLowerCase().includes(nk.toLowerCase()))
            )
        }

        log('info', `Scrape complete: ${items.length} items`)
        return items.slice(0, 100)

    } catch (error: any) {
        log('error', `Scrape failed: ${error.message}`)
        return items
    }
}

export { scrapeEbay, scrapeFacebook }