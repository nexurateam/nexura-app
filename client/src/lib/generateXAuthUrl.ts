import crypto from "crypto"
import cryptoRandomString from "crypto-random-string";

const base64url = (buffer: Buffer) => {
	return buffer
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "")
}

const getAuthUrl = async () => {

	const state: string = cryptoRandomString({ length: 22 });

	const codeVerifier = base64url(crypto.randomBytes(32))
	const CODE_CHALLENGE = base64url(
		crypto.createHash("sha256").update(codeVerifier).digest()
	)

	localStorage.setItem("codeVerifier", codeVerifier);

  return `https://x.com/i/oauth2/authorize?response_type=code&client_id=MVBZNjhPRDI4V2EweDJSX2Z0UDc6MTpjaQ&redirect_uri=https%3A%2F%2Fnexura-app.vercel.app%2Fx%2Fcallback&scope=users.read%20tweet.read&state=${state}&code_challenge=${CODE_CHALLENGE}&code_challenge_method=S256`;
};

export const xAuthUrl = await getAuthUrl();