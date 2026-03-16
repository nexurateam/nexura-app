import chain from "./chain";
import { getWalletClient, getPublicClient} from "./viem";
import { network, NEXONS, NEXONS_ABI, REWARD_ABI, REWARD_BYTECODE, AUTHORIZED_ADDRESS } from "./constants";
import { ethers } from "ethers";
import { parseAbi, type Address, parseEther } from "viem";
import { getIntuitionNetworkParams } from "./utils";
import { buildUrl } from "./queryClient";

const STUDIO_FEE_ABI = [
  "function payFee() external payable",
  "error AlreadyCreatedSixCampaigns()",
  "error SendTheRequiredFeeAmount(uint fee)",
];

type StudioPaymentConfig = {
  network?: string;
  contractAddress?: string;
  chainId: string;
  amount: string;
};

const mainnet = network === "mainnet";

const chainId = mainnet ? "0x483" : "0x350b";

const requireContractAddress = (address: string | undefined, label: string, networkLabel = network ?? "the current") => {
  const normalized = address?.trim();

  if (!normalized) {
    throw new Error(`${label} is not configured for ${networkLabel} network.`);
  }

  if (!ethers.isAddress(normalized)) {
    throw new Error(`${label} is invalid: ${normalized}`);
  }

  return normalized;
};

const getStudioPaymentConfig = async (): Promise<StudioPaymentConfig> => {
  const response = await fetch(buildUrl("/api/studio-payment-config"));

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new Error(json?.error || "Unable to load studio payment configuration.");
  }

  return response.json();
};

const ensureSwitch = async (targetChainId: string) => {
  // Fast path: switch if chain is already in wallet
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainId }]
    });
    return;
  } catch (err: any) {
    if (err.code === 4001) throw err; // user rejected — bubble up
    // Any other error → try adding the chain
  }

  // Add (+ auto-switch) for wallets that don't know the chain yet
  const params = getIntuitionNetworkParams(false, targetChainId);
  await (window as any).ethereum.request({ method: "wallet_addEthereumChain", params });
};

export const payStudioHubFee = async (): Promise<string> => {
  try {
    if (!window.ethereum) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");
    const config = await getStudioPaymentConfig();
    const studioFeeContract = requireContractAddress(config.contractAddress, "Studio fee contract", config.network ?? "the server");

    await ensureSwitch(config.chainId);

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      studioFeeContract,
      STUDIO_FEE_ABI,
      signer
    );

    const tx = await contract.payFee({ value: parseEther(config.amount) });

    await tx.wait();

    return tx.hash as string;
  } catch (error: any) {
    if (error.data) {
      const iface = new ethers.Interface(STUDIO_FEE_ABI);
      const decoded = iface.parseError(error.data);

      throw new Error(decoded?.name); // e.g. AlreadyCreatedSixCampaigns, SendTheRequiredFeeAmount
    }

    console.error(error);
    throw new Error(error.message ?? "Payment failed.");
  }
};

interface IrewardContract {
  nameOfCampaign: string;
  totalRewards: number;
  rewardToken: number;
  startDate: number;
}

export const createRewardsContract = async ({ nameOfCampaign, totalRewards, rewardToken, startDate }: IrewardContract) => {
  try {
    const walletClient = await getWalletClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");

    await ensureSwitch(chainId);

    const [account] = await walletClient.getAddresses();

    await walletClient.deployContract({
      abi: REWARD_ABI,
      bytecode: REWARD_BYTECODE,
      args: [nameOfCampaign, totalRewards, rewardToken, AUTHORIZED_ADDRESS, startDate],
      account,
      chain,
      value: parseEther(totalRewards.toString())
    });
  } catch (error: any) {
    if (error.data) {
      const iface = new ethers.Interface(REWARD_ABI);
      const decoded = iface.parseError(error.data);

      throw new Error(decoded?.name);
    }

    console.error(error);
    throw new Error(error.message);
  }
}

