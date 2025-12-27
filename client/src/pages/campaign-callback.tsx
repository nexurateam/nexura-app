"use client";

import { useEffect } from "react";
import { useLocation } from "wouter";

export default function CampaignCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      alert("No code returned from Discord.");
      setLocation("/campaigns"); // redirect to campaigns if code is missing
      return;
    }

    // Send the code to your backend
    fetch(`/api/discord/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Successfully joined Discord!");
        } else {
          alert("Failed to join Discord server.");
        }
        setLocation("/campaigns"); // always go back to campaigns page
      })
      .catch((err) => {
        console.error(err);
        alert("Something went wrong.");
        setLocation("/campaigns");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-black">
      <p className="text-lg">Processing Discord join...</p>
    </div>
  );
}
