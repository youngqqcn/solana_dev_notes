const web3 = require("@solana/web3.js");
const fs = require("fs");

async function main() {
  let payer = web3.Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(fs.readFileSync("/home/yqq/.config/solana/id.json"))
    )
  );
  console.log(payer);

  let connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
  );

  console.log(payer.publicKey.toString());

  let toAccount = new web3.PublicKey(
    "38jEaxphBTa3NEg4K6nG8Zgs6eVsSsr9AoSZCfax2pH8"
  );

  // Create Simple Transaction
  let transaction = new web3.Transaction();

  // Add an instruction to execute
  transaction.add(
    web3.SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: toAccount,
      lamports: 1000,
    })
  );

  // Send and confirm transaction
  // Note: feePayer is by default the first signer, or payer, if the parameter is not set
  try {
    const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    console.log("signature: ", signature);
  } catch (error) {
    console.error("Error sending transaction", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
