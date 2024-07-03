import {
    clusterApiUrl,
    Connection,
    Keypair,
    Transaction,
    SystemProgram,
    PublicKey,
    SendTransactionError,

} from "@solana/web3.js";

import {
    createCloseAccountInstruction,
    createTransferInstruction,
    createInitializeAccountInstruction,
    getMinimumBalanceForRentExemptAccount,
    createInitializeMintInstruction,
    TOKEN_PROGRAM_ID,
    MINT_SIZE,
    getMinimumBalanceForRentExemptMint,
    createMint,
    getMint,
    createAssociatedTokenAccount,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount,
    mintToChecked,
    createMintToCheckedInstruction,
    transferChecked,
    createTransferCheckedInstruction,
    burnChecked,
    createBurnCheckedInstruction,
    createApproveCheckedInstruction,
    NATIVE_MINT,
    NATIVE_MINT_2022,
    createSyncNativeInstruction,
    ACCOUNT_SIZE,
} from "@solana/spl-token";
// import * as bs58 from "bs58";
import bs58 from "bs58";

// 方式1： 使用内置的 createMint 函数 , 创建SPL Token
async function createToken() {
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
}

// 方式2： 自己组装交易指令
async function createTokenV2() {
    // connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    let secretKey = bs58.decode(
        "5TaF2mrj1wu6Kb7dj5AETQmg4Shaoo17wo3YucjTjZNP42wbR7sWN62f8tJpnNGEsJoxW8rQWWxiPH4qPxaxruCJ"
    );

    const feePayer = Keypair.fromSecretKey(secretKey);

    // 打印base58格式的私钥
    // console.log(bs58.encode(feePayer.secretKey));

    const alice = new PublicKey("38jEaxphBTa3NEg4K6nG8Zgs6eVsSsr9AoSZCfax2pH8");

    const mint = Keypair.generate();
    console.log(`mint: ${mint.publicKey.toBase58()}`);
    let tx = new Transaction().add(
        // create mint account
        SystemProgram.createAccount({
            fromPubkey: feePayer.publicKey,
            newAccountPubkey: mint.publicKey,
            space: MINT_SIZE,
            lamports: await getMinimumBalanceForRentExemptMint(connection),
            programId: TOKEN_PROGRAM_ID,
        }),
        // init mint account
        createInitializeMintInstruction(
            mint.publicKey, // mint pubkey
            8, // decimals
            alice, // mint authority
            alice // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
        )
    );

    // 第二个参数signers ， 需要传入签名的keypair
    //           feePayer 是交易发起的签名
    //           mint  是 Mint Account 的签名
    console.log(
        `txhash is ${await connection.sendTransaction(tx, [feePayer, mint])}`
    );
}

async function getMintAccount() {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const mintAccountPublicKey = new PublicKey(
        "BtV3XUwFArdshJf2HWVyNHg23ooeEfAqJ5k8WLcTPVcW"
    );

    let mintAccount = await getMint(connection, mintAccountPublicKey);

    console.log(mintAccount);
}

// 创建 Token Account, 即 ATA 账号
async function createATA() {
    // connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    let secretKey = bs58.decode(
        "5TaF2mrj1wu6Kb7dj5AETQmg4Shaoo17wo3YucjTjZNP42wbR7sWN62f8tJpnNGEsJoxW8rQWWxiPH4qPxaxruCJ"
    );

    const feePayer = Keypair.fromSecretKey(secretKey);

    // 打印base58格式的私钥
    // console.log(bs58.encode(feePayer.secretKey));

    const alice = new PublicKey("38jEaxphBTa3NEg4K6nG8Zgs6eVsSsr9AoSZCfax2pH8");

    // Token Mint Account 地址
    const mintPubkey = new PublicKey(
        "BtV3XUwFArdshJf2HWVyNHg23ooeEfAqJ5k8WLcTPVcW"
    );

    // 使用内建的方法创建 ATA账号
    // 方式1) use build-in function
    if (false) {
        let ata = await createAssociatedTokenAccount(
            connection, // connection
            feePayer, // fee payer
            mintPubkey, // mint
            alice // owner,
        );
        console.log(`ATA: ${ata.toBase58()}`);

        // https://explorer.solana.com/address/7R6svto5X3gFuUUfBPYoyxk5uEvAFouruxjYj9ERRgAG?cluster=devnet
    }

    // 方式2: 自己组装创建ATA账号的交易
    // 2) composed by yourself
    if (true) {
        // calculate ATA
        let ata = await getAssociatedTokenAddress(
            mintPubkey, // mint
            feePayer.publicKey // owner
        );
        console.log(`ATA: ${ata.toBase58()}`);
        // CGnQCbwxAmKR5qZfV86biZxpwMRP6kjhnECjbP8qHQio

        // 使用 off-curve, 即由程序控制的账户， 而不是普通私钥钱包账户
        // if your wallet is off-curve, you should use
        // let ata = await getAssociatedTokenAddress(
        //   mintPubkey, // mint
        //   alice.publicKey // owner
        //   true, // allowOwnerOffCurve
        // );

        let tx = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                feePayer.publicKey, // payer
                ata, // ata
                feePayer.publicKey, // owner
                mintPubkey // mint
            )
        );
        console.log(
            `txhash: ${await connection.sendTransaction(tx, [feePayer])}`
        );
        // https://explorer.solana.com/tx/4gSkVXtLHhgzeeCxSFjevRA7SfLsBdLFqf4wfDmtYKn2469VuVERF6rJVykkKrm4fCcTufL4w5ayPtmCbjjhFwv3?cluster=devnet
    }
}

