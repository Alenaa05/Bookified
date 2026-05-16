import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SubscriptionClient from "./SubscriptionClient";

export const metadata = {
    title: "Subscription – Bookified",
    description: "Manage your Bookified subscription plan.",
};

export default async function SubscriptionPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const user = await currentUser();
    const firstName = user?.firstName || "there";

    return <SubscriptionClient firstName={firstName} />;
}
