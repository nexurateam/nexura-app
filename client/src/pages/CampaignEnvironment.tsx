"use client";

import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Play } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { apiRequestV2, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { claimCampaignOnchainReward } from "@/lib/performOnchainAction";

type Quest = {
  _id: string;
  quest: string;
  reward: number;
  link: string;
  done: boolean;
};

const campaignQuestsInitial: Quest[] = [
  { _id: "quest-1", quest: "Follow Nexura on X", reward: 100, link: "https://x.com/NexuraXYZ", done: false },
  { _id: "quest-2", quest: "Join Nexura Discord", reward: 100, link: "https://discord.gg/caK9kATBya", done: false },
  { _id: "quest-3", quest: "Drop a message on Discord", reward: 100, link: "https://discord.gg/caK9kATBya", done: false },
  { _id: "quest-4", quest: "Support or Oppose the #Intuitionbilly Claim on Intuition Portal", reward: 100, link: "#", done: false },
  { _id: "quest-5", quest: "Support or oppose the Nexura claim on Intuition Portal", reward: 100, link: "#", done: false },
  { _id: "quest-6", quest: "Like and Comment on Nexura Pinned post", reward: 100, link: "#", done: false },
];

export default function CampaignEnvironment() {
  const { user } = useAuth();
  const userId = user?._id || "";
  const { campaignId } = useParams();
  const { toast } = useToast();

  const [quests, setQuests] = useState<Quest[]>(campaignQuestsInitial);
  const [visitedQuests, setVisitedQuests] = useState<string[]>(() => {
    const stored = JSON.parse(localStorage.getItem("nexura:campaign:visited") || "{}");
    return stored[userId] || [];
  });
  const [claimedQuests, setClaimedQuests] = useState<string[]>(() => {
    const stored = JSON.parse(localStorage.getItem("nexura:campaign:claimed") || "{}");
    return stored[userId] || [];
  });
  const [campaignCompleted, setCampaignCompleted] = useState<boolean>(() => {
    const stored = JSON.parse(localStorage.getItem("nexura:campaign:completed") || "{}");
    return stored[userId] || false;
  });
  const [discordJoined, setDiscordJoined] = useState<boolean>(() => {
    const stored = JSON.parse(localStorage.getItem("nexura:campaign:discord-joined") || "{}");
    return stored[userId] || false;
  });

  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [campaignNumber, setCampaignNumber] = useState("000");
  const [reward, setReward] = useState<{ trustTokens: number; xp: number }>({ trustTokens: 0, xp: 0 });
  const [campaignAddress, setCampaignAddress] = useState("");

  const [questsCompleted, setQuestsCompleted] = useState(false);

  // Fetch campaign quests
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequestV2("GET", `/api/campaign/quests?id=${campaignId}`);
        setQuests(res.campaignQuests || []);
        setCampaignAddress(res.address || "");
        setDescription(res.description || "");
        setTitle(res.title || "");
        setSubTitle(res.sub_title || "");
        setProjectName(res.project_name || "");
        setCampaignNumber(res.campaignNumber || "000");
        setReward(res.reward || { trustTokens: 0, xp: 0 });
        setQuestsCompleted(res.campaignCompleted?.questsCompleted || false);
      } catch (error: any) {
        console.error(error);
        toast.error({ title: "Error", description: error.message });
      }
    })();
  }, [campaignId]);

  // Sync localStorage for visited, claimed, completed, discordJoined
  useEffect(() => {
    const visited: Record<string, string[]> = JSON.parse(localStorage.getItem("nexura:campaign:visited") || "{}");
    visited[userId] = visitedQuests;
    localStorage.setItem("nexura:campaign:visited", JSON.stringify(visited));
  }, [visitedQuests, userId]);

  useEffect(() => {
    const claimed: Record<string, string[]> = JSON.parse(localStorage.getItem("nexura:campaign:claimed") || "{}");
    claimed[userId] = claimedQuests;
    localStorage.setItem("nexura:campaign:claimed", JSON.stringify(claimed));
  }, [claimedQuests, userId]);

  useEffect(() => {
    const completed: Record<string, boolean> = JSON.parse(localStorage.getItem("nexura:campaign:completed") || "{}");
    completed[userId] = campaignCompleted;
    localStorage.setItem("nexura:campaign:completed", JSON.stringify(completed));
  }, [campaignCompleted, userId]);

  useEffect(() => {
    const joined: Record<string, boolean> = JSON.parse(localStorage.getItem("nexura:campaign:discord-joined") || "{}");
    joined[userId] = discordJoined;
    localStorage.setItem("nexura:campaign:discord-joined", JSON.stringify(joined));
  }, [discordJoined, userId]);

  // Open quest links
  const markQuestAsVisited = (quest: Quest) => {
    if (quest.quest.toLowerCase().includes("join nexura discord")) {
      window.location.href =
        "https://discord.com/oauth2/authorize?client_id=1453410817570766950&response_type=code&redirect_uri=https%3A%2F%2Fnexura-app.vercel.app%2Fcampaign-callback&scope=identify+guilds.join";
      return;
    }

    window.open(quest.link, "_blank");
    if (!visitedQuests.includes(quest._id)) setVisitedQuests([...visitedQuests, quest._id]);
  };

  // Claim quest
  const claimQuest = async (questId: string) => {
    try {
      if (claimedQuests.includes(questId)) return;
      const res = await apiRequest("POST", `/api/quest/perform-campaign-quest`, { id: questId, campaignId });
      if (!res.ok) return;
      setClaimedQuests([...claimedQuests, questId]);
      setQuests((prev) => prev.map((q) => (q._id === questId ? { ...q, done: true } : q)));
    } catch (error: any) {
      console.error(error);
      toast.error({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Claim campaign reward
  const claimCampaignReward = async () => {
    if (!discordJoined) {
      toast.error({ title: "Join Discord", description: "You must join the Discord server first." });
      return;
    }

    try {
      await claimCampaignOnchainReward({ campaignAddress, userId });
      await apiRequestV2("POST", `/api/campaign/complete-campaign?id=${campaignId}`);
      setCampaignCompleted(true);
    } catch (error: any) {
      console.error(error);
      toast.error({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const completedQuestsCount = quests.filter((q) => q.done || claimedQuests.includes(q._id)).length;
  const progressPercentage = Math.round((completedQuestsCount / quests.length) * 100);
  const allQuestsDone = completedQuestsCount === quests.length;

  return (
    <div className="min-h-screen bg-[#0a0615] text-white relative p-4 sm:p-6">
      <AnimatedBackground />
      <div className="max-w-4xl sm:max-w-5xl mx-auto relative z-10 space-y-8 sm:space-y-10">

        {/* Banner with Progress */}
        <div className="w-full bg-gradient-to-r from-purple-700/40 to-purple-900/40 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="uppercase text-[0.6rem] sm:text-xs opacity-60">{title}</p>
              <p className="text-lg sm:text-xl font-semibold">{subTitle}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <p className="text-[0.65rem] sm:text-sm opacity-70 uppercase">Total XP</p>
              <div className="bg-purple-600/30 border border-purple-500/40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-xs sm:text-sm">{reward.xp} XP</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/10 h-2 sm:h-3 rounded-full overflow-hidden mt-2 sm:mt-3">
            <div className="h-2 sm:h-3 bg-purple-600 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
          </div>
          <p className="text-[0.65rem] sm:text-sm opacity-60 mt-1">{progressPercentage}% completed</p>
        </div>

        {/* Main Campaign Card */}
        <Card className="rounded-2xl bg-white/5 border-white/10 overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/3 h-48 sm:h-auto">
              <img src="/campaign.png" alt="Campaign" className="w-full h-full object-cover" />
            </div>
            <div className="p-4 sm:p-6 flex flex-col justify-between w-full sm:w-2/3">
              <div>
                <p className="text-[0.65rem] sm:text-xs opacity-50 uppercase mb-1">{projectName}</p>
                <p className="text-lg sm:text-xl font-bold leading-tight">Campaign {campaignNumber}:<br />{subTitle}</p>
                <div className="mt-3 sm:mt-4">
                  <p className="uppercase text-[0.6rem] sm:text-xs opacity-50">Start Campaign Quest</p>
                  <p className="text-sm sm:text-base opacity-80 leading-relaxed mt-1">{description}</p>
                </div>
                <div className="mt-2 sm:mt-3 space-y-1">
                  <p className="text-[0.6rem] sm:text-xs opacity-50 uppercase">Rewards</p>
                  <p className="text-sm sm:text-base">{reward.trustTokens} TRUST + {reward.xp} XP</p>
                </div>
              </div>

              <Button
                onClick={claimCampaignReward}
                disabled={!allQuestsDone || !discordJoined || campaignCompleted}
                className={`w-full font-semibold rounded-xl py-3 mt-6 ${allQuestsDone && discordJoined && !campaignCompleted ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-gray-600 cursor-not-allowed text-gray-300"}`}
              >
                {campaignCompleted
                  ? "Completed"
                  : !discordJoined
                    ? "Join Discord First"
                    : allQuestsDone
                      ? "Claim Rewards"
                      : "Complete Quests"
                }
              </Button>
            </div>
          </div>
        </Card>

        {/* Quest List */}
        <div className="space-y-4 sm:space-y-6">
          {quests.map((quest) => {
            const visited = visitedQuests.includes(quest._id);
            const claimed = quest.done || claimedQuests.includes(quest._id);
            let buttonText = "Start Quest";
            if (visited) buttonText = "Claim";
            if (claimed) buttonText = "Completed";

            return (
              <div
                key={quest._id}
                className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition gap-3 sm:gap-0"
              >
                <div className="flex items-center gap-3 w-full sm:w-2/3">
                  <div className="w-6 h-6 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-white/10 text-white">
                    {claimed ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Play className="w-4 h-4" />}
                  </div>
                  <span className="text-sm sm:text-base font-medium">{quest.quest}</span>
                </div>
                <button
                  disabled={claimed}
                  onClick={() => (!visited ? markQuestAsVisited(quest) : claimQuest(quest._id))}
                  className={`w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold ${claimed ? "bg-gray-600 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"}`}
                >
                  {buttonText}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
