use anchor_lang::prelude::*;

declare_id!("HqtLYMvxUnQmewrWxHuAtLgRhxguH39KYv6ivgjZqvzX");

#[program]
pub mod game {
    use super::*;

    pub fn create_user_stats(ctx: Context<CreateUserStats>, name: String) -> Result<()> {
        let user_stats = &mut ctx.accounts.user_stats;
        user_stats.level = 0;
        if name.as_bytes().len() > 200 {
            return err!(MyError::TooLongName);
        }

        user_stats.name = name;

        // ctx.bumps.user_stats 是由 #[account(seeds, bump)] 进行约束自动生成的
        user_stats.bump = ctx.bumps.user_stats;
        Ok(())
    }

    // handler function (add this next to the create_user_stats function in the game module)
    pub fn change_user_name(ctx: Context<ChangeUserName>, new_name: String) -> Result<()> {
        if new_name.as_bytes().len() > 200 {
            // proper error handling omitted for brevity
            panic!();
        }
        ctx.accounts.user_stats.name = new_name;
        Ok(())
    }
}

#[account]
pub struct UserStats {
    level: u16,
    name: String,
    bump: u8,
}

#[derive(Accounts)]
pub struct CreateUserStats<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer=user,
        space=8 + 2 + 4 + 200 + 1,
        seeds=[b"user-stats", user.key().as_ref()],
        bump
    )]
    pub user_stats: Account<'info, UserStats>,
    pub system_program: Program<'info, System>,
}


// validation struct
#[derive(Accounts)]
pub struct ChangeUserName<'info> {
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"user-stats", user.key().as_ref()], bump = user_stats.bump)]
    pub user_stats: Account<'info, UserStats>,
}


#[error_code]
pub enum MyError {
    #[msg("too long name")]
    TooLongName,
}
