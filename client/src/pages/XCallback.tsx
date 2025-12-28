"use client";

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequestV2 } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

export default function XCallback() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const codeVerifier = localStorage.getItem("codeVerifier");

    if (!code) {
      alert("No code returned from X.");
      setLocation("/profile/edit"); // redirect to edit profile if code is missing
      return;
    }

    // Send the code to backend
    (async () => {
      try {
        const { user } = await apiRequestV2("GET", `/api/auth/x/callback?code=${code}&codeVerifier=${codeVerifier}`);

        setUser(user);

        toast({ title: "Success", description: "X login successful!" });
        setLocation("/profile/edit")
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to process X login.", variant: "destructive" });
        setLocation("/profile/edit");
      }
    })();

    // fetch(`/api/discord/join`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ code }),
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     if (data.success) {
    //       alert("Successfully joined X!");
    //     } else {
    //       alert("Failed to join X server.");
    //     }
    //     setLocation("/campaigns"); // always go back to campaigns page
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     alert("Something went wrong.");
    //     setLocation("/campaigns");
    //   });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-black">
      <p className="text-lg">Processing X join...</p>
    </div>
  );
}
