import { Suspense } from "react";
import SugestoesPageClient from "./SugestoesPageClient";

export default function SugestoesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="size-10 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
        </div>
      }>
      <SugestoesPageClient />
    </Suspense>
  );
}
