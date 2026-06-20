"use client";
import { useEffect } from "react";

export default function LandingTracker() {
  useEffect(() => {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "landing_view" }),
    }).catch(() => {});
  }, []);

  return null;
}
