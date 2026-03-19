import { Suspense } from "react";
import ImoveisPageClient from "./ImoveisPageClient";

export default function ImoveisPage() {
  return (
    <Suspense fallback={null}>
      <ImoveisPageClient />
    </Suspense>
  );
}
