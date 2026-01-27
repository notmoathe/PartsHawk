import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { ScraperResult } from './types'

// Optional: Load local puppeteer for dev if needed, or rely on core with local chrome path
// We can use a conditional import or just logic.
// For simplicity in this environment, we'll try to detect.
const isProduction = process.env.NODE_ENV === 'production'

// Main entry point
export async function scrape(source: 'ebay' | 'facebook' | 'craigslist', keywords: string, maxPrice: number, negativeKeywords: string[] = []): Promise<ScraperResult[]> {
    if (source === 'ebay') {
        return scrapeEbay(keywords, maxPrice, negativeKeywords)
    }
    if (source === 'facebook') {
        return scrapeFacebook(keywords, maxPrice, negativeKeywords)
    }
    return []
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

async function scrapeEbay(keywords: string, maxPrice: number, negativeKeywords: string[] = []): Promise<ScraperResult[]> {
    let browser = null
    try {
        browser = await getBrowser()
        const page = await browser.newPage()

        // Construct search URL
        // _nkw = keywords
        // _sacat = 0 (all categories)
        // _udhi = max price
        // _sop = 10 (newly listed)
        const encodedKeywords = encodeURIComponent(keywords)
        const url = `https://www.ebay.com/sch/i.html?_nkw=${encodedKeywords}&_sacat=0&_udhi=${maxPrice}&_sop=10&rt=nc`

        await page.goto(url, { waitUntil: 'domcontentloaded' })

        // Extract items
        const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.s-item'))
            return items.map(item => {
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
        })

        // Filter negative keywords
        const filteredResults = results.filter(item => {
            if (!item) return false
            const titleLower = item.title.toLowerCase()
            return !negativeKeywords.some(neg => titleLower.includes(neg.toLowerCase()))
        }) as ScraperResult[]

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

async function scrapeFacebook(keywords: string, maxPrice: number, negativeKeywords: string[] = []): Promise<ScraperResult[]> {
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
