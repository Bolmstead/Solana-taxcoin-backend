const { Keypair } = require("@solana/web3.js");
const fs = require("fs");

// Generate a new keypair
const keypair = Keypair.generate();

// Convert secret key to Array.from for JSON serialization
const wallet = {
  publicKey: keypair.publicKey.toString(),
  secretKey: Array.from(keypair.secretKey), // Convert Uint8Array to regular array
};

const randomNumber = Math.floor(Math.random() * 1000000);

// Save to a file
fs.writeFileSync(`wallet${randomNumber}.json`, JSON.stringify(wallet, null, 2));
console.log("Wallet public key:", wallet.publicKey);
console.log(`Wallet saved to wallet${randomNumber}.json`);
