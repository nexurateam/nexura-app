
export const network = (import.meta as any).env?.VITE_NETWORK;

export const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL;

export const url = (import.meta as any).env?.VITE_CLIENT_URL || "https://nexura-app.vercel.app";

export const projectId = (import.meta as any).env?.VITE_REOWN_PROJECT_ID;

export const discordAuthUrl =
	(import.meta as any).env?.VITE_ENV === "development"
		? "https://discord.com/oauth2/authorize" + "?client_id=" + (import.meta as any).env?.VITE_DISCORD_CLIENT_ID + "&redirect_uri=" + encodeURIComponent("http://localhost:5600/api/auth/discord/callback") + "&response_type=code" + "&scope=identify"
		: "https://discord.com/oauth2/authorize" + "?client_id=" + (import.meta as any).env?.VITE_DISCORD_CLIENT_ID + "&redirect_uri=" + encodeURIComponent("https://api-nexura.intuition.box/api/auth/discord/callback") + "&response_type=code" + "&scope=identify";

export const VITE_X_CLIENT_ID = (import.meta as any).env?.VITE_X_CLIENT_ID;

export const NEXONS: Record<number, { address: `0x${string}`, metadata: string }> = {
	1: {
		address: "0x2ed45F846c812cCFdD2DfEcBA342fC717E3Fe093",
		metadata: "ipfs://QmZ1pPLF9m6yGVQMETScwfAKm2ibpt4aZThuv1Dh8NaCCJ"
	},
	2: {
		address: "0xA762b1a7D236191E9656EE8d121171f501bA1CdC",
		metadata: "ipfs://QmcPL2Wvcwn4qWpKgkyyywnYnDATUSa41cnGDsKkLTuBHW"
	},
	3: {
		address: "0xDB2f9756577ECfBcdf55C50Ac5BD71Cdb8c0B086",
		metadata: "ipfs://QmPU499cvPM7SSvE6QY73sJxfRpog9NrsBd14yW11C5Tm9"
	},
	4: {
		address: "0xe1f25b80272BBed9E96E0E2e4Bd21a4cc0EbdBc0",
		metadata: "ipfs://QmRedJkCoFPkcdYdoNJvDc1ydHRVZRJNrc4FKXkUqekm67"
	},
	5: {
		address: "0x75343f041d3ac489a6E8757afD439d9D795b9dED",
		metadata: "ipfs://QmScYrEhTjNzcERwUSXmX66cDCfD3yna8fdiUnLTk8DHEa"
	},
	6: {
		address: "0x9AcF51aE75387A81E18F3174b9eA7f21C3634B61",
		metadata: "ipfs://QmdBrFHCsyxnwEFSuCVTe7tb1dAxxSk9bjNBEodBAs6Cnm"
	},
	7: {
		address: "0x63AF87fE89348A0133c29BaEbD71055e0ee05c17",
		metadata: "ipfs://QmbmiT1e4Sxf6AJhe3nEBqW6wSqA1UqQRn4Pg92ymiiGNS"
	},
	8: {
		address: "0x583548cD0b65595079Fa00CBe113b1230e48a92c",
		metadata: "ipfs://Qma7hUkq8JmHLPhL12XAzMyYGovnsa34qoag9iXRtuCKnG"
	},
	9: {
		address: "0x7b0913C391fbc21cA7995535B00b69060fc590BE",
		metadata: "ipfs://QmNrEQ53aobVuo9nRFJ1CBzzFdkC1QuUXkv7gSAP2RQbGr"
	},
	10: {
		address: "0xF42ebE5136bCBD244c664c5A1eEC3012A293917F",
		metadata: "ipfs://QmUdsL5f2v6E5iJRupdJBC7qzxHyvdV7qmMkCeTdg7k3As"
	}
};
