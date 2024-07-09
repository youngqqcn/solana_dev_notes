# Versioned Transaction


Solana有2种不同的交易类型：
- `legacy`: older transaction format with no additional benefit
- `0`: added support for Address Lookup Tables


具体例子：https://www.solanazh.com/course/7-1

# Address Lookup Tables

> https://solana.com/docs/advanced/lookup-tables


- **每笔**普通交易(legacy)最多包含`32`个地址
- 使用 Versioned Transaction 和 Address Lookup Tables, 可以将**每笔交易**能包含的地址提升到 `256`个地址

- 地址压缩： 在所有地址都存在链上之后， 每个地址(32字节)只需用一个索引(1字节)进行地址定位即可

  - 先把地址存在链上,获得一个lookupTableAccount
  - 然后通过索引来获取lookupTableAccount中的地址  