export const updateRewardStartTime = async (contractAddress: string, newDate: number) => {
  try {
    const walletClient = await getWalletClient();
    const publicClient = getPublicClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");

    await ensureSwitch(chainId);

    const [account] = await walletClient.getAddresses();

    const { request } = await publicClient.simulateContract({
      abi: REWARD_ABI,
      address: contractAddress as "0x",
      functionName: "updateDate",
      args: [newDate],
      chain,
      account
    });

    await walletClient.writeContract(request);
  } catch (error: any) {
    if (error.data) {
      const iface = new ethers.Interface(REWARD_ABI);
      const decoded = iface.parseError(error.data);

      throw new Error(decoded?.name); // e.g. AlreadyClaimed, CompleteCampaignToClaimRewards
    }

    console.error(error);
    throw new Error(error.message);
  }
}

export const addReward = async (contractAddress: string, rewardsToAdd: number) => {
  try {
    const walletClient = await getWalletClient();
    const publicClient = getPublicClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");

    await ensureSwitch(chainId);

    const [account] = await walletClient.getAddresses();

    const { request } = await publicClient.simulateContract({
      abi: REWARD_ABI,
      address: contractAddress as "0x",
      functionName: "addReward",
      args: [rewardsToAdd],
      chain,
      account,
      value: parseEther(rewardsToAdd.toString())
    });

    await walletClient.writeContract(request);
  } catch (error: any) {
    if (error.data) {
      const iface = new ethers.Interface(REWARD_ABI);
      const decoded = iface.parseError(error.data);

      throw new Error(decoded?.name);
    }

    console.error(error);
    throw new Error(error.message);
  }
}

export const claimCampaignOnchainReward = async ({ campaignAddress, userId }: { campaignAddress: string, userId: string }) => {
  try {
    const walletClient = await getWalletClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");
    const validatedCampaignAddress = requireContractAddress(campaignAddress, "Campaign contract");

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }]
    });

    const provider = new ethers.BrowserProvider((window as any).ethereum);

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      validatedCampaignAddress,
      REWARD_ABI,
      signer
    );

    const tx = await contract.claimReward(userId);

    await tx.wait();

    return tx.hash;
  } catch (error: any) {
    if (error.code === 4902) {
      throw new Error("Kindly click the Intuition Mainnet button on the navbar, to add the intuition mainnet network and switch")
    }

    if (error.data) {
      const iface = new ethers.Interface(REWARD_ABI);
      const decoded = iface.parseError(error.data);

      throw new Error(decoded?.name); // e.g. AlreadyClaimed, CompleteCampaignToClaimRewards
    }

    console.error(error);
    throw new Error(error.message);
  }
}

export const claimReferralReward = async (userId: string) => {
  try {
    const walletClient = await getWalletClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");

    const mainnet = network === "mainnet";

    await walletClient.switchChain({ id: mainnet ? 1155 : 13579 });

    const account = await walletClient.getAddresses();

    await walletClient.writeContract({
      address: (mainnet ? "0xa13442fA08Cf107580098d3D1eD858450eeeEeEa" : "0x55F8DbC90946976A234103ed7B7E6e3CeC1A9Af3") as Address,
      abi: parseAbi(["function claimReferralReward(string memory userId)"]),
      functionName: "claimReferralReward",
      args: [userId],
      account: account[0],
      chain
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
}

export const mintNexon = async (level: number, userId: string) => {
  try {
    const walletClient = await getWalletClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");

    const mainnet = network === "mainnet";

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: mainnet ? "0x483" : "0x350b" }]
    });

    const { address, metadata } = NEXONS[level];

    const provider = new ethers.BrowserProvider((window as any).ethereum);

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      address,
      NEXONS_ABI,
      signer
    );

    const tx = await contract.mint(
      metadata,
      userId
    );

    await tx.wait();

    return tx.hash;
  } catch (error: any) {
    if (error.code === 4902) {
      throw new Error("Kindly click the Intuition Mainnet button on the navbar, to add the intuition mainnet network and switch")
    }

    if (error.data) {
      const iface = new ethers.Interface(NEXONS_ABI);
      const decoded = iface.parseError(error.data);

      throw new Error(decoded?.name); // e.g. AlreadyMinted, NotAllowedToMint
    }

    console.error(error);
    throw new Error(error.message);
  }
};
