const { Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs");

async function checkBalance() {
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );
  const walletInfo = JSON.parse(fs.readFileSync("wallet.json", "utf8"));
  const publicKey = new PublicKey(walletInfo.publicKey);

  // Check balance 5 times in quick succession

  try {
    const balance = await connection.getBalance(publicKey);
    console.log(`Current balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  } catch (error) {
    console.error("Error checking balance:", error);
  }
  // Small delay just to see the outputs clearly
  await new Promise((resolve) => setTimeout(resolve, 500));
}

checkBalance().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
