import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { ScraperResult } from './types'

// Optional: Load local puppeteer for dev if needed, or rely on core with local chrome path
// We can use a conditional import or just logic.
// For simplicity in this environment, we'll try to detect.
const isProduction = process.env.NODE_ENV === 'production'

export async function scrapeEbay(keywords: string, maxPrice: number, negativeKeywords: string[] = []): Promise<ScraperResult[]> {
    let browser = null
    try {
        if (isProduction) {
            // Vercel / Production configuration
            browser = await puppeteer.launch({
                args: chromium.args,
                executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'),
                headless: true,
            })
        } else {
            // Local Development configuration
            // Try to find local chrome or use puppeteer default if we had the full package
            // Since we installed full 'puppeteer' before, we can use its executable path if known,
            // or rely on the user having Chrome installed.
            // A robust way for local dev with puppeteer-core is to use the installed browser.
            // Or we can dynamically import 'puppeteer' (full) if available.

            // For this specific user environment (Windows), let's look for standard Chrome or use the temp_app's path if we can.
            // Actually, since we have 'puppeteer' in package.json, we can use it for local dev.
            // But we must import it.

            // REFACTOR: Dynamic import to avoid bundling full puppeteer in Vercel
            const { default: puppeteerLocal } = await import('puppeteer')
            browser = await puppeteerLocal.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            })
        }

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
                const titleEl = item.querySelector('.s-item__title')
                const priceEl = item.querySelector('.s-item__price')
                const linkEl = item.querySelector('.s-item__link')
                const imgEl = item.querySelector('.s-item__image-img')

                if (!titleEl || !priceEl || !linkEl) return null

                const title = titleEl.textContent?.trim() || ''
                const priceText = priceEl.textContent?.trim() || ''
                const url = linkEl.getAttribute('href') || ''
                const imageUrl = imgEl?.getAttribute('src') || ''

                // Extract ID from URL is safer than class names sometimes
                // format: /itm/1234567890
                const idMatch = url.match(/\/itm\/(\d+)/)
                const listingId = idMatch ? idMatch[1] : ''

                // Clean price
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))

                return {
                    listingId,
                    title,
                    price,
                    url,
                    imageUrl
                }
            }).filter(item => item !== null && item.listingId)
        })

        // Filter negative keywords
        const filteredResults = results.filter(item => {
            if (!item) return false
            const titleLower = item.title.toLowerCase()
            return !negativeKeywords.some(neg => titleLower.includes(neg.toLowerCase()))
        }) as ScraperResult[]

        return filteredResults

    } catch (error) {
        console.error('Scraping failed:', error)
        return []
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}
