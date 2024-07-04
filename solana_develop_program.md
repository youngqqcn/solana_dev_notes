# Program Develop

> https://solana.com/docs/programs/lang-rust

- 链上的Rust程序只支持 `libstd`, `libcore`, and `liballoc`, 以及第三方库
- 只能单线程，必须是确定性
- 不能访问:
  - rand
  - std::fs
  - std::net
  - std::future
  - std::process
  - std::sync
  - std::task
  - std::thread
  - std::time
- Limited access to:
  - std::hash
  - std::os