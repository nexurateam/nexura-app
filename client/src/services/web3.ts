import { redeem, getMultiVaultAddressFromChainId } from "@0xintuition/sdk";
import { Address, parseEther} from "viem";
import { getWalletClient, getPublicClient } from "../lib/viem";
import chain from "../lib/chain";
import { PROXY_CONTRACT_ABI, PROXY_FEE_CONTRACT } from "../lib/constants";

// --- Deposit / Support or Oppose function ---
export const buyShares = async (amountTrust: string, termId: Address, curveId: bigint) => {
  const walletClient = await getWalletClient();
  const publicClient = getPublicClient();

  await walletClient.switchChain({ id: chain.id });

  const account = walletClient?.account?.address as "0x";

  const { request } = await publicClient.simulateContract({
    address: PROXY_FEE_CONTRACT,
    abi: PROXY_CONTRACT_ABI,
    functionName: "deposit",
    account,
    args: [
      account,
      termId,
      curveId,
      0n,
    ],
    value: parseEther(amountTrust)
  });

  const transactionHash = await walletClient.writeContract(request);

  return transactionHash;
};

// --- Sell / Redeem ---
export const sellShares = async (sharesAmount: string, termId: Address, curveId: bigint) => {
  const walletClient = await getWalletClient();
  const publicClient = getPublicClient();
  
  await walletClient.switchChain({ id: chain.id });

  const address = getMultiVaultAddressFromChainId(walletClient.chain?.id!);

  const { transactionHash } = await redeem(
    { walletClient, publicClient, address },
    [
      walletClient?.account?.address as "0x",
      termId,
      curveId,
      parseEther(sharesAmount),
      0n
    ]
  );

  return transactionHash;
};
