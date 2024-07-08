use anchor_lang::prelude::*;

declare_id!("5jqhLy3fQ5B2ETUVGhJJSJWEzcK5NiVtRh3pfEcndxTi");

#[program]
pub mod note {
    use super::*;

    pub fn create(ctx: Context<Create>, msg: String) -> Result<()> {
        let note = &mut ctx.accounts.note;
        note.message = msg;
        Ok(())
    }
}

#[account]
pub struct Note {
    pub message: String,
}

#[derive(Accounts)]
pub struct Create<'info> {
    // note账户
    #[account(init, payer = user, space = 8 + 32 + 200)]
    pub note: Account<'info, Note>,

    // 下面2个是固定的, 可以改名，但一般不该
    #[account(mut)]
    pub user: Signer<'info>, // 或 authority
    pub system_program: Program<'info, System>,
}
