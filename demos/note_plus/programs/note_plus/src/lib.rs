use anchor_lang::prelude::*;

declare_id!("4yRp5xTJEFrzzSJnsTL3ZcT2i17BV6hMazj2Bpsc8Vx6");

#[program]
pub mod note_plus {
    use super::*;

    pub fn create(ctx: Context<Create>, msg: String) -> Result<()> {
        require!(msg.len() <= 100, MyError::MsgTooLong);
        let note = &mut ctx.accounts.note;
        note.authority = ctx.accounts.user.key(); // 设置owner
        note.msg = msg;
        Ok(())
    }

    pub fn update(ctx: Context<Update>, new_msg: String) -> Result<()> {
        // 检查
        require!(
            ctx.accounts.user.key() == ctx.accounts.note.authority,
            MyError::Unauthorized
        );

        ctx.accounts.note.msg = new_msg;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(
        init,
        payer = user,
        space = 128,

        // 指定note账户
        seeds = [b"note-plus", user.key().as_ref()],
        bump ,
    )]
    pub note: Account<'info, Note>,

    #[account(mut)] // 支付手续费
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(
        mut,
        // 指定note账户
        seeds = [b"note-plus", user.key().as_ref()],
        bump ,
        // has_one=user
    )]
    pub note: Account<'info, Note>,

    #[account(mut)] // 支付手续费
    pub user: Signer<'info>,
}

#[account]
pub struct Note {
    pub msg: String,
    pub authority: Pubkey,
}

#[error_code]
pub enum MyError {
    #[msg("Msg length must be less than 100")]
    MsgTooLong,

    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
}
