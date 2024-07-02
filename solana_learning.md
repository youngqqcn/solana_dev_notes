# Solana开发学习

> https://solanazh.com


## Solana核心概念

> https://www.solanazh.com/course/1-2

- Account:
  - 在Solana中，"Everythin is an Account" 类似Linux世界里面把所有的资源都抽象成"文件"一样。

    ```rust
    pub struct Account {
        /// 账户余额
        /// lamports in the account
        pub lamports: u64,


        // 合约数据
        /// data held in this account
        #[serde(with = "serde_bytes")]
        pub data: Vec<u8>,

        // 所有者
        /// the program that owns this account. If executable, the program that loads this account.
        pub owner: Pubkey,

        // 是否可执行
        /// this account's data contains a loaded program (and is now read-only)
        pub executable: bool,


        /// the epoch at which this account will next owe rent
        pub rent_epoch: Epoch,
    }
    ```

- 账户和签名:
  - Solana的签名系统使用的是 Ed25519
    - 公钥 ---Base58---> 地址

- 交易: 是对多个交易指令的打包，所以起内容主要就是各个交易指令，以及相应指令对应的发起人和签名。

  ```rust
  pub struct Message {
        /// The message header, identifying signed and read-only `account_keys`.
        /// Header values only describe static `account_keys`, they do not describe
        /// any additional account keys loaded via address table lookups.
        pub header: MessageHeader,

        // 所有的需要使用到的程序集合
        /// List of accounts loaded by this transaction.
        #[serde(with = "short_vec")]
        pub account_keys: Vec<Pubkey>,

        /// The blockhash of a recent block.
        pub recent_blockhash: Hash,


        // 指令合集
        /// Instructions that invoke a designated program, are executed in sequence,
        /// and committed in one atomic transaction if all succeed.
        ///
        /// # Notes
        ///
        /// Program indexes must index into the list of message `account_keys` because
        /// program id's cannot be dynamically loaded from a lookup table.
        ///
        /// Account indexes must index into the list of addresses
        /// constructed from the concatenation of three key lists:
        ///   1) message `account_keys`
        ///   2) ordered list of keys loaded from `writable` lookup table indexes
        ///   3) ordered list of keys loaded from `readable` lookup table indexes
        #[serde(with = "short_vec")]
        pub instructions: Vec<CompiledInstruction>,

        /// List of address table lookups used to load additional accounts
        /// for this transaction.
        #[serde(with = "short_vec")]
        pub address_table_lookups: Vec<MessageAddressTableLookup>,
    }

    pub enum VersionedMessage {
        Legacy(LegacyMessage),
        V0(v0::Message),
    }

    pub struct VersionedTransaction {
        /// List of signatures
        #[serde(with = "short_vec")]
        pub signatures: Vec<Signature>,
        /// Message to sign.
        pub message: VersionedMessage,
    }
  ```

- 交易指令
  ```rust
  pub struct CompiledInstruction {

        // 索引
        /// Index into the transaction keys array indicating the program account that executes this instruction.
        pub program_id_index: u8,

        // 需要和合约交互账户
        /// Ordered indices into the transaction keys array indicating which accounts to pass to the program.
        #[serde(with = "short_vec")]
        pub accounts: Vec<u8>,

        // 输入数据
        /// The program input data.
        #[serde(with = "short_vec")]
        pub data: Vec<u8>,
    }
  ```

- 合约
  - 普通合约:
    - 普通合约是由用户开发并部署，Solana官方也有 一些官方开发的合约，如Token、ATA账号等合   约
  - 系统合约:
    - System Program: 创建账号，转账等作用
    - BPF Loader Program: 部署和更新合约
    - Vote program: 创建并管理用户POS代理投票的状态和奖励


- Account的所有权
  - 在上面的Account介绍中，我们有个owner的成员，这个就表示这个Account是被哪个合约管理的，或者说哪个 合约可以对这个Account进行读写，类似Linux操作系统中，文件属于哪个用户。

    - 例如： https://solscan.io/account/TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

        ```bash
        curl http://api.mainnet-beta.solana.com -X POST -H "Content-Type: application/json" -d '
        {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getAccountInfo",
        "params": [
            "6oE6pwEfq9XKjyuQ4M9Qx1qj5gkwf96Bc3GnLH36QaXn",
            {"encoding": "jsonParsed"}
        ]
        }
        '
        ```
    - 响应:
        ```json
        {
            "jsonrpc": "2.0",
            "result": {
                "context": {
                "apiVersion": "1.18.15",
                "slot": 275171657
                },
                "value": {
                "data": {
                    "parsed": {
                    "info": {
                        "decimals": 6,
                        "freezeAuthority": null,
                        "isInitialized": true,
                        "mintAuthority": null,
                        "supply": "1000000000000000"
                    },
                    "type": "mint"
                    },
                    "program": "spl-token",
                    "space": 82
                },
                "executable": false,
                "lamports": 1461600,
                "owner": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                "rentEpoch": 18446744073709551615,
                "space": 82
                }
            },
            "id": 1
        }
        ```

- 租约
  - Solana的资金模型中，每个 Solana 账户在区块链上存储数据的费用称为“租金”。
  - 所有 Solana 账户（以及计划）都需要保持足够高的 LAMPORT 余额，才能免除租金并保留在 Solana 区块链上。
  - 当帐户不再有足够的 LAMPORTS 来支付租金时，它将通过称为垃圾收集的过程从网络中删除。

