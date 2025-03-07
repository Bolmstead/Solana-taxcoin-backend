// Client script to deploy the memecoin (JavaScript version)
const anchor = require("@coral-xyz/anchor");
const {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} = require("@solana/spl-token");
const {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

// Configure connection to devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function main() {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Load the program - use your own IDL path after building the program
  const idl = JSON.parse(fs.readFileSync("./target/idl/memecoin.json", "utf8"));

  // Use the program ID from your anchor build
  const programId = new PublicKey(idl.metadata.address);

  // Create the program interface
  const program = new anchor.Program(idl, programId);

  // Generate a new keypair for the token mint
  const mintKeypair = Keypair.generate();

  // Your wallet is the payer
  const payer = provider.wallet;

  // Tax wallet - this will receive the 5% tax
  const taxWalletKeypair = Keypair.generate();
  console.log("Tax wallet public key:", taxWalletKeypair.publicKey.toString());

  // Memecoin settings
  const name = "YourMemeCoin";
  const symbol = "MEME";
  const decimals = 9; // Standard for most Solana tokens
  const totalSupply = 1_000_000_000 * Math.pow(10, decimals); // 1 billion tokens
  const taxRate = 5; // 5% tax

  console.log("Creating mint...");

  // Create the token mint
  const mint = await createMint(
    connection,
    payer.payer, // Payer
    payer.publicKey, // Mint authority
    payer.publicKey, // Freeze authority (can be null)
    decimals,
    mintKeypair
  );

  console.log("Mint created:", mint.toString());

  // Get the token account of the creator wallet
  const creatorTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer.payer,
    mint,
    payer.publicKey
  );

  console.log("Creator token account:", creatorTokenAccount.address.toString());

  // Get the token account for the tax wallet
  const taxTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer.payer,
    mint,
    taxWalletKeypair.publicKey
  );

  console.log("Tax token account:", taxTokenAccount.address.toString());

  // Initialize the memecoin
  console.log("Initializing memecoin...");

  const memecoinKeypair = Keypair.generate();

  try {
    const tx = await program.methods
      .initialize(
        name,
        symbol,
        decimals,
        new anchor.BN(totalSupply),
        new anchor.BN(taxRate)
      )
      .accounts({
        memecoin: memecoinKeypair.publicKey,
        mint: mint,
        creatorTokenAccount: creatorTokenAccount.address,
        creator: payer.publicKey,
        mintAuthority: payer.publicKey,
        taxWallet: taxWalletKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([memecoinKeypair])
      .rpc();

    console.log("Memecoin initialized successfully!");
    console.log("Transaction signature:", tx);
    console.log("Memecoin account:", memecoinKeypair.publicKey.toString());
    console.log("Mint address:", mint.toString());

    // You now have a memecoin with 5% tax on every transfer
    console.log("Deployment complete!");
    console.log(`Token Name: ${name}`);
    console.log(`Token Symbol: ${symbol}`);
    console.log(`Total Supply: ${totalSupply / Math.pow(10, decimals)}`);
    console.log(`Tax Rate: ${taxRate}%`);
    console.log(`Tax wallet: ${taxWalletKeypair.publicKey.toString()}`);

    // Save key information to a file for later reference
    const deployInfo = {
      programId: programId.toString(),
      mint: mint.toString(),
      memecoinAccount: memecoinKeypair.publicKey.toString(),
      taxWallet: taxWalletKeypair.publicKey.toString(),
      creatorTokenAccount: creatorTokenAccount.address.toString(),
      taxTokenAccount: taxTokenAccount.address.toString(),
    };

    fs.writeFileSync(
      "./deployment-info.json",
      JSON.stringify(deployInfo, null, 2)
    );
    console.log("Deployment information saved to deployment-info.json");
  } catch (error) {
    console.error("Error initializing memecoin:", error);
  }
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
