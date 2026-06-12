import { network as buildTimeNetwork, BACKEND_URL } from "./constants";

type Network = "testnet" | "mainnet";

let resolvedNetwork: Network | null = null;

export const getNetwork = (): Network => resolvedNetwork ?? buildTimeNetwork;

export const initNetworkFromServer = async (): Promise<void> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/studio-payment-config`);
    if (!res.ok) return;
    const data = await res.json().catch(() => null);
    if (data?.network === "testnet" || data?.network === "mainnet") {
      resolvedNetwork = data.network;
    }
  } catch {
    // Keep the build-time default on any failure.
  }
};
