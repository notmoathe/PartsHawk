export type SubscriptionTier = 'street' | 'club' | 'owner'

interface TierLimits {
    maxHawks: number
    allowedSources: string[]
    scanIntervalMinutes: number
}

const OWNER_EMAIL = 'moathebackup@gmail.com'

export const TIERS: Record<SubscriptionTier, TierLimits> = {
    street: {
        maxHawks: 1,
        allowedSources: ['ebay'],
        scanIntervalMinutes: 15,
    },
    club: {
        maxHawks: 10,
        allowedSources: ['ebay', 'facebook'],
        scanIntervalMinutes: 5,
    },
    owner: {
        maxHawks: 9999,
        allowedSources: ['ebay', 'facebook', 'forums', 'craigslist'],
        scanIntervalMinutes: 1,
    },
}

export function getUserTier(email: string | undefined): SubscriptionTier {
    if (email === OWNER_EMAIL) {
        return 'owner'
    }
    // TODO: Check database for actual subscription status once payments are integrated
    // For now, everyone else is on the free tier
    return 'street'
}

export function getTierLimits(tier: SubscriptionTier): TierLimits {
    return TIERS[tier]
}

export function canCreateHawk(tier: SubscriptionTier, currentCount: number): boolean {
    return currentCount < TIERS[tier].maxHawks
}

export function isSourceAllowed(tier: SubscriptionTier, source: string): boolean {
    return TIERS[tier].allowedSources.includes(source)
}
