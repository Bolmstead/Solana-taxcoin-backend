import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMintToCheckedInstruction,
  mintToChecked,
  createMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import bs58 from "bs58";
import fs from "fs";
import path from "path";

(async () => {
  console.log("🚀 Starting token creation process...");

  // connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  console.log("📡 Connected to Solana devnet");

  // Read wallet.json
  const walletData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "wallet.json"), "utf8")
  );
  console.log("📂 Loaded wallet data");

  const mainDevWallet = Keypair.fromSecretKey(
    new Uint8Array(walletData.secretKey)
  );

  console.log("👛 Using wallet:", mainDevWallet.publicKey.toString());

  // Generate a new keypair for the token mint
  const mintKeypair = Keypair.generate();
  console.log("🔑 Generated mint keypair:", mintKeypair.publicKey.toString());

  // Token settings
  const decimals = 9; // Standard for most Solana tokens
  const totalSupply = 1_000_000_000 * Math.pow(10, decimals); // 1 billion tokens
  console.log("⚙️ Token settings:");
  console.log("   - Decimals:", decimals);
  console.log(
    "   - Total Supply:",
    totalSupply / Math.pow(10, decimals),
    "tokens"
  );

  try {
    console.log("\n🏗️ Creating mint...");
    // Create the token mint
    const mint = await createMint(
      connection,
      mainDevWallet, // Payer
      mainDevWallet.publicKey, // Mint authority
      mainDevWallet.publicKey, // Freeze authority
      decimals,
      mintKeypair
    );

    console.log("✅ Mint created successfully!");
    console.log("📍 Mint address:", mint.toString());

    console.log("\n🏦 Creating token account...");
    // Get the token account for the creator wallet
    const creatorTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mainDevWallet,
      mint,
      mainDevWallet.publicKey
    );

    console.log("✅ Token account created successfully!");
    console.log(
      "📍 Creator token account:",
      creatorTokenAccount.address.toString()
    );

    // Mint initial supply to the creator
    console.log("\n💰 Minting initial supply...");
    const mintTx = await mintToChecked(
      connection,
      mainDevWallet,
      mint,
      creatorTokenAccount.address,
      mainDevWallet,
      totalSupply,
      decimals
    );

    console.log("✅ Initial supply minted successfully!");
    console.log("🔗 Transaction signature:", mintTx);

    // Save deployment information
    const deployInfo = {
      mint: mint.toString(),
      creatorTokenAccount: creatorTokenAccount.address.toString(),
      decimals: decimals,
      totalSupply: totalSupply,
    };

    fs.writeFileSync("./mint-info.json", JSON.stringify(deployInfo, null, 2));
    console.log("\n💾 Mint information saved to mint-info.json");

    console.log("\n🎉 Token creation completed successfully!");
    console.log("📝 Summary:");
    console.log("   - Mint Address:", mint.toString());
    console.log("   - Token Account:", creatorTokenAccount.address.toString());
    console.log(
      "   - Total Supply:",
      totalSupply / Math.pow(10, decimals),
      "tokens"
    );
    console.log("   - Decimals:", decimals);
  } catch (error) {
    console.error("\n❌ Error creating mint:", error);
    console.error("Stack trace:", error.stack);
  }
})();
