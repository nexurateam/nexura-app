"use client";

import { Card, CardContent } from "../components/ui/card";
import AnimatedBackground from "../components/AnimatedBackground";
import learnIcon from "/learn-icon.png";
import xpRewardIcon from "/xp-reward.png";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { apiRequestV2 } from "../lib/queryClient";
import { Loader2 } from "lucide-react";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  reward: number;
  noOfQuestions: number;
  coverImage?: string;
  profileImage?: string;
  done: boolean;
  createdAt: string;
}

export default function Learn() {
  const { loading: authLoading } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const json = await apiRequestV2("GET", "/api/lesson/get-lessons");
        if (json.lessons) {
          setLessons(json.lessons);
        }
      } catch (err: any) {
        console.error("Error fetching lessons:", err);
        setError(err.message || "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchLessons();
    }
  }, [authLoading]);

  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-6 relative">
      <AnimatedBackground />

      <div className="max-w-4xl mx-auto relative z-10 space-y-12">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">
              Learn
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-4 animate-slide-up delay-100">
            Learn
          </h1>

          <p className="text-sm text-white/50 leading-relaxed animate-slide-up delay-200">
            Educational content and tutorials about Web3, blockchain, and the Intuition ecosystem.
          </p>
        </div>

        {/* Top Card */}
        <Card
          className="rounded-2xl sm:rounded-3xl p-4 sm:p-4 animate-slide-up delay-300"
          style={{
            background: "linear-gradient(135deg, #2A085E 0%, #3D0F8A 100%)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

              <div className="flex-1 space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Explore Learning Hub
                </h2>

                <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                  Access interactive tutorials, video guides, and structured learning paths, build knowledge, track your progress, and earn XP as you complete lessons.
                </p>

                <button>
                  <img
                    src={xpRewardIcon}
                    alt="XP Rewards"
                    className="w-32 sm:w-32 object-contain"
                  />
                </button>
              </div>

              <div className="flex-shrink-0">
                <img
                  src={learnIcon}
                  alt="Learn Icon"
                  className="w-32 sm:w-40 object-contain"
                />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Available Lessons */}
        <div className="space-y-6">

          <div className="flex items-center gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white whitespace-nowrap">
              Available Lessons
            </h2>
            <div className="flex-1 h-[1px] bg-[#FFFFFF33]"></div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : error ? (
            <Card className="rounded-2xl p-6 bg-red-500/10 border-red-500/20">
              <p className="text-red-400 text-center">{error}</p>
            </Card>
          ) : lessons.length === 0 ? (
            <Card className="rounded-2xl p-8 bg-white/5 border-white/10">
              <p className="text-white/60 text-center">No lessons available yet. Check back soon!</p>
            </Card>
          ) : (
            <Card className="rounded-2xl p-8 bg-white/5 border-white/10">
              <p className="text-white/60 text-center">
                Lesson cards are temporarily hidden while the learn experience is being redesigned.
              </p>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
}
