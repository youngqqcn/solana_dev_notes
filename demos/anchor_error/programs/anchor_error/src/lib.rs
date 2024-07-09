use anchor_lang::prelude::*;

declare_id!("2Zgt223CiUBbQY5vw21N5enanw3kSgCd8YP3UYFvGTZP");

#[program]
pub mod anchor_error {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        let my_account = &mut ctx.accounts.my_account;
        my_account.data = data;
        Ok(())
    }

    pub fn set_data(ctx: Context<SetData>, data: MyAccount) -> Result<()> {
        if data.data > 10 {
            return err!(MyError::DataTooLarge);
        }

        ctx.accounts.my_account.set_inner(data);

        Ok(())
    }
}

#[account]
#[derive(Default)]
pub struct MyAccount {
    data: u64,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>,
}

#[error_code]
pub enum MyError {
    #[msg("this is an error, hhhh")]
    DataTooLarge,
}
