import { PriceDashboard } from "@/ui/prices/components/PriceDashboard";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <PriceDashboard />
    </Suspense>
  );
}
