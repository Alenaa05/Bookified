export const PLANS = {
    FREE: 'free',
    STANDARD: 'standard',
    PRO: 'pro',
} as const;

export type PlanType = typeof PLANS[keyof typeof PLANS];

export const PLAN_LIMITS = {
    [PLANS.FREE]: {
        maxBooks: 5,
        maxDurationMinutes: 10,
    },
    [PLANS.STANDARD]: {
        maxBooks: 20,
        maxDurationMinutes: 60,
    },
    [PLANS.PRO]: {
        maxBooks: 100,
        maxDurationMinutes: 240,
    },
};
