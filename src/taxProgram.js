import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";

// Tax settings
const TAX_PERCENTAGE = 5; // 5% tax on transfers
const TREASURY_WALLET = "YOUR_TREASURY_WALLET_ADDRESS"; // Replace with your treasury wallet address

async function createTaxProgram(connection, payer) {
  // Create the program IDL
  const programId = new PublicKey("YOUR_PROGRAM_ID"); // Replace with your deployed program ID

  const provider = new AnchorProvider(connection, payer, {
    commitment: "confirmed",
  });

  const program = new Program(IDL, programId, provider);
  return program;
}

// Function to calculate and apply tax on transfer
async function transferWithTax(
  connection,
  payer,
  sourceTokenAccount,
  destinationTokenAccount,
  amount,
  decimals
) {
  try {
    // Calculate tax amount
    const taxAmount = Math.floor((amount * TAX_PERCENTAGE) / 100);
    const transferAmount = amount - taxAmount;

    // Get treasury token account
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(TREASURY_WALLET),
      sourceTokenAccount.mint
    );

    // Create transfer instructions
    const transferInstruction = createTransferInstruction(
      sourceTokenAccount.address,
      destinationTokenAccount.address,
      payer.publicKey,
      transferAmount,
      [],
      TOKEN_PROGRAM_ID
    );

    const taxInstruction = createTransferInstruction(
      sourceTokenAccount.address,
      treasuryTokenAccount,
      payer.publicKey,
      taxAmount,
      [],
      TOKEN_PROGRAM_ID
    );

    // Create and send transaction
    const transaction = new Transaction().add(
      transferInstruction,
      taxInstruction
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [
      payer,
    ]);

    console.log("✅ Transfer completed with tax!");
    console.log("📝 Transfer amount:", transferAmount / Math.pow(10, decimals));
    console.log("💰 Tax amount:", taxAmount / Math.pow(10, decimals));
    console.log("🔗 Transaction signature:", signature);

    return signature;
  } catch (error) {
    console.error("❌ Error in transfer with tax:", error);
    throw error;
  }
}

// Example usage
async function main() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Load your wallet
  const walletData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "wallet.json"), "utf8")
  );
  const wallet = Keypair.fromSecretKey(new Uint8Array(walletData.secretKey));

  // Example transfer with tax
  const sourceTokenAccount = "SOURCE_TOKEN_ACCOUNT_ADDRESS";
  const destinationTokenAccount = "DESTINATION_TOKEN_ACCOUNT_ADDRESS";
  const amount = 1000000000; // Amount in smallest units (considering decimals)
  const decimals = 9;

  await transferWithTax(
    connection,
    wallet,
    sourceTokenAccount,
    destinationTokenAccount,
    amount,
    decimals
  );
}

// Program IDL
const IDL = {
  version: "0.1.0",
  name: "token_tax_program",
  instructions: [
    {
      name: "transferWithTax",
      accounts: [
        {
          name: "source",
          isMut: true,
          isSigner: false,
        },
        {
          name: "destination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "treasury",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
        {
          name: "taxPercentage",
          type: "u8",
        },
      ],
    },
  ],
  accounts: [],
  errors: [],
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