// 获取 ATA账户的信息（地址， 所属Token Mint账户（即代币）， owner）
async function getATAInfo() {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const tokenAccountPubkey = new PublicKey(
        "CGnQCbwxAmKR5qZfV86biZxpwMRP6kjhnECjbP8qHQio"
    );

    let tokenAccount = await getAccount(connection, tokenAccountPubkey);
    console.log(tokenAccount);

    /*
{
  address: PublicKey [PublicKey(CGnQCbwxAmKR5qZfV86biZxpwMRP6kjhnECjbP8qHQio)] {
    _bn: <BN: a77b9a2e6675feaecfba28f302bb288b22b47ef929d43de686bc49c48028b714>
  },
  mint: PublicKey [PublicKey(BtV3XUwFArdshJf2HWVyNHg23ooeEfAqJ5k8WLcTPVcW)] {
    _bn: <BN: a1c5330ff9b5e7979aef5a57d0cb26406d2a60231a0d103157b09bb7ba20c42b>
  },
  owner: PublicKey [PublicKey(7DxeAgFoxk9Ha3sdciWE4G4hsR9CUjPxsHAxTmuCJrop)] {
    _bn: <BN: 5c780128cbe90a7f09b53c731e689908fcf4018f1e1cf20271c04ebaa7758457>
  },
  amount: 0n,
  delegate: null,
  delegatedAmount: 0n,
  isInitialized: true,
  isFrozen: false,
  isNative: false,
  rentExemptReserve: null,
  closeAuthority: null,
  tlvData: <Buffer >
}
    */
}

// 获取token余额
async function getTokenBalance() {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const tokenAccount = new PublicKey(
        "CGnQCbwxAmKR5qZfV86biZxpwMRP6kjhnECjbP8qHQio"
    );

    let tokenAmount = await connection.getTokenAccountBalance(tokenAccount);
    console.log(`amount: ${tokenAmount.value.amount}`);
    console.log(`decimals: ${tokenAmount.value.decimals}`);
}

