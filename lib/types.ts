export interface Hawk {
    id: string
    user_id: string
    keywords: string
    negative_keywords?: string
    max_price: number
    condition?: string
    source: 'ebay' | 'facebook' | 'craigslist' | 'offerup' | 'car-part'
    region?: string
    status: 'active' | 'paused'
    created_at: string
}

export interface Listing {
    id: string
    title: string
    price: number
    url: string
    image_url?: string
    found_at: string
}

export interface ScraperResult {
    listingId: string
    title: string
    price: number
    url: string
    imageUrl?: string
}