- 租金率
  - 目前，租金率为静态金额并存储在 Rent 系统变量中。



## SPL代币

> https://www.solanazh.com/course/1-3

- SPL代币，类似以太坊中的ERC20代币
- SPL Token是 " Solana Program Library"中的一个组成部分，叫做"Token Program"，简称为SPL Token。

- SPL Token中，一个代币，仅仅是一个归Token合约管理的普通的Account对象，这个对象里面的二进制数据定义了 这个代币的基本属性。


- SPL Token 2个关键账户数据结构： `Mint` 和 `Account`
  - `Mint`账户数据结构
    - https://github.com/solana-labs/solana-program-library/tree/master/token/program-2022/src/state.rs

        ```rust
        /// Mint data.
        #[repr(C)]
        #[derive(Clone, Copy, Debug, Default, PartialEq)]
        pub struct Mint {
            // 增发权限
            /// Optional authority used to mint new tokens. The mint authority may only
            /// be provided during mint creation. If no mint authority is present
            /// then the mint has a fixed supply and no further tokens may be
            /// minted.
            pub mint_authority: COption<Pubkey>,

            // 总量
            /// Total supply of tokens.
            pub supply: u64,

            // 精度
            /// Number of base 10 digits to the right of the decimal place.
            pub decimals: u8,

            // 初始化
            /// Is `true` if this structure has been initialized
            pub is_initialized: bool,

            // 冻结账户权限(黑名单？)
            /// Optional authority to freeze token accounts.
            pub freeze_authority: COption<Pubkey>,
        }
        ```

  -  `Account`结构

        > 注意和Solana底层数据结构的Account做区分，Solana底层的Account可以称作 Wallet Account 。而

        ```rust
        /// Account data.
        #[repr(C)]
        #[derive(Clone, Copy, Debug, Default, PartialEq)]
        pub struct Account {
            // 指向上面的 Mint账户
            /// The mint associated with this account
            pub mint: Pubkey,

            // 一般是普通钱包用户，也可以是PDA账户
            /// The owner of this account.
            pub owner: Pubkey,

            // token的余额
            /// The amount of tokens this account holds.
            pub amount: u64,

            // 委托账户
            /// If `delegate` is `Some` then `delegated_amount` represents
            /// the amount authorized by the delegate
            pub delegate: COption<Pubkey>,

            // 账户状态
            /// The account's state
            pub state: AccountState,

            // 是否原生token, 例如 wrapped SOL
            /// If is_some, this is a native token, and the value logs the rent-exempt
            /// reserve. An Account is required to be rent-exempt, so the value is
            /// used by the Processor to ensure that wrapped SOL accounts do not
            /// drop below this threshold.
            pub is_native: COption<u64>,

            // 委托金额
            /// The amount delegated
            pub delegated_amount: u64,

            // 关闭权限
            /// Optional authority to close the account.
            pub close_authority: COption<Pubkey>,
        }
        ```

  - Mint 和 Account的关系
    - PDA (Program Dervied Address): 程序派生账户
    - Associated Token Account: 即 SPL Token的 Account, 见上面的`Account`的结构体
    - Mint Account: 即SPL Token 的 Mint, 见上面`Mint` 结构体

    ![](./imgs/solana_account_modle.png)


## 深入理解Solana的账户模型(核心)

> https://solanacookbook.com/zh/core-concepts/pdas.html#%E7%BB%BC%E8%BF%B0

- "一个公/私钥对账户"：就是普通用户的钱包账户
- "程序": 即合约
- "PDA": 程序派生出来的账户
- "拥有者": owner

![](./imgs/account-matrix.11f1f839.png)



## 安装solana命令行
> https://www.solanazh.com/course/1-4

- `sh -c "$(curl -sSfL https://release.solana.com/stable/install)"`
- 查看版本 `solana --version`
- 查看最新版本：https://github.com/solana-labs/solana/releases
- 更新到最新稳定版： `solana-install-init 1.18.15`


- 设置环境： `solana config set --url https://api.devnet.solana.com`
  - 官方RPC地址分别是：
    - DevNet: https://api.devnet.solana.com
    - TestNet: https://api.testnet.solana.com
    - MainNet: https://api.mainnet-beta.solana.com

- dev开发环境:
  - 7DxeAgFoxk9Ha3sdciWE4G4hsR9CUjPxsHAxTmuCJrop
  - `/home/yqq/.config/solana/id.json`

    ```
    dinosaur domain jelly echo mountain cause drastic slab know dance ready open
    ```

  - 查看地址： `solana-keygen pubkey /home/yqq/.config/solana/id.json`
  - 水龙头:
    - https://faucet.solana.com/
    - https://solfaucet.com/
  - 查看地址余额: `solana balance -k /home/yqq/.config/solana/id.json`
  - 区块浏览器查看余额: https://explorer.solana.com/address/7DxeAgFoxk9Ha3sdciWE4G4hsR9CUjPxsHAxTmuCJrop?cluster=devnet

  - 转账: `solana transfer --allow-unfunded-recipient devwuNsNYACyiEYxRNqMNseBpNnGfnd4ZwNHL7sphqv 0.001 -k /home/yqq/.config/solana/id.json`
  - 查看转账交易: https://explorer.solana.com/tx/5Menvb9eNuVSUCXTiSnMYxAEW55pcJeMPYZtuhEeBVtzdyuFZdDMTK23cSWZpqCSo6WZo61z1nieyS4LcNYY2Mv2?cluster=devnet