// mint  token
async function mintToken() {
    // connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    let secretKey = bs58.decode(
        "5TaF2mrj1wu6Kb7dj5AETQmg4Shaoo17wo3YucjTjZNP42wbR7sWN62f8tJpnNGEsJoxW8rQWWxiPH4qPxaxruCJ"
    );

    const feePayer = Keypair.fromSecretKey(secretKey);

    // 打印base58格式的私钥
    // console.log(bs58.encode(feePayer.secretKey));

    const alice = Keypair.fromSecretKey(
        bs58.decode(
            "4Qm4vkkBXkEkGpfG55v1UtMLe6qaXgTE6GjcBNaBJMyZEdNv5efFHgrbLZGj9tpsuuri945zfa7EnUGoj4i7dN1g"
        )
    );

    // Token Mint Account 地址
    const mintPubkey = new PublicKey(
        "BtV3XUwFArdshJf2HWVyNHg23ooeEfAqJ5k8WLcTPVcW"
    );

    // 接受地址的 ATA,
    // 也可以根据上面的方法， public key ，通过public key计算出 ATA
    const receiverTokenAccountPubkeyATA = new PublicKey(
        "CGnQCbwxAmKR5qZfV86biZxpwMRP6kjhnECjbP8qHQio"
    );

    // 方式1： 使用内建的方法
    // 1) use build-in function
    if (false) {
        let txhash = await mintToChecked(
            connection, // connection
            feePayer, // fee payer
            mintPubkey, // mint
            receiverTokenAccountPubkeyATA, // receiver (should be a token account),
            alice, // mint authority
            1e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
            8 // decimals
        );
        console.log(`txhash: ${txhash}`);
        // https://explorer.solana.com/tx/3HQfKbQR5xhUQooGQRvYeAKUTHb5UqLtGoLfns6rjbzsakpZvWRDMm1q9GMdymDksB9TdoxCfdWTxrE5i8kg8j31?cluster=devnet

        // 如果是多签账户
        // if alice is a multisig account
        // let txhash = await mintToChecked(
        //   connection, // connection
        //   feePayer, // fee payer
        //   mintPubkey, // mint
        //   tokenAccountPubkey, // receiver (should be a token account)
        //   alice.publicKey, // !! mint authority pubkey !!
        //   1e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
        //   8, // decimals
        //   [signer1, signer2 ...],
        // );
    }

    // 方式2： 自己组装交易
    // 2) compose by yourself
    if (true) {
        let tx = new Transaction().add(
            createMintToCheckedInstruction(
                mintPubkey, // mint
                receiverTokenAccountPubkeyATA, // receiver (should be a token account)
                alice.publicKey, // mint authority
                1e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
                8 // decimals
                // [signer1, signer2 ...], // only multisig account will use
            )
        );
        console.log(
            `txhash: ${await connection.sendTransaction(tx, [
                feePayer,
                alice /* fee payer + mint authority */,
            ])}`
        );
    }
}

// 转移token
async function transferToken() {
    // connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    let secretKey = bs58.decode(
        "5TaF2mrj1wu6Kb7dj5AETQmg4Shaoo17wo3YucjTjZNP42wbR7sWN62f8tJpnNGEsJoxW8rQWWxiPH4qPxaxruCJ"
    );

    const feePayer = Keypair.fromSecretKey(secretKey);

    // 打印base58格式的私钥
    // console.log(bs58.encode(feePayer.secretKey));

    const alice = Keypair.fromSecretKey(
        bs58.decode(
            "4Qm4vkkBXkEkGpfG55v1UtMLe6qaXgTE6GjcBNaBJMyZEdNv5efFHgrbLZGj9tpsuuri945zfa7EnUGoj4i7dN1g"
        )
    );

    // Token Mint Account 地址
    const mintPubkey = new PublicKey(
        "BtV3XUwFArdshJf2HWVyNHg23ooeEfAqJ5k8WLcTPVcW"
    );

    const fromATA = await getAssociatedTokenAddress(
        mintPubkey, // mint
        feePayer.publicKey // owner
    );

    const toATA = await getAssociatedTokenAddress(
        mintPubkey, // mint
        // alice.publicKey // owner
        new PublicKey("2KgowxogBrGqRcgXQEmqFvC3PGtCu66qERNJevYW8Ajh") //  toATA 必须是已经创建出来的
    );
    console.log(`ATA: ${toATA.toBase58()}`);

    // 方式2： 使用内建方法
    // 1) use build-in function
    if (false) {
        let txhash = await transferChecked(
            connection, // connection
            feePayer, // payer
            fromATA, // from (should be a token account)
            mintPubkey, // mint
            toATA, // to (should be a token account)
            feePayer, // from's owner
            1e7, // amount, if your deciamls is 8, send 10^8 for 1 token
            8 // decimals
        );
        console.log(`txhash: ${txhash}`);
        // https://explorer.solana.com/tx/r1UHqXwb5QyMKiyDjDyqDW1f7MC3nLv3vzG1bsF2TXuRCU7Whq4sR1STYpfU4knvweFJ7PTm2mNjeKGzEJrtESe?cluster=devnet
    }

    // 方式2： 自己组装交易，更加灵活
    // 2) compose by yourself
    if (true) {
        let tx = new Transaction()
            // .add(
            //     // 为新地址创建 ATA 账号,
            //     // 如果ATA账户已经存在，则不能重复创建，重复创建会报 Provided owner is not allowed
            //     createAssociatedTokenAccountInstruction(
            //         feePayer.publicKey, // payer
            //         toATA, // ata
            //         new PublicKey(
            //             "2KgowxogBrGqRcgXQEmqFvC3PGtCu66qERNJevYW8Ajh"
            //         ), // owner
            //         mintPubkey // mint
            //     )
            // )
            .add(
                // 创建转移交易
                createTransferCheckedInstruction(
                    fromATA, // from (should be a token account)
                    mintPubkey, // mint
                    toATA, // to (should be a token account)
                    feePayer.publicKey, // from's owner
                    1e7, // amount, if your deciamls is 8, send 10^8 for 1 token
                    8 // decimals
                )
            );
        console.log(
            `txhash: ${await connection.sendTransaction(tx, [
                feePayer /* fee payer + owner */,
                // feePayer,
            ])}`
        );
    }
}

