'use client';

import { PricingTable } from "@clerk/nextjs";

interface Props {
    firstName: string;
}

export default function SubscriptionClient({ firstName }: Props) {
    return (
        <main className="clerk-subscriptions">
            <div className="w-full max-w-3xl mx-auto text-center mb-10">
                <h1 className="page-title">
                    Hey, {firstName} 👋
                </h1>
                <p className="page-description text-[var(--text-secondary)]">
                    Choose the plan that works best for you.
                </p>
            </div>

            <div className="clerk-pricing-table-wrapper w-full">
                <PricingTable />
            </div>
        </main>
    );
}
