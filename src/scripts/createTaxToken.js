// Creating a Solana Memecoin with Transfer Fee
// Based on "Infinite Money Glitch" (IMG) token specifications

// Required dependencies:
// npm install @solana/web3.js @solana/spl-token @solana/spl-token-metadata

const {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
const { TokenMetadata } = require("@metaplex-foundation/mpl-token-metadata");
const fs = require("fs");
const bs58 = require("bs58");

const {
  createInitializeMintInstruction,
  getMintLen,
  ExtensionType,
  createInitializeTransferFeeConfigInstruction,
  getTransferFeeAmount,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMetadataPointerInstruction,
  createInitializeTokenMetadataInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
} = require("@solana/spl-token");
const {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  createRemoveKeyInstruction,
  pack,
} = require("@solana/spl-token-metadata");

const dotenv = require("dotenv");

dotenv.config();

// Connect to Solana devnet
const connection = new Connection(process.env.HELIUS_RPC_URL, "confirmed");

// Token Constants based on the provided token info
const TOKEN_SYMBOL = "asdf";
const TOKEN_URI = "";
const DECIMALS = 6; // Standard for most Solana tokens
const TRANSFER_FEE_BASIS_POINTS = 10000; // 5% transfer fee (500 basis points)
const MAXIMUM_FEE = 1000000000000000000n; // Maximum fee amount

const TAX_WALLET_SECRET_KEY = process.env.TEST_TAX_WALLET_PRIVATE_KEY;
console.log("🚀 ~ TAX_WALLET_SECRET_KEY:", TAX_WALLET_SECRET_KEY);

// Add logging utility for consistent formatting
const log = {
  info: (message, data = "") =>
    console.log(`[INFO] ${message}`, data ? data : ""),
  error: (message, error) => console.error(`[ERROR] ${message}:`, error),
  success: (message) => console.log(`[SUCCESS] ${message}`),
  step: (message) => console.log(`\n[STEP] ${message}\n`),
};

// Add TOKEN_METADATA_PROGRAM_ID constant at the top with other constants
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

// MAIN FUNCTION: Create a memecoin with transfer fee
async function createMemeCoin() {
  log.step("Starting memecoin creation process");
  try {
    // 1. Generate wallet keypair from deployment
    log.info("Generating wallet keypair from secret key");
    if (!TAX_WALLET_SECRET_KEY) {
      throw new Error(
        "TAX_WALLET_SECRET_KEY is not defined in environment variables"
      );
    }
    log.info("Secret key length:", TAX_WALLET_SECRET_KEY.length);
    const privateKeyBytes = bs58.default.decode(TAX_WALLET_SECRET_KEY);
    log.info("Decoded private key length:", privateKeyBytes.length);
    const payer = Keypair.fromSecretKey(privateKeyBytes);
    log.info("Payer public key:", payer.publicKey.toString());
    // Check payer's balance
    const payerBalance = await connection.getBalance(payer.publicKey);
    console.log("🚀 ~ createMemeCoin ~ payerBalance:", payerBalance);
    log.info("Payer balance (SOL):", payerBalance / LAMPORTS_PER_SOL);

    // 2. Generate keypair for the token mint
    log.info("Generating token mint keypair");
    const mintKeypair = Keypair.generate();
    console.log("🚀 ~ createMemeCoin ~ mintKeypair:", mintKeypair);
    const mint = mintKeypair.publicKey;
    log.info("🎉🎉🎉 Token mint address:", mint.toString());

    log.info("Setting up metadata", {
      name: "asdf Pwease asdf",
      symbol: "asdf",
    });
    const metaData = {
      updateAuthority: payer.publicKey,
      mint: mint,
      name: "asdf Pwease asdf",
      symbol: "asdf",
      uri: "process.env.MEME_COIN_IMAGE_URI",
      additionalMetadata: [],
    };
    console.log("🚀 ~ createMemeCoin ~ metaData:", metaData);
    // Size of MetadataExtension 2 bytes for type, 2 bytes for length
    const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
    console.log("🚀 ~ createMemeCoin ~ metadataExtension:", metadataExtension);
    // Size of metadata
    const metadataLen = pack(metaData).length;
    console.log("🚀 ~ createMemeCoin ~ metadataLen:", metadataLen);

    // Size of Mint Account with extensions
    const mintLen = getMintLen([
      ExtensionType.MetadataPointer,
      ExtensionType.TransferFeeConfig,
    ]);

    log.info("Getting minimum balance for rent exemption");
    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataExtension + metadataLen
    );
    log.info("🫸 🫸 Required lamports:", lamports);
    log.step("Creating and building transaction");

    // Calculate rent for mint account
    const mintLamports = await connection.getMinimumBalanceForRentExemption(
      mintLen
    );
    log.info("Required lamports for mint:", mintLamports);

    // Calculate rent for metadata account separately
    const metadataLamports = await connection.getMinimumBalanceForRentExemption(
      metadataExtension + metadataLen
    );
    log.info("Required lamports for metadata:", metadataLamports);

    log.info("Creating mint account");
    const createMintAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    // Create metadata account
    const metadataAccount = Keypair.generate();
    const createMetadataAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: metadataAccount.publicKey,
      space: metadataExtension + metadataLen,
      lamports: metadataLamports,
      programId: TOKEN_METADATA_PROGRAM_ID, // Use metadata program ID instead of token program
    });

    log.info("Initializing transfer fee config", {
      basisPoints: TRANSFER_FEE_BASIS_POINTS,
      maxFee: MAXIMUM_FEE.toString(),
    });
    const initializeTransferFeeConfigInstruction =
      createInitializeTransferFeeConfigInstruction(
        mint,
        payer.publicKey,
        payer.publicKey,
        TRANSFER_FEE_BASIS_POINTS,
        MAXIMUM_FEE,
        TOKEN_2022_PROGRAM_ID
      );

    log.info("Initializing metadata pointer");
    const initializeMetadataPointerInstruction =
      createInitializeMetadataPointerInstruction(
        mint,
        payer.publicKey,
        metadataAccount.publicKey,
        TOKEN_2022_PROGRAM_ID
      );

    log.info("Initializing mint with decimals:", DECIMALS);
    const initializeMintInstruction = createInitializeMintInstruction(
      mint,
      DECIMALS,
      payer.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID
    );

    log.info("Creating metadata initialization instruction");
    const initializeMetadataInstruction = createInitializeInstruction({
      metadata: metadataAccount.publicKey, // Use metadata account address instead of mint
      updateAuthority: payer.publicKey,
      mint: mint,
      mintAuthority: payer.publicKey,
      name: metaData.name,
      symbol: metaData.symbol,
      uri: metaData.uri,
      programId: TOKEN_METADATA_PROGRAM_ID, // Use metadata program ID
      additionalMetadata: [],
    });

    log.info("Creating metadata update field instruction");
    const updateFieldInstruction = createUpdateFieldInstruction({
      programId: TOKEN_METADATA_PROGRAM_ID, // Use metadata program ID
      metadata: metadataAccount.publicKey, // Use metadata account address
      updateAuthority: payer.publicKey,
    });

    log.info("Building final transaction");
    const transaction = new Transaction().add(
      createMintAccountInstruction,
      createMetadataAccountInstruction,
      initializeTransferFeeConfigInstruction,
      initializeMetadataPointerInstruction,
      initializeMintInstruction,
      initializeMetadataInstruction,
      updateFieldInstruction
    );

    log.step("Sending and confirming transaction");
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer, mintKeypair, metadataAccount], // Add metadataAccount to signers
      {
        commitment: "confirmed",
      }
    );
    log.success(`Transaction confirmed with signature: ${txSignature}`);

    log.step("Minting initial token supply");
    const totalSupply = BigInt(1_000_000_000) * BigInt(10 ** DECIMALS);
    await mintTokens(connection, payer, mint, totalSupply);

    const result = {
      mintAddress: mint.toString(),
      walletAddress: payer.publicKey.toString(),
      transferFeeBasisPoints: TRANSFER_FEE_BASIS_POINTS,
      tokenName: TOKEN_NAME,
      tokenSymbol: TOKEN_SYMBOL,
      tokenUri: TOKEN_URI,
    };
    log.success("Token creation completed successfully");
    return result;
  } catch (error) {
    log.error("Failed to create token", error);
    throw error;
  }
}

