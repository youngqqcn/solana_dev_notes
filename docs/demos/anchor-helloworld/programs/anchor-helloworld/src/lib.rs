// use this import to gain access to common anchor features
use anchor_lang::prelude::*;


// declare an id for your program
declare_id!("FGLLp1QAxymmHSR7yPPRPQmTtojXXtYnYeCosG7fAdJu");


// write your business logic here
#[program]
pub mod anchor_helloworld {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

// validate incoming accounts here
#[derive(Accounts)]
pub struct Initialize {

}
