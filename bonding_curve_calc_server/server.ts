import express, { Express, Request, Response } from "express";
const app: Express = express();
import * as web3 from "@solana/web3.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAccount, getMint } from "@solana/spl-token";

app.get(
    "/getBondingCurveInfo/:address/:mint",
    async (req: Request, res: Response) => {
        let url = "https://api.devnet.solana.com";
        let connection = new web3.Connection(url);

        // 获取 SOL 余额
        let bondingCurvePDA = req.params.address;
        console.log("bonding curve pda: ", req.params.address);

        let mint = req.params.mint;
        console.log("mint : ", req.params.mint);

        let solBalance = await connection.getBalance(
            new web3.PublicKey(bondingCurvePDA)
        );
        console.log("balance = ", solBalance);

        // 创建钱包地址的 PublicKey
        const walletPublicKey = new PublicKey(bondingCurvePDA);

        // 创建 token mint 地址的 PublicKey
        const tokenMintPublicKey = new PublicKey(mint);

        // 查找与钱包关联的 token 账户地址
        const tokenAccount = await connection.getTokenAccountsByOwner(
            walletPublicKey,
            { mint: tokenMintPublicKey }
        );

        if (tokenAccount.value.length === 0) {
            console.log("No token account found for this wallet");
            return 0;
        }

        let mintInfo = await getMint(connection, tokenMintPublicKey);

        // 获取 token 账户的信息
        const accountInfo = await getAccount(
            connection,
            tokenAccount.value[0].pubkey
        );

        let resp = {
            sol: solBalance,
            token: Number(accountInfo.amount),
            decimals: mintInfo.decimals,
        };

        res.send(resp);
    }
);

app.listen(3000, () => {
    console.log(` running at http://localhost:3000`);
});
