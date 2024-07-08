# anchor


- https://www.solanazh.com/course/7-3
install: https://www.anchor-lang.com/docs/installation





```
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

sudo apt-get update && sudo apt-get upgrade && sudo apt-get install -y pkg-config build-essential libudev-dev libssl-dev
```


```
anchor init <new-workspace-name>
```



### high-level overview

> https://www.anchor-lang.com/docs/high-level-overview



- Most importantly, the #[account] attribute sets the owner of that data to the ID (the one we created earlier with declare_id)



- Anchor `Account`
  - https://docs.rs/anchor-lang/latest/anchor_lang/accounts/account/struct.Account.html









