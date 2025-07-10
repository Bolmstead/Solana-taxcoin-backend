# Tax Memecoin Backend

A Node.js backend application for creating and managing tax memecoins on Solana, with reward tracking capabilities.

## Overview

This backend provides functionality for:

- Creating tax-enabled memecoins on Solana blockchain
- Managing Solana wallets and token operations
- Tracking rewards and token holder snapshots
- Testing token transfers and tax collection

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Solana CLI tools
- npm or pnpm

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/taxcoin

   # Solana Configuration
   SOLANA_NETWORK=devnet
   HELIUS_RPC_URL=your_helius_rpc_url
   HELIUS_DEV_NET_RPC_URL=your_helius_devnet_url
   QUICKNODE_RPC_URL=your_quicknode_url

   # Wallet Configuration
   TEST_TAX_WALLET_PRIVATE_KEY=your_wallet_private_key_base58
   ```

## Running the Application

Start the Express server:

```bash
npm start
```

## Available Scripts

### Solana Operations

- `npm run createWallet` - Generate a new Solana wallet
- `npm run checkBalance` - Check wallet SOL balance
- `npm run requestAirdrop` - Request SOL airdrop (devnet only)
- `npm run createTaxToken` - Create a new tax-enabled memecoin
- `npm run testTransfer` - Test token transfers with tax collection

### Server

- `npm start` - Start the Express server

## API Endpoints

### Info

- `POST /info` - Get system information

_Note: This is a minimal API focused on Solana operations. The primary functionality is through the CLI scripts._

## Tax Token Features

The tax memecoin system includes:

- Configurable tax rate (basis points)
- Automatic tax collection on transfers
- Tax recipient wallet configuration
- SPL Token 2022 compliance
- Metadata support

## Project Structure

```
src/
├── app.js              # Express server
├── controllers/        # API controllers
├── models/            # MongoDB models (rewards, snapshots)
├── routes/            # Express routes
├── helpers/           # Solana wallet utilities
│   ├── createWallet.js
│   ├── checkBalance.js
│   └── requestAirdrop.js
├── scripts/           # Token creation and testing
│   ├── createTaxToken.js
│   └── testTransfer.js
└── programs/          # Anchor programs
    └── token-tax/     # Tax token smart contract
```

## Smart Contract

The backend includes an Anchor program (`programs/token-tax/`) that implements:

- Tax configuration initialization
- Transfer functions with automatic tax collection
- Treasury wallet management

## Development

For development with hot reload:

```bash
npm run dev
```

## Security Notes

- Keep private keys secure and never commit them to version control
- Use environment variables for sensitive configuration
- Test thoroughly on devnet before mainnet deployment
- Ensure proper tax rate configuration (basis points: 500 = 5%)

## License

ISC
