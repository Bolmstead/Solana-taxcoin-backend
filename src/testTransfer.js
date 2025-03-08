const {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} = require("@solana/web3.js");

const {
  TOKEN_2022_PROGRAM_ID,
  createTransferCheckedWithFeeInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getMint,
} = require("@solana/spl-token");

const fs = require("fs");

// Connect to Solana devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Token symbol for display
const TOKEN_SYMBOL = "IPG";

async function testTransfer() {
  try {
    // Load your wallet
    const walletInfo = JSON.parse(fs.readFileSync("wallet.json", "utf8"));
    const secretKey = Uint8Array.from(walletInfo.secretKey);
    const sender = Keypair.fromSecretKey(secretKey);

    // Create a test recipient wallet
    const recipient = Keypair.generate();
    console.log("Test recipient address:", recipient.publicKey.toString());

    // Your token mint address from the previous script
    const mintAddress = "CdPmYR6aDxn2B2aY6rEWs5ZBuM341j7vZJD3UHJ2PJyH"; // Replace with your token mint
    const mint = new PublicKey(mintAddress);

    // Get token accounts for sender and recipient
    const senderTokenAccount = getAssociatedTokenAddressSync(
      mint,
      sender.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const recipientTokenAccount = getAssociatedTokenAddressSync(
      mint,
      recipient.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    // Get mint info to check decimals
    const mintInfo = await getMint(
      connection,
      mint,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    // Amount to transfer (e.g., 100 tokens)
    const transferAmount = BigInt(100) * BigInt(10 ** mintInfo.decimals);

    // Create transaction
    let transaction = new Transaction();

    // Check if recipient token account exists, if not create it
    const recipientAccountInfo = await connection.getAccountInfo(
      recipientTokenAccount
    );
    if (!recipientAccountInfo) {
      console.log("Creating recipient token account...");
      transaction.add(
        createAssociatedTokenAccountInstruction(
          sender.publicKey,
          recipientTokenAccount,
          recipient.publicKey,
          mint,
          TOKEN_2022_PROGRAM_ID
        )
      );
    }

    // Add transfer instruction with fee
    transaction.add(
      createTransferCheckedWithFeeInstruction(
        senderTokenAccount,
        mint,
        recipientTokenAccount,
        sender.publicKey,
        transferAmount,
        mintInfo.decimals,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    // Send transaction
    console.log("Sending transfer...");
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [sender],
      { commitment: "confirmed" }
    );

    console.log("Transfer complete!");
    console.log("Transaction signature:", signature);

    // Get updated account info to show balances
    const senderAccount = await getAccount(
      connection,
      senderTokenAccount,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    const recipientAccount = await getAccount(
      connection,
      recipientTokenAccount,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    console.log("\nFinal Balances:");
    console.log(
      "Sender balance:",
      Number(senderAccount.amount) / 10 ** mintInfo.decimals
    );
    console.log(
      "Recipient balance:",
      Number(recipientAccount.amount) / 10 ** mintInfo.decimals
    );

    // Calculate and show the fee amount
    const feeAmount = (Number(transferAmount) * 5) / 100; // 5% fee
    console.log(
      "\nTransfer fee (5%):",
      feeAmount / 10 ** mintInfo.decimals,
      TOKEN_SYMBOL
    );
  } catch (error) {
    console.error("Error testing transfer:", error);
    throw error;
  }
}

// Run the test
testTransfer()
  .then(() => console.log("Test completed successfully!"))
  .catch((error) => console.error("Test failed:", error));