// 销毁token
async function burnToken() {
    // connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    let secretKey = bs58.decode(
        "5TaF2mrj1wu6Kb7dj5AETQmg4Shaoo17wo3YucjTjZNP42wbR7sWN62f8tJpnNGEsJoxW8rQWWxiPH4qPxaxruCJ"
    );

    const feePayer = Keypair.fromSecretKey(secretKey);

    // 打印base58格式的私钥
    // console.log(bs58.encode(feePayer.secretKey));

    const alice = Keypair.fromSecretKey(
        bs58.decode(
            "4Qm4vkkBXkEkGpfG55v1UtMLe6qaXgTE6GjcBNaBJMyZEdNv5efFHgrbLZGj9tpsuuri945zfa7EnUGoj4i7dN1g"
        )
    );

    // Token Mint Account 地址
    const mintPubkey = new PublicKey(
        "BtV3XUwFArdshJf2HWVyNHg23ooeEfAqJ5k8WLcTPVcW"
    );

    const fromATA = await getAssociatedTokenAddress(
        mintPubkey, // mint
        feePayer.publicKey // owner
    );

    // 方式1：使用内建方法
    // 1) use build-in function
    if (false) {
        let txhash = await burnChecked(
            connection, // connection
            feePayer, // payer
            fromATA, // token account
            mintPubkey, // mint
            feePayer, // owner
            1e5, // amount, if your deciamls is 8, 10^8 for 1 token
            8
        );
        console.log(`txhash: ${txhash}`);
        // https://explorer.solana.com/tx/4kBAsbWoGS4BZRHz18Wqudqu5WkmrdiXZdEUucqHtWNZZjXtKA5j466S9PsWp3W7Sof5XzTLbKvBmRKQBMUic5RY?cluster=devnet
    }

    // 方式2： 自己组装交易
    // 2) compose by yourself
    if (true) {
        let tx = new Transaction().add(
            createBurnCheckedInstruction(
                fromATA, // token account
                mintPubkey, // mint
                feePayer.publicKey, // owner of token account
                1e5, // amount, if your deciamls is 8, 10^8 for 1 token
                8 // decimals
            )
        );
        console.log(
            `txhash: ${await connection.sendTransaction(tx, [
                feePayer,
                // alice /* fee payer + token authority */,
            ])}`
        );
        // https://explorer.solana.com/tx/35GnwX1hzxXRLJbBkLn5v5pRv46mLXJYFZHBm4n9EMpnKjTdowxAZPtzKGxAWt2KhTbNupdCFjjq41D8uR85UJyP?cluster=devnet
    }
}

