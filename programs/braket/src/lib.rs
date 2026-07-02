//! Braket — Solana program scaffold.
//!
//! Replace this stub with the program logic. The `declare_id!` below is a
//! placeholder that `anchor keys sync` overwrites after the first build.

use anchor_lang::prelude::*;

// Placeholder; replaced by `anchor keys sync` after first build/deploy.
declare_id!("Braket1111111111111111111111111111111111111");

#[program]
pub mod braket {
    use super::*;

    /// Example instruction — remove or replace.
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Braket program initialized");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
