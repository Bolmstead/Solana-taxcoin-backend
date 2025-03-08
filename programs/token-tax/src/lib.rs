use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("YOUR_PROGRAM_ID"); // Replace with your program ID

#[program]
pub mod token_tax {
    use super::*;

    pub fn initialize_tax_config(
        ctx: Context<InitializeTaxConfig>,
        tax_percentage: u8,
        treasury_wallet: Pubkey,
    ) -> Result<()> {
        let tax_config = &mut ctx.accounts.tax_config;
        tax_config.authority = ctx.accounts.authority.key();
        tax_config.tax_percentage = tax_percentage;
        tax_config.treasury_wallet = treasury_wallet;
        tax_config.token_mint = ctx.accounts.token_mint.key();
        Ok(())
    }

    pub fn transfer_with_tax(
        ctx: Context<TransferWithTax>,
        amount: u64,
    ) -> Result<()> {
        let tax_config = &ctx.accounts.tax_config;
        
        // Calculate tax amount
        let tax_amount = (amount * tax_config.tax_percentage as u64) / 100;
        let transfer_amount = amount - tax_amount;

        // Transfer main amount
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.source.to_account_info(),
                to: ctx.accounts.destination.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, transfer_amount)?;

        // Transfer tax amount to treasury
        let tax_transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.source.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            },
        );
        token::transfer(tax_transfer_ctx, tax_amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeTaxConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + TaxConfig::LEN,
    )]
    pub tax_config: Account<'info, TaxConfig>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_mint: Account<'info, token::Mint>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TransferWithTax<'info> {
    #[account(mut)]
    pub tax_config: Account<'info, TaxConfig>,
    
    #[account(mut)]
    pub source: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub treasury: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct TaxConfig {
    pub authority: Pubkey,
    pub tax_percentage: u8,
    pub treasury_wallet: Pubkey,
    pub token_mint: Pubkey,
}

impl TaxConfig {
    pub const LEN: usize = 32 + 1 + 32 + 32; // pubkey + u8 + pubkey + pubkey
} 