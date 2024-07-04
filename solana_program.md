# Solana程序(智能合约)

> https://solana.com/docs/core/programs

- 在solana中“智能合约”被称为“程序”(program)
- 每个程序是一个链上的账户, 该账户存储了可执行的代码(指令)


### 关键点：
- Programs are on-chain accounts that contain executable code. This code is organized into distinct functions known as instructions.

- Programs are stateless but can include instructions to create new accounts, which are used to store and manage program state.

- Programs can be updated by an upgrade authority. A program becomes immutable when the upgrade authority is set to null.

- Verifiable builds enable users to verify that onchain programs match the publicly available source code.


### 编写Solana程序

- Anchor框架(推荐)
  - https://solana.com/developers/guides/getstarted/intro-to-anchor

- Native Rust



### 更新Solana程序

> https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/lib.rs#L675

- 链上程序可以更新, 必须通过`upgrade authority`账号, 这个账号通常是初始程序部署的账号
- 如果`upgrade authority`为空， 那么程序就是不可变的，并且不可升级
