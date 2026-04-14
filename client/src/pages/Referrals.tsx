"use client";

import { useEffect, useState } from "react";
import { apiRequestV2 } from "../lib/queryClient";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useAuth } from "../lib/auth";
import { useToast } from "../hooks/use-toast";
import { url } from "../lib/constants";
import { claimReferralReward } from "../lib/performOnchainAction";
import AnimatedBackground from "../components/AnimatedBackground";

type Referral = {
  username: string;
  signedUp: string;
  status: "Active" | "Inactive";
};

const MILESTONES = [
  { tier: 1, target: 10, reward: 1500, label: "Milestone 1" },
  { tier: 2, target: 20, reward: 2000, label: "Milestone 2" },
  { tier: 3, target: 30, reward: 2500, label: "Milestone 3" },
];
const TOTAL_XP = 6000;
const MAX_REFERRALS = 30;

export default function ReferralsPage() {
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<Referral[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      const { usersReferred, refRewardClaimed } = await apiRequestV2("GET", "/api/user/referral-info");
      const active = usersReferred.filter((u: { status: string }) => u.status === "Active").length;
      setReferralData(usersReferred);
      setRewardClaimed(refRewardClaimed);
      setTotalReferrals(usersReferred.length);
      setActiveUsers(active);
    })();
  }, []);

  const referralLink = `${url}/ref/${user ? user.referral.code : "referral-noobmaster"}`;

  const currentMilestoneIdx = MILESTONES.findIndex(m => activeUsers < m.target);
  const allMilestonesComplete = currentMilestoneIdx === -1;
  const milestone = allMilestonesComplete ? MILESTONES[MILESTONES.length - 1] : MILESTONES[currentMilestoneIdx];
  const prevTarget = currentMilestoneIdx > 0 ? MILESTONES[currentMilestoneIdx - 1].target : 0;
  const progressInMilestone = allMilestonesComplete ? 10 : Math.min(activeUsers - prevTarget, 10);
  const progressPercent = (progressInMilestone / 10) * 100;
  const xpEarned = MILESTONES.reduce((sum, m) => activeUsers >= m.target ? sum + m.reward : sum, 0);
  const canClaimCurrent = !allMilestonesComplete && activeUsers >= milestone.target;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    const text = encodeURIComponent(`Join me on Nexura! ${referralLink}`);
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleClaim = async () => {
    try {
      await claimReferralReward(user?._id || "");
      await apiRequestV2("POST", "/api/user/claim-referral-reward");
      setRewardClaimed(true);
      toast({ title: "Success", description: "Referral Reward Claimed" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const displayedReferrals = showAll ? referralData : referralData.slice(0, 7);

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 relative overflow-x-hidden">
      <AnimatedBackground />

      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-8 relative z-10">

        {/* HEADER */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Referrals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Referrals
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Invite your friends to Nexura and you can earn up to {TOTAL_XP.toLocaleString()} XP
          </p>
        </div>

        {/* 3 STEPS */}
        <div className="flex flex-col sm:flex-row justify-between relative items-start gap-6 sm:gap-0">
          {/* Arc connectors */}
          <img
            src="/referral-icons/arc-right.png"
            alt=""
            className="absolute hidden sm:block pointer-events-none"
            style={{ top: 22, left: '19%', width: '17%', transform: 'scaleX(-1)' }}
          />
          <img
            src="/referral-icons/arc-left.png"
            alt=""
            className="absolute hidden sm:block pointer-events-none"
            style={{ top: 22, left: '57%', width: '17%', transform: 'rotate(180deg)' }}
          />

          {/* Step 1: Send an invitation */}
          <div className="flex flex-row sm:flex-col items-center w-full sm:w-[207px] gap-4 sm:gap-5">
            <div className="w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] rounded-full bg-[#0d0719] flex items-center justify-center overflow-hidden shrink-0">
              <img src="/referral-icons/referral-icon.png" alt="" className="w-[44px] h-[44px] sm:w-[60px] sm:h-[60px] object-cover" />
            </div>
            <div className="flex flex-col sm:items-center gap-2 sm:gap-5">
              <p className="text-[18px] sm:text-[24px] font-semibold text-white/70 leading-tight">Send an invitation</p>
              <p className="text-[13px] sm:text-[14px] font-normal text-[#a3adc2] sm:text-center leading-[20px] sm:leading-[23px]">
                Send your referral link to friends and tell them how cool Nexura is!
              </p>
            </div>
          </div>

          {/* Step 2: Registration */}
          <div className="flex flex-row sm:flex-col items-center w-full sm:w-[207px] gap-4 sm:gap-[17px]">
            <div className="w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] rounded-full bg-[#0d0719] flex items-center justify-center overflow-hidden shrink-0">
              <img src="/referral-icons/registration-icon.png" alt="" className="w-[44px] h-[44px] sm:w-[60px] sm:h-[60px] object-cover" />
            </div>
            <div className="flex flex-col sm:items-center gap-2 sm:gap-5">
              <p className="text-[18px] sm:text-[24px] font-semibold text-white/70 leading-tight">Registration</p>
              <p className="text-[13px] sm:text-[14px] font-normal text-[#a3adc2] sm:text-center leading-[20px] sm:leading-[23px]">
                Let them register to our platform using your referral link.
              </p>
            </div>
          </div>

          {/* Step 3: Earn */}
          <div className="flex flex-row sm:flex-col items-center w-full sm:w-[207px] gap-4">
            <div className="w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] rounded-full bg-[#0d0719] flex items-center justify-center overflow-hidden shrink-0">
              <img src="/referral-icons/reward-icon.png" alt="" className="w-[44px] h-[44px] sm:w-[60px] sm:h-[60px] object-cover" />
            </div>
            <div className="flex flex-col sm:items-center gap-2 sm:gap-0">
              <p className="text-[18px] sm:text-[24px] font-semibold text-white/70 leading-tight">Earn</p>
              <p className="text-[13px] sm:text-[14px] font-normal text-[#a3adc2] sm:text-center leading-[20px] sm:leading-[23px] sm:mt-5">
                You can earn up to {TOTAL_XP.toLocaleString()} XP referring your friends after they complete a Quest or Campaign
              </p>
            </div>
          </div>
        </div>

        {/* SHARE REFERRAL LINK */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="whitespace-nowrap text-lg sm:text-2xl font-semibold text-white">
              Share your referral link
            </h2>
            <div className="h-[1px] flex-1 bg-[#FFFFFF33]" />
          </div>
          <p className="text-sm text-white/50 leading-relaxed">
            You can share your referral link by copying and sending it or sharing it on your social media
          </p>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-between glass rounded-2xl h-[48px] sm:h-[57px] flex-1 min-w-0 px-3 sm:px-[27px]">
              <span className="text-[12px] sm:text-[14px] font-semibold text-white/60 truncate">
                {referralLink}
              </span>
              <button
                onClick={handleCopy}
                className="text-[14px] sm:text-[16px] font-bold text-[#8a3ffc] shrink-0 ml-3 sm:ml-4 hover:opacity-80 transition-opacity"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={handleShareX}
              className="w-[48px] h-[48px] sm:w-[57px] sm:h-[57px] rounded-full glass flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          {/* Total Referrals */}
          <div className="glass glass-hover rounded-2xl h-[90px] sm:h-[108px] flex-1 flex items-center justify-between px-5 sm:px-[30px] overflow-hidden">
            <div>
              <p className="text-[14px] sm:text-[18px] font-medium text-[#a3adc2] leading-[23px]">
                Total Referrals
              </p>
              <p className="text-[24px] sm:text-[30px] font-medium text-white leading-[23px] mt-3">
                {totalReferrals}
              </p>
            </div>
            <img
              src="/referral-icons/referral-icon.png"
              alt=""
              className="w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] object-cover shrink-0"
            />
          </div>

          {/* Active */}
          <div className="glass glass-hover rounded-2xl h-[90px] sm:h-[108px] flex-1 flex items-center justify-between px-5 sm:px-[30px] overflow-hidden">
            <div>
              <p className="text-[14px] sm:text-[18px] font-medium text-[#a3adc2] leading-[23px]">
                Active
              </p>
              <p className="text-[24px] sm:text-[30px] font-medium text-white leading-[23px] mt-3">
                {activeUsers}
              </p>
            </div>
            <img
              src="/referral-icons/active-icon.png"
              alt=""
              className="w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] object-cover shrink-0"
            />
          </div>

          {/* XP Earned */}
          <div className="glass glass-hover rounded-2xl h-[90px] sm:h-[108px] flex-1 flex items-center justify-between px-5 sm:px-[30px] overflow-hidden">
            <div>
              <p className="text-[14px] sm:text-[18px] font-medium text-[#a3adc2] leading-[23px]">
                XP Earned
              </p>
              <p className="text-[24px] sm:text-[30px] font-medium text-white leading-[23px] mt-3">
                {xpEarned.toLocaleString()}
              </p>
            </div>
            <img
              src="/nexura-xp.png"
              alt=""
              className="w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] object-contain shrink-0"
            />
          </div>
        </div>

        {/* REFERRAL HISTORY */}
        <div className="glass rounded-2xl overflow-hidden w-full">
          <div className="flex items-center justify-between px-4 sm:px-[23px] py-4 sm:py-5">
            <h3 className="text-[16px] sm:text-[20px] font-semibold text-white leading-[18.2px]">
              Referral History
            </h3>
            {referralData.length > 7 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-[14px] sm:text-[20px] font-semibold text-[#8a3ffc] leading-[18.2px] hover:opacity-80 transition-opacity"
              >
                {showAll ? "Show less" : "View all"}
              </button>
            )}
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto] sm:grid-cols-3 px-4 sm:px-[55px] py-[13px] bg-[#100923] border border-white/[0.16] text-[13px] sm:text-[14px] font-semibold text-white/85 leading-[18.2px]">
            <span>User</span>
            <span className="hidden sm:block text-center">Signed Up</span>
            <span className="text-right">Status</span>
          </div>

          {/* Table Rows */}
          {referralData.length > 0 ? (
            displayedReferrals.map(({ username, signedUp, status }) => (
              <div
                key={username}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-3 items-center bg-[#2a223d] border border-white/[0.2] h-[54px] sm:h-[62px] px-4 sm:px-[23px]"
              >
                <div className="flex items-center gap-2 sm:gap-[13px] min-w-0">
                  <Avatar className="w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] ring-1 ring-black rounded-full shrink-0">
                    <AvatarFallback className="bg-purple-800/60 text-purple-200 text-xs rounded-full">
                      {username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[14px] sm:text-[18px] font-semibold text-white/85 leading-[18.2px] truncate">
                    {username}
                  </span>
                </div>
                <span className="hidden sm:block text-[18px] font-semibold text-white/85 leading-[18.2px] text-center">
                  {signedUp}
                </span>
                <span className="text-[13px] sm:text-[18px] font-semibold text-white/85 leading-[18.2px] text-right">
                  {status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-4 sm:px-6 py-8 text-center text-white/50 bg-[#2a223d]">
              No referrals yet
            </div>
          )}
        </div>

        {/* BOTTOM CARDS */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
          {/* Milestone Progress */}
          <div className="glass glass-hover rounded-2xl flex-1 overflow-hidden p-5 sm:p-[26px] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] sm:text-[20px] font-semibold text-white leading-[18.2px]">
                Milestone Progress
              </h3>
              <div className="bg-white/20 rounded-[6px] px-2 h-[26px] flex items-center justify-center">
                <span className="text-[14px] sm:text-[16px] font-semibold text-white/85 leading-[23px]">
                  {progressInMilestone}/10
                </span>
              </div>
            </div>
            <p className="text-[14px] sm:text-[18px] font-medium text-[#a3adc2] leading-[23px]">
              {allMilestonesComplete ? (
                <span className="font-bold text-[#8a3ffc]">{TOTAL_XP.toLocaleString()} XP Earned</span>
              ) : (
                <>
                  Next Reward:{" "}
                  <span className="font-bold text-[#8a3ffc]">
                    +{milestone.reward.toLocaleString()} XP
                  </span>
                </>
              )}
            </p>
            <div className="h-[20px] bg-white/[0.23] rounded-[6px] overflow-hidden">
              <div
                className="h-full bg-[#8a3ffc] rounded-r-[6px] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[13px] sm:text-[14px] font-normal text-[#a3adc2] leading-[18px]">
              {allMilestonesComplete
                ? "You've completed all referral milestones. Thank you!"
                : `Refer ${10 - progressInMilestone} more friends who complete a quest or campaign to unlock remaining bonus`}
            </p>
            <div className="flex justify-center pt-1">
              <button
                onClick={handleClaim}
                disabled={!canClaimCurrent || rewardClaimed}
                className="border border-[#8a3ffc] rounded-[33px] w-[217px] h-[30px] text-[14px] font-bold text-white leading-[18px] hover:bg-[#8a3ffc]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {allMilestonesComplete && rewardClaimed ? "All Claimed" : rewardClaimed ? "Claimed" : "Claim Reward"}
              </button>
            </div>
          </div>

          {/* Important Rule */}
          <div className="glass glass-hover rounded-2xl flex-1 overflow-hidden p-5 sm:p-[26px]">
            <div className="flex items-center gap-[5px] mb-4">
              <img src="/referral-icons/info-icon.svg" alt="" className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px]" />
              <span className="text-[16px] sm:text-[20px] font-semibold text-white leading-[18.2px]">
                Important Rule
              </span>
            </div>
            <p className="text-[14px] sm:text-[16px] font-medium text-[#a3adc2] leading-[22px] sm:leading-[23px] pl-[41px] sm:pl-[45px]">
              Referrals only count as &ldquo;Active&rdquo; after they{" "}
              <span className="font-bold text-white/85">
                complete their first quest or campaign
              </span>{" "}
              on the platform
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
