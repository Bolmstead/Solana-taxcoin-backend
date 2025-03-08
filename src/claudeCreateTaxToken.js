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

// Connect to Solana devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Token Constants based on the provided token info
const TOKEN_NAME = "Infinite Pwease Gwitch";
const TOKEN_SYMBOL = "IPG";
const TOKEN_URI = "";
const DECIMALS = 6; // Standard for most Solana tokens
const TRANSFER_FEE_BASIS_POINTS = 500; // 5% transfer fee (500 basis points)
const MAXIMUM_FEE = 1000000000000000000n; // Maximum fee amount

// MAIN FUNCTION: Create a memecoin with transfer fee
async function createMemeCoin() {
  try {
    // 1. Generate wallet keypair for deployment
    const walletInfo = JSON.parse(fs.readFileSync("wallet.json", "utf8"));
    const secretKey = Uint8Array.from(walletInfo.secretKey);
    const payer = Keypair.fromSecretKey(secretKey);

    // 2. Generate keypair for the token mint
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    console.log("Token mint address:", mint.toString());

    const metaData = {
      updateAuthority: payer.publicKey,
      mint: mint,
      name: "Infinite Pwease Gwitch",
      symbol: "IPG",
      uri: "https://silver-hidden-bandicoot-567.mypinata.cloud/ipfs/bafybeiapgjpfvfjkm43haidwyikdyi23i76e2umpqg6yf5eltexdsdgym4",
      additionalMetadata: [],
    };
    // Size of MetadataExtension 2 bytes for type, 2 bytes for length
    const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
    // Size of metadata
    const metadataLen = pack(metaData).length;

    // Size of Mint Account with extensions
    const mintLen = getMintLen([
      ExtensionType.MetadataPointer,
      ExtensionType.TransferFeeConfig,
    ]);

    // Minimum lamports required for Mint Account
    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataExtension + metadataLen
    );

    // 5. Create account for mint
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    // 6. Initialize transfer fee config
    const initializeTransferFeeConfigInstruction =
      createInitializeTransferFeeConfigInstruction(
        mint,
        payer.publicKey, // transferFeeConfigAuthority
        payer.publicKey, // withdrawWithheldAuthority
        TRANSFER_FEE_BASIS_POINTS,
        MAXIMUM_FEE,
        TOKEN_2022_PROGRAM_ID
      );

    // Initialize metadata pointer
    const initializeMetadataPointerInstruction =
      createInitializeMetadataPointerInstruction(
        mint,
        payer.publicKey, // authority
        mint, // metadata address (using mint address itself)
        TOKEN_2022_PROGRAM_ID
      );

    // 7. Initialize mint
    const initializeMintInstruction = createInitializeMintInstruction(
      mint,
      DECIMALS,
      payer.publicKey, // Mint authority
      null, // Freeze authority (null = no freezing)
      TOKEN_2022_PROGRAM_ID
    );

    const initializeMetadataInstruction = createInitializeInstruction({
      metadata: mint,
      updateAuthority: payer.publicKey,
      mint: mint,
      mintAuthority: payer.publicKey,
      name: metaData.name,
      symbol: metaData.symbol,
      uri: metaData.uri,
      programId: TOKEN_2022_PROGRAM_ID,
      additionalMetadata: [], // Add any additional metadata fields if needed
    });

    const updateFieldInstruction = createUpdateFieldInstruction({
      programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
      metadata: mint, // Account address that holds the metadata
      updateAuthority: payer.publicKey, // Authority that can update the metadata
    });

    // Create and send transaction
    const transaction = new Transaction().add(
      createAccountInstruction,
      initializeTransferFeeConfigInstruction,
      initializeMetadataPointerInstruction,
      initializeMintInstruction,
      initializeMetadataInstruction,
      updateFieldInstruction
    );

    // 9. Send and confirm transaction
    await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer, mintKeypair],
      {
        commitment: "confirmed",
      }
    );

    console.log("Token with transfer fee created successfully!");

    // 10. Optional: Mint tokens to your wallet for testing
    const totalSupply = BigInt(1_000_000_000) * BigInt(10 ** DECIMALS); // 1 billion tokens
    await mintTokens(connection, payer, mint, totalSupply);

    // 11. Return important information
    return {
      mintAddress: mint.toString(),
      walletAddress: payer.publicKey.toString(),
      transferFeeBasisPoints: TRANSFER_FEE_BASIS_POINTS,
      tokenName: TOKEN_NAME,
      tokenSymbol: TOKEN_SYMBOL,
      tokenUri: TOKEN_URI,
    };
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
}

// Helper function to mint tokens
async function mintTokens(connection, payer, mint, amount) {
  try {
    // Create a token account for the payer
    const tokenAccount = getAssociatedTokenAddressSync(
      mint,
      payer.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    // Check if token account exists
    const tokenAccountInfo = await connection.getAccountInfo(tokenAccount);

    let transaction = new Transaction();

    // Create token account if it doesn't exist
    if (!tokenAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          tokenAccount,
          payer.publicKey,
          mint,
          TOKEN_2022_PROGRAM_ID
        )
      );
    }

    // Add mint instruction
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

    // Send and confirm transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );

    console.log(
      `Minted ${
        amount / BigInt(10 ** DECIMALS)
      } tokens to ${payer.publicKey.toString()}`
    );
    console.log(`Transaction signature: ${signature}`);

    return signature;
  } catch (error) {
    console.error("Error minting tokens:", error);
    throw error;
  }
}

// Execute the creation process
createMemeCoin()
  .then((result) => {
    console.log("Memecoin created with the following details:");
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error("Failed to create memecoin:", error);
  });
