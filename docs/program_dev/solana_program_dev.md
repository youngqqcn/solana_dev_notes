# program开发



### Hello world!

> https://solana.com/developers/guides/getstarted/hello-world-in-your-browser

https://explorer.solana.com/tx/65AGdio7aeK47h9HjAvnR7ap8dFepm3Sp3MJcFvPfuSnXWHJgQBENtxe5xijEk1uLy8bRw31fyjyXZvoBEEQzMGW?cluster=devnet


https://explorer.solana.com/tx/5mX3oxvHZAXbYfnpjwDgEXJLTEgYXNrpKvhKufkVqay7Js3qbgaDu2P3ESWiQE5YjjaLGUur2PAJ4pzLPxzW1aUL?cluster=devnet


```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};

// declare and export the program's entrypoint
entrypoint!(process_instruction);

// program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    // log a message to the blockchain
    msg!("Hello, world!");

    // gracefully exit the program
    Ok(())
}

```


```ts
// create an empty transaction
const transaction = new web3.Transaction();

// add a hello world program instruction to the transaction
transaction.add(
  new web3.TransactionInstruction({
    keys: [],
    programId: new web3.PublicKey(pg.PROGRAM_ID),
  }),
);

// send the transaction to the Solana cluster
console.log("Sending transaction...");
const txHash = await web3.sendAndConfirmTransaction(
  pg.connection,
  transaction,
  [pg.wallet.keypair],
);
console.log("Transaction sent with hash:", txHash);
```


### 搭建本地开发环境
> https://solana.com/developers/guides/getstarted/setup-local-development


- 安装Anchor
  - avm:  Anchor Version Manager

    ```
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

    # 安装最新版
    avm install latest

    # 使用最新版
    avm use latest

    # check the version

    anchor --version
    ```


- Setup a localhost blockchain cluster

```
solana-test-validator --help

# setup localhost blockchain
solana-test-validator


# swith to localhost
solana config set --url localhost

solana config get

# set default wallet
solana config set -k ~/.config/solana/id.json

# get the airdrop from localhost blockchain
solana airdrop 2

# get balance
solana balance
```









