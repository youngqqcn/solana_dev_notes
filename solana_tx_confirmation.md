# Solana高级概念


## 交易确认&过期

> https://solana.com/docs/advanced/confirmation


- 过期时间 `151`个区块, 每个区块`400ms`, 即 `60s`
- 交易中的recentBlockHash必须是151区块内, 否则将是过期交易




## 一些建议

- 建议1： 调用`getLatestBlockhash`时， 推荐使用 `confired`
  - `proceeded`: 已处理, 很激进，速度最快，但有可能被跳过
    - 用这种级别的交易中，有约`5%`交易会被验证节点丢弃
  - `confirmed`: 已被多个验证节点确认, 折衷方案
    - 这个级别，比较稳妥，因为被多个节点确认，之后被丢弃的几率很小
  - `finalized`: 最终确认, 太保守, 交易不会被丢弃
    - 即`32`个slot确认, 需要`12.8s`

- 建议2：在`sendTransaction`和 `simulateTransaction`时使用， 要设置相同的 `preflightCommitment`, 即都设置 `confirmed`

- 建议3：使用可靠的RPC节点，不要用落后的RPC节点
- 建议4：不要用过期的blockhash, 而是在签名前实时获取最新的blockHash
 - 前端应用要一直轮询最新的区块hash, 确保用户在触发交易时，获取的区块是最新的
 - 钱包要一直轮询最新的区块hash, 并刷新交易中的区块hash,确保用户签名时用的是最新的区块hash
- 建议5：使用健康的RPC节点获取区块hash
- 其他建议




