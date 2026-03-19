"use client";

import { Suspense } from "react";
import { BottomNavContent } from "./bottom-nav-content";

export function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavContent />
    </Suspense>
  );
}