// Helper function to mint tokens
async function mintTokens(connection, payer, mint, amount) {
  log.step(`Starting token minting process for ${amount.toString()} tokens`);
  try {
    log.info("Getting associated token account address");
    const tokenAccount = getAssociatedTokenAddressSync(
      mint,
      payer.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    log.info("Token account address:", tokenAccount.toString());

    log.info("Checking if token account exists");
    const tokenAccountInfo = await connection.getAccountInfo(tokenAccount);

    let transaction = new Transaction();

    if (!tokenAccountInfo) {
      log.info("Token account does not exist, creating new account");
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          tokenAccount,
          payer.publicKey,
          mint,
          TOKEN_2022_PROGRAM_ID
        )
      );
    } else {
      log.info("Token account already exists");
    }

    log.info("Adding mint instruction for amount:", amount.toString());
    transaction.add(
      createMintToInstruction(
        mint,
        tokenAccount,
        payer.publicKey,
        amount,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    log.info("Sending mint transaction");
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );

    log.success(
      `Minted ${
        amount / BigInt(10 ** DECIMALS)
      } tokens to ${payer.publicKey.toString()}`
    );
    log.success(`Mint transaction signature: ${signature}`);

    return signature;
  } catch (error) {
    log.error("Failed to mint tokens", error);
    throw error;
  }
}

// Execute the creation process
log.step("Starting memecoin creation script");
createMemeCoin()
  .then((result) => {
    log.success("Memecoin created successfully with the following details:");
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    log.error("Failed to create memecoin", error);
    process.exit(1);
  });
