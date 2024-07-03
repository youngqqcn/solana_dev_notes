import {
    clusterApiUrl,
    Connection,
    Keypair,
    Transaction,
    SystemProgram,
    PublicKey,
} from "@solana/web3.js";

import {
    createInitializeMintInstruction,
    TOKEN_PROGRAM_ID,
    MINT_SIZE,
    getMinimumBalanceForRentExemptMint,
    createMint,
} from "@solana/spl-token";
// import * as bs58 from "bs58";
import bs58 from "bs58";

(async () => {
    // connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // 7DxeAgFoxk9Ha3sdciWE4G4hsR9CUjPxsHAxTmuCJrop
    // let secretKey = Uint8Array.from(
    //     JSON.parse(
    //         "[222,251,208,252,44,156,20,7,61,58,58,34,28,168,161,53,37,121,27,7,52,212,34,183,99,228,85,116,234,158,180,203,92,120,1,40,203,233,10,127,9,181,60,115,30,104,153,8,252,244,1,143,30,28,242,2,113,192,78,186,167,117,132,87]"
    //     )
    // );
    let secretKey = bs58.decode(
        "5TaF2mrj1wu6Kb7dj5AETQmg4Shaoo17wo3YucjTjZNP42wbR7sWN62f8tJpnNGEsJoxW8rQWWxiPH4qPxaxruCJ"
    );

    const feePayer = Keypair.fromSecretKey(secretKey);

    // 打印base58格式的私钥
    // console.log(bs58.encode(feePayer.secretKey));

    const alice = new PublicKey("38jEaxphBTa3NEg4K6nG8Zgs6eVsSsr9AoSZCfax2pH8");

    // 1) use build-in function
    let mintPubkey = await createMint(
        connection, // conneciton
        feePayer, // fee payer
        alice, // mint authority
        alice, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
        8 // decimals
    );
    console.log(`mint: ${mintPubkey.toBase58()}`);
})();
