"use client";
// Spike R1: one client component, so the page ships React and hydrates like a real product page.
import { useState } from "react";

export function AddToBag() {
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setAdded(true)}
      className="mt-6 rounded bg-[#2F6B4F] px-6 py-3 text-white"
    >
      {added ? "Added to bag" : "Add to bag"}
    </button>
  );
}
