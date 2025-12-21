// Leaderboard.tsx
"use client";

import { useEffect, useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import gold from "/nexura-gold.png";
import silver from "/nexura-silver.png";
import bronze from "/nexura-bronze.png";
import xpIcon from "/nexura-xp.png";

type Entry = {
  id: string;
  username?: string;
  display_name?: string;
  avatar?: string;
  xp: number;
  level: number;
  quests_completed?: number;
  tasks_completed?: number;
};

const MOCK_LEADERBOARD: Entry[] = [
  { id: "1", username: "Rchris", xp: 1500, level: 10, quests_completed: 12, tasks_completed: 30 },
  { id: "2", username: "Nuel", xp: 1200, level: 8, quests_completed: 8, tasks_completed: 25 },
  { id: "3", username: "Unknown", xp: 900, level: 7, quests_completed: 5, tasks_completed: 20 },
  { id: "4", username: "Beardless", xp: 800, level: 6, quests_completed: 4, tasks_completed: 15 },
  { id: "5", username: "Promise", xp: 700, level: 5, quests_completed: 3, tasks_completed: 10 },
  { id: "6", username: "Orion", xp: 600, level: 5, quests_completed: 3, tasks_completed: 9 },
  { id: "7", username: "Shebah", xp: 500, level: 4, quests_completed: 2, tasks_completed: 8 },
  { id: "8", username: "David", xp: 400, level: 3, quests_completed: 1, tasks_completed: 7 },
  { id: "9", username: "Omotola", xp: 300, level: 2, quests_completed: 1, tasks_completed: 5 },
  { id: "10", username: "Fiyin", xp: 200, level: 1, quests_completed: 0, tasks_completed: 3 },
];

export default function Leaderboard() {
  const [list, setList] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setList(MOCK_LEADERBOARD);
      } catch (err: any) {
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
  <div className="min-h-screen bg-black text-white p-6 relative overflow-auto">
    <AnimatedBackground />

    <div className="max-w-4xl mx-auto space-y-6 relative z-10">
<header className="flex items-center justify-between">
  {/* Left side: icon + title */}
  <div className="flex items-center gap-3">
    <img
      src="/nexura-gold.png"
      alt="Leaderboard"
      className="w-10 h-10"
    />
    <h1 className="text-3xl md:text-5xl font-bold">Leaderboard</h1>

  </div>

  {/* Right side: players badge */}
  {!loading && !error && (
    <Badge variant="outline" className="border-white/20 text-white">
      {list.length} Players
    </Badge>
  )}
</header>


{/* ------------------- PODIUM ------------------- */}
{!loading && !error && list.length > 0 && (
  <div className="relative mt-16">
    {/* Background gradient */}
    <div
      className="
        absolute inset-x-0 top-0 h-64
        bg-gradient-to-b
        from-purple-500/20
        via-purple-700/20
        to-black/0
        rounded-3xl
        -z-10
      "
    />

    <div className="flex justify-center items-end gap-6 relative">
      {[1, 0, 2].map((userIndex, idx) => {
        const user = list[userIndex];
        const name = user.display_name || user.username || "Anonymous";
        const xp = user.xp;

        const heights = [130, 200, 110];
        const height = heights[idx];
        const width = idx === 1 ? 180 : 160;
        const topDepth = 26;

        // Visual order: 2 – 1 – 3
        const podiumNumbers = [2, 1, 3];
        const podiumNumber = podiumNumbers[idx];

        const medals = [
          { img: silver, color: "#cfcfcf" },
          { img: gold, color: "#f5c542" },
          { img: bronze, color: "#cd7f32" },
        ];
        const medal = medals[idx];

        const medalWidth = idx === 1 ? 120 : 100;
        const medalHeight = idx === 1 ? 84 : 70;

        const delayOrder = [0.3, 0, 0.6];
        const bounceDelay = `${delayOrder[idx]}s`;

        return (
          <div
            key={user.id}
            className="flex flex-col items-center text-center relative animate-bounce-slow"
            style={{ animationDelay: bounceDelay }}
          >
            {/* Avatar */}
            <Avatar className="w-24 h-24 -translate-y-6 ring-2 ring-white/15">
              <AvatarImage
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(
                    name
                  )}`
                }
              />
              <AvatarFallback className="bg-white/10 text-white font-bold text-2xl">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <h3 className="text-sm font-semibold mt-1">{name}</h3>

            {/* Podium */}
            <svg
              width={width}
              height={height + topDepth + 20}
              viewBox={`0 0 ${width} ${height + topDepth + 20}`}
            >
              <defs>
                <linearGradient id={`material-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(80,50,120,0.85)" />
                  <stop offset="35%" stopColor="rgba(100,70,140,0.85)" />
                  <stop offset="100%" stopColor="rgba(60,30,100,0.85)" />
                </linearGradient>

                <linearGradient id={`inner-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
                  <stop offset="40%" stopColor="rgba(0,0,0,0)" />
                </linearGradient>

                <filter id={`shadow-${idx}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="10" />
                </filter>
              </defs>

              {/* Shadow */}
              <ellipse
                cx={width / 2}
                cy={height + topDepth + 10}
                rx={width / 2 - 10}
                ry="6"
                fill="rgba(0,0,0,0.55)"
                filter={`url(#shadow-${idx})`}
              />

              {/* Top face */}
              <polygon
                points={`16,0 ${width - 16},0 ${width},${topDepth} 0,${topDepth}`}
                fill="rgba(255,255,255,0.22)"
              />

              {/* Front face */}
              <polygon
                points={`0,${topDepth} ${width},${topDepth} ${width},${
                  height + topDepth
                } 0,${height + topDepth}`}
                fill={`url(#material-${idx})`}
              />

              <polygon
                points={`0,${topDepth} ${width},${topDepth} ${width},${
                  height + topDepth
                } 0,${height + topDepth}`}
                fill={`url(#inner-${idx})`}
              />

              {/* Medal */}
              <g
                transform={`translate(${
                  width / 2 - medalWidth / 2
                }, ${topDepth + height / 2 - medalHeight / 2})`}
              >
                <image
                  href={medal.img}
                  width={medalWidth}
                  height={medalHeight}
                />

                {/* Rank badge */}
                <g transform={`translate(${medalWidth / 2 - 18}, -14)`}>
                  <circle
  cx="18"
  cy="18"
  r="18"
  fill={medal.color}
  fillOpacity="0.5"
  stroke="white"
  strokeOpacity="0.7"
  strokeWidth="2"
/>
                  <text
                    x="18"
                    y="24"
                    textAnchor="middle"
                    fontSize="20"
                    fontWeight="900"
                    fill="#111"
                  >
                    {podiumNumber}
                  </text>
                </g>
              </g>

              {/* XP */}
              <foreignObject
                x={width / 2 - 40}
                y={height + topDepth - 28}
                width="80"
                height="26"
              >
                <div className="flex items-center justify-center gap-1 text-sm font-semibold text-white/90">
                  <img src={xpIcon} className="w-5 h-5" />
                  {xp}
                </div>
              </foreignObject>
            </svg>
          </div>
        );
      })}
    </div>
  </div>
)}


{/* ------------------- REMAINING USERS ------------------- */}
{!loading && !error && list.length > 3 && (
  <div className="space-y-3">
    {list.slice(3).map((entry, idx) => {
      const name = entry.display_name || entry.username || "Anonymous";

      const accents = [
        { border: "#8e44ad", text: "#9b59b6", bg: "bg-[#8e44ad]/20" },
        { border: "#2980b9", text: "#3498db", bg: "bg-[#2980b9]/20" },
        { border: "#e84393", text: "#ff79b0", bg: "bg-[#e84393]/20" },
        { border: "#16a085", text: "#1abc9c", bg: "bg-[#16a085]/20" },
      ];

      const accent = accents[idx % accents.length];

      return (
        <Card
          key={entry.id}
          className="p-4 rounded-3xl relative border-2 transition hover:brightness-110"
          style={{
            borderColor: accent.border,
            boxShadow: `0 0 8px ${accent.border}/60, 0 0 16px ${accent.border}/40`, // subtle glow
            background: "linear-gradient(to right, rgba(255,255,255,0.05), rgba(0,0,0,0.4))",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${accent.text} ${accent.bg} border-2`}
                style={{
                  borderColor: accent.border,
                  boxShadow: `0 0 6px ${accent.border}/60, 0 0 12px ${accent.border}/40`, // subtle glow
                }}
              >
                #{idx + 4}
              </div>

              {/* Avatar */}
              <Avatar className="w-12 h-12">
                {entry.avatar ? (
                  <AvatarImage src={entry.avatar} />
                ) : (
                  <AvatarFallback className="bg-white/10 text-white">
                    {name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>

              <div>
                <h3 className="font-semibold text-lg">{name}</h3>
                <div className="text-sm text-white/50">
                  {entry.quests_completed || 0} quests ·{" "}
                  {entry.tasks_completed || 0} campaigns
                </div>
              </div>
            </div>

            {/* XP with logo */}
            <div className="text-right flex flex-col items-end">
              <div className="flex items-center gap-1">
                <img src="/nexura-xp.png" alt="XP" className="w-5 h-5" />
                <span className={`text-xl font-bold ${accent.text}`}>
                  {entry.xp}
                </span>
              </div>
            </div>
          </div>
        </Card>
      );
    })}
  </div>
)}
{/* ------------------- YOUR RANKING FLOATING CARD ------------------- */}
{!loading && !error && list.length > 0 && (() => {
  const currentUserId = "5"; // Example: Promise
  const userIndex = list.findIndex(u => u.id === currentUserId);
  if (userIndex === -1) return null; // user not found

  const user = list[userIndex];
  const name = user.display_name || user.username || "Anonymous";
  const rank = userIndex + 1;

  // Use gold accent for glow
  const accent = { border: "#f5c542", text: "#f5c542", bg: "bg-[#f5c542]/20" };

  return (
<div className="relative w-full max-w-[26rem] mx-auto">
  <Card

className="fixed bottom-6 p-4 rounded-3xl z-50 border-2 w-full  mx-auto left-40 right-50"
style={{
  borderColor: "#f5c542", // gold border
  boxShadow: "0 0 8px #f5c542/60, 0 0 16px #f5c542/40", // subtle glow
  background: "linear-gradient(to right, rgba(255,255,255,0.05), rgba(0,0,0,0.4))",
}}

    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${accent.text} ${accent.bg} border-2`}
            style={{
              borderColor: accent.border,
              boxShadow: `0 0 6px ${accent.border}/60, 0 0 12px ${accent.border}/40`,
            }}
          >
            #{rank}
          </div>

          {/* Avatar */}
          <Avatar className="w-12 h-12">
            {user.avatar ? (
              <AvatarImage src={user.avatar} />
            ) : (
              <AvatarFallback className="bg-white/10 text-white">
                {name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>

          {/* Name + XP */}
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <div className="text-sm text-white/50 flex items-center gap-1 mt-1">
              <img src="/nexura-xp.png" alt="XP" className="w-5 h-5" />
              {user.xp}
            </div>
          </div>
        </div>

        {/* XP on right side */}
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1">
            <img src="/nexura-xp.png" alt="XP" className="w-5 h-5" />
            <span className={`text-xl font-bold ${accent.text}`}>{user.xp}</span>
          </div>
          <div className="text-xs text-white/50">XP</div>
        </div>
      </div>

      {/* Badge */}
      <Badge className="mt-3 bg-gradient-to-r from-purple-700 via-blue-600 to-cyan-500 border-0 text-white text-xs">
        Your Ranking
      </Badge>
    </Card>
    </div>
  );
})()}
      </div>
    </div>
  );
}
