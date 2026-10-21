import { DashboardSkeleton, PriceDashboard } from "@/ui/prices/components/PriceDashboard";
import { athensToday } from "@/ui/prices/lib/athens-date";
import { connection } from "next/server";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <TodaysPriceDashboard />
    </Suspense>
  );
}

async function TodaysPriceDashboard() {
  await connection();
  return <PriceDashboard today={athensToday()} />;
}
