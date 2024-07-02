// use { Connection } from "@solana/web3.js";
const web3 = require("@solana/web3.js");
const { Keypair } = require("@solana/web3.js");

async function main() {
  console.log("hello");

  let url = "https://api.devnet.solana.com";

  connection = new web3.Connection(url);

  let latestBlockhash = await connection.getLatestBlockhash("finalized");

  console.log(
    "   ✅ - Fetched latest blockhash. Last Valid Height:",
    latestBlockhash.lastValidBlockHeight
  );

  let slot = await connection.getSlot();
  console.log(slot);

  let blockTime = await connection.getBlockTime(slot);
  console.log(blockTime);

  let block = await connection.getBlock(slot);
  console.log(block);

  //xx
  let secretKey = Uint8Array.from(
    JSON.parse(
      "[222,251,208,252,44,156,20,7,61,58,58,34,28,168,161,53,37,121,27,7,52,212,34,183,99,228,85,116,234,158,180,203,92,120,1,40,203,233,10,127,9,181,60,115,30,104,153,8,252,244,1,143,30,28,242,2,113,192,78,186,167,117,132,87]"
    )
  );
  const keypair = Keypair.fromSecretKey(secretKey);
  console.log("address:", keypair.publicKey.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