// approve , 注意：A token account can only delegate to one account at the same time
async function approveToken() {
    // connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    let secretKey = bs58.decode(
        "5TaF2mrj1wu6Kb7dj5AETQmg4Shaoo17wo3YucjTjZNP42wbR7sWN62f8tJpnNGEsJoxW8rQWWxiPH4qPxaxruCJ"
    );

    const feePayer = Keypair.fromSecretKey(secretKey);

    // 打印base58格式的私钥
    // console.log(bs58.encode(feePayer.secretKey));

    const alice = Keypair.fromSecretKey(
        bs58.decode(
            "4Qm4vkkBXkEkGpfG55v1UtMLe6qaXgTE6GjcBNaBJMyZEdNv5efFHgrbLZGj9tpsuuri945zfa7EnUGoj4i7dN1g"
        )
    );

    // Token Mint Account 地址
    const mintPubkey = new PublicKey(
        "BtV3XUwFArdshJf2HWVyNHg23ooeEfAqJ5k8WLcTPVcW"
    );

    const fromATA = await getAssociatedTokenAddress(
        mintPubkey, // mint
        feePayer.publicKey // owner
    );

    const aliceATA = await getAssociatedTokenAddress(
        mintPubkey, // mint
        alice.publicKey // owner
    );
    console.log(aliceATA.toBase58());
    // return;

    // let tx = new Transaction().add(
    //     createApproveCheckedInstruction(
    //         fromATA, // token account
    //         mintPubkey, // mint
    //         alice.publicKey, // delegate
    //         feePayer.publicKey, // owner of token account
    //         100e8, // amount, if your deciamls is 8, 10^8 for 1 token
    //         8 // decimals
    //     )
    // );
    // 撤销approve
    // let tx = new Transaction().add(
    //     createRevokeInstruction(
    //       tokenAccountPubkey, // token account
    //       alice.publicKey // owner of token account
    //     )
    //   );

    // console.log(
    //     `txhash: ${await connection.sendTransaction(tx, [
    //         feePayer,
    //         // alice /* fee payer + owner */,
    //     ])}`
    // );

    const toATA = await getAssociatedTokenAddress(
        mintPubkey, // mint
        // alice.publicKey // owner
        new PublicKey("2KgowxogBrGqRcgXQEmqFvC3PGtCu66qERNJevYW8Ajh") //  toATA 必须是已经创建出来的
    );
    console.log(`ATA: ${toATA.toBase58()}`);

    // 委托之后，对委托金额发起转账
    let tx = new Transaction().add(
        createTransferCheckedInstruction(
            fromATA, // from token account
            mintPubkey, // mint
            aliceATA, // to ， 必须是 ATA
            alice.publicKey, // owner of token account
            1e5, // amount, if your deciamls is 8, 10^8 for 1 token
            8 // decimals
        )
    );

    // try {
    //     const simulation = await connection.simulateTransaction(tx, [alice]);
    //     // console.log("simulation result: ", simu);
    //     if (simulation.value.err) {
    //         console.error("Simulation error:", simulation.value.err);
    //         // 分析模拟错误
    //         return;
    //     }
    // } catch (error) {
    //     console.error(`Error sending transaction: ${error}`);

    //     if (error instanceof SendTransactionError) {
    //         if (error.getLogs) {
    //             console.error("Transaction Logs:", await error.getLogs());
    //         }
    //     }
    // }

    try {
        let txhash = await connection.sendTransaction(tx, [
            // feePayer,
            alice /* fee payer + owner */,
        ]);
    } catch (error) {
        console.error(`Error sending transaction: ${error}`);

        if (error instanceof SendTransactionError) {
            if (error.getLogs) {
                console.error("Transaction Logs:", await error.getLogs());
            }
        }
    }

    // 转移delegate的token
    // https://explorer.solana.com/tx/4ZWm86tbesCo37Eae55EdyK5BLCq6DUx9NJDieMUQd1GDRxQjcpkaaSsC5npbYrC3GLXyiaCMrnJtH3qFzX9kf3B?cluster=devnet
    // https://explorer.solana.com/tx/PseiRdbTSEGdV1SMiRFZj8iKqcdCpGUjV1gVkbeqQVt4B97EoHwz62JYqxSC2PTxL7hD2cWeLGh3n2u6HF7tyGk?cluster=devnet
}

