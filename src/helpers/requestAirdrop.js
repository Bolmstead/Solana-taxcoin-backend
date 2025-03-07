import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Keypair,
} from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(
  process.env.HELIUS_DEV_NET_RPC_URL,
  "confirmed"
);

const wallet = new PublicKey("HGVFegegNghXe7J5YyzPhAnBSZZ8YxoQq7ryt8eHesi5");
console.log("Wallet public key:", wallet.toString());

/**
 * Note: the `devnet` and `testnet` clusters are subject to rate limits.
 * it is strongly recommended to use `localnet` and the local test validator
 */
const signature = await connection.requestAirdrop(wallet, LAMPORTS_PER_SOL); // request 1 SOL airdrop

const { blockhash, lastValidBlockHeight } =
  await connection.getLatestBlockhash();

// note: confirming the airdrop transaction is very important to ensure the wallet has
await connection.confirmTransaction({
  blockhash,
  lastValidBlockHeight,
  signature,
});