// 方式1： 将 SOL 转为 wrapped SOL
// https://solanacookbook.com/references/token.html#how-to-manage-wrapped-sol
async function transferSOL2WrappedSOL() {
    // connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    let secretKey = bs58.decode(
        "5TaF2mrj1wu6Kb7dj5AETQmg4Shaoo17wo3YucjTjZNP42wbR7sWN62f8tJpnNGEsJoxW8rQWWxiPH4qPxaxruCJ"
    );

    const feePayer = Keypair.fromSecretKey(secretKey);

    // 打印base58格式的私钥
    // console.log(bs58.encode(feePayer.secretKey));

    const alice = Keypair.fromSecretKey(
        bs58.decode(
            "4Qm4vkkBXkEkGpfG55v1UtMLe6qaXgTE6GjcBNaBJMyZEdNv5efFHgrbLZGj9tpsuuri945zfa7EnUGoj4i7dN1g"
        )
    );

    // 为 alice 创建 wrapped SOL  的 ATA
    let aliceATA = await getAssociatedTokenAddress(
        NATIVE_MINT, // mint
        alice.publicKey // owner
    );

    // 2rfzEvRYyJtTBg3EpW3yJynNZuCChJunBtdnJbHg8ory
    console.log("aliceATA: ", aliceATA);

    let tx = new Transaction().add(
        // 为alice 创建 wrapped SOL 的 ATA账号
        createAssociatedTokenAccountInstruction(
            alice.publicKey,
            aliceATA,
            alice.publicKey,
            NATIVE_MINT
        ),
        // trasnfer SOL
        SystemProgram.transfer({
            fromPubkey: alice.publicKey,
            toPubkey: aliceATA,
            lamports: 1e8, // 0.1 SOL
        }),
        // sync wrapped SOL balance
        createSyncNativeInstruction(aliceATA)
    );

    console.log(`txhash: ${await connection.sendTransaction(tx, [alice])}`);
    // https://explorer.solana.com/tx/3nYJ1Vx65guiXdh7xg5EMRehCbzULkubeUGLQYvraoc5GESstuiFNHHBfyDdmA2QQKaernLWvQh1zPqUYaauGuWv?cluster=devnet
}

// 方式2： 将 SOL 转为 wrapped SOL
// https://solanacookbook.com/references/token.html#add-balance
async function transferSOL2WrappedSOL_v2() {
    // connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    let secretKey = bs58.decode(
        "5TaF2mrj1wu6Kb7dj5AETQmg4Shaoo17wo3YucjTjZNP42wbR7sWN62f8tJpnNGEsJoxW8rQWWxiPH4qPxaxruCJ"
    );

    const feePayer = Keypair.fromSecretKey(secretKey);

    // 打印base58格式的私钥
    // console.log(bs58.encode(feePayer.secretKey));

    const alice = Keypair.fromSecretKey(
        bs58.decode(
            "4Qm4vkkBXkEkGpfG55v1UtMLe6qaXgTE6GjcBNaBJMyZEdNv5efFHgrbLZGj9tpsuuri945zfa7EnUGoj4i7dN1g"
        )
    );

    // 为 alice 创建 wrapped SOL  的 ATA
    let aliceATA = await getAssociatedTokenAddress(
        NATIVE_MINT, // mint
        alice.publicKey // owner
    );

    // 2rfzEvRYyJtTBg3EpW3yJynNZuCChJunBtdnJbHg8ory
    console.log("aliceATA: ", aliceATA);

    let auxAccount = Keypair.generate();
    let amount = 1 * 1e8; // 0.1 SOL

    let tx = new Transaction().add(
        // create token account
        SystemProgram.createAccount({
            fromPubkey: alice.publicKey,
            newAccountPubkey: auxAccount.publicKey,
            space: ACCOUNT_SIZE,
            lamports:
                (await getMinimumBalanceForRentExemptAccount(connection)) +
                amount, // rent + amount
            programId: TOKEN_PROGRAM_ID,
        }),
        // init token account
        createInitializeAccountInstruction(
            auxAccount.publicKey,
            NATIVE_MINT,
            alice.publicKey
        ),
        // transfer WSOL
        createTransferInstruction(
            auxAccount.publicKey,
            aliceATA,
            alice.publicKey,
            amount
        ),
        // close aux account
        createCloseAccountInstruction(
            auxAccount.publicKey,
            alice.publicKey,
            alice.publicKey
        )
    );

    console.log(
        `txhash: ${await connection.sendTransaction(tx, [alice, auxAccount])}`
    );
    // https://explorer.solana.com/tx/2qieppEvkAi6Vkru4u552whj2swhKT6wqQkzjikDPCrEK2jtWRMby2g6fcxM9aJmNrMWqyovvjY6y8qoncGb6ZzF?cluster=devnet
}

// createToken();
// createTokenV2();
// getMintAccount();
// createATA();
// getATAInfo();
// getTokenBalance();
// mintToken();
// transferToken();
// burnToken();
// approveToken();

// transferSOL2WrappedSOL();
transferSOL2WrappedSOL_v2();
