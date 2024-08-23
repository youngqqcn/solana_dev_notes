"use client";
import { useState } from "react";
import * as web3 from "@solana/web3.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAccount, getMint } from "@solana/spl-token";

interface RespType {
    sol: number; // Adjust the type based on your actual data type
    token: number;
    // decimals: number;
}

export default function Home() {
    const [bondingCurvePDA, setBondingCurvePDA] = useState(
        "Brk9QJQCZesVuMGfbciecWiQqDTcuUwMv434d8gzbZuW"
    );
    const [tokenMint, setTokenMint] = useState(
        "3RCqR2zRArb6VVkmpj1PtX78dbYLz4xjL3LY8HTFXoK7"
    );
    const [curSolAmountInPool, setCurSolAmountInPool] = useState("");
    const [afterTradingSolAmountInPool, setAfterTradingSolAmountInPool] =
        useState("");
    const [tokenAmountInPool, setTokenAmountInPool] = useState("");
    const [buyWillGetTokenAmount, setBuyWillGetTokenAmount] = useState("");
    const [buySolAmount, setBuySolAmount] = useState("");
    const [marketPrice, setMarketPrice] = useState("");

    async function getTokenBalance(
        bondingCurvePDA: String,
        tokenMint: String
    ): Promise<RespType> {
        let url = "https://api.devnet.solana.com";
        let connection = new web3.Connection(url);

        // 获取 SOL 余额
        // let bondingCurvePDA = req.params.address;
        console.log("bonding curve pda: ", bondingCurvePDA);

        // let mint = req.params.mint;
        // console.log("mint : ", req.params.mint);

        // let accInfo = await connection.getAccountInfo(new web3.PublicKey(bondingCurvePDA));
        // accInfo?.data.



        // TODO: 这里要减去账户租金, 最保险的做法，应该读取PDA账户中的变量值
        let accountSize = 130;
        let rent = await connection.getMinimumBalanceForRentExemption(accountSize);
        console.log("rent =", rent);

        let rawSolBalance = await connection.getBalance(
            new web3.PublicKey(bondingCurvePDA)
        );
        console.log("rawSolBalance = ", rawSolBalance);
        let trueSolBalance = rawSolBalance - rent; // 减去租金
        console.log("trueSolBalance = ", trueSolBalance);



        // 创建钱包地址的 PublicKey
        const walletPublicKey = new PublicKey(bondingCurvePDA);

        // 创建 token mint 地址的 PublicKey
        const tokenMintPublicKey = new PublicKey(tokenMint);

        // 查找与钱包关联的 token 账户地址
        const tokenAccount = await connection.getTokenAccountsByOwner(
            walletPublicKey,
            { mint: tokenMintPublicKey }
        );

        if (tokenAccount.value.length === 0) {
            console.log("No token account found for this wallet");
            return {
                sol: 0,
                token: 0,
                // decimals: 0,
            };
        }

        let mintInfo = await getMint(connection, tokenMintPublicKey);

        // 获取 token 账户的信息
        const accountInfo = await getAccount(
            connection,
            tokenAccount.value[0].pubkey
        );

        let tokenBalanceView =
            Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
        let solBlanceView = trueSolBalance / Math.pow(10, 9);

        let resp = {
            sol: solBlanceView,
            token: tokenBalanceView,
            // decimals: mintInfo.decimals,
        };
        return resp;
    }

    function calc_buy_for_dy(x: number, dx: number): number {
        const k = 1073000000;
        const v = 32190000000;
        const dy = (v * dx) / ((30 + x) * (30 + x + dx));
        return dy;
    }

    function calc_market_price(x: number): number {
        const v = 32190000000;
        const market_price = ((30 + x) * (30 + x)) / v;
        return market_price;
    }

    function calc_sell_for_dx(y: number, dy: number): number {
        const k = 1073000000;
        const v = 32190000000;
        const dx = (v * dy) / ((k - y) * (k - y + dy));
        return dx;
    }

    const handleCalculate = async () => {
        try {
            console.log("Calculation triggered");

            console.log("bondingCurvePDA = ", bondingCurvePDA);
            console.log("tokenMint = ", tokenMint);
            console.log("tokenAmountInPool = ", tokenAmountInPool);
            console.log("buyWillGetTokenAmount = ", buyWillGetTokenAmount);
            console.log("buySolAmount = ", buySolAmount);
            console.log("marketPrice = ", marketPrice);

            let rsp = await getTokenBalance(bondingCurvePDA, tokenMint);
            console.log("======获取结果: ");
            console.log(rsp);

            // 计算买入
            let x = rsp.sol;
            let dx = parseFloat(buySolAmount);
            let dy = calc_buy_for_dy(x, dx);

            // 计算最新成交价
            let price = calc_market_price(x + dx);

            setMarketPrice(price.toFixed(10).toString());
            setBuyWillGetTokenAmount(dy.toFixed(6).toString());
            setCurSolAmountInPool(rsp.sol.toFixed(9).toString());
            setTokenAmountInPool(rsp.token.toFixed(6).toString());
            setAfterTradingSolAmountInPool((x + dx).toFixed(9).toString());
        } catch (error) {
            console.error("Error occured:", error);
        }
    };

    return (
        <div>
            <h2>买入计算</h2>

            <div>
                <label>BondingCurve PDA地址 : </label>
                <input
                    type="text"
                    value={bondingCurvePDA}
                    onChange={(e) => setBondingCurvePDA(e.target.value)}
                    placeholder="输入Bonding Curve PDA地址"
                />
            </div>

            <div>
                <label>Token Mint: </label>
                <input
                    type="text"
                    value={tokenMint}
                    onChange={(e) => setTokenMint(e.target.value)}
                    placeholder="输入Token Mint的地址"
                />
            </div>

            <div>
                <label>付出SOL的数量</label>
                <input
                    type="text"
                    value={buySolAmount}
                    onChange={(e) => setBuySolAmount(e.target.value)}
                />
            </div>

            <div>
                <label>池中当前SOL数量</label>
                <input type="text" value={curSolAmountInPool} disabled />
            </div>

            <div>
                <label>交易后池子中SOL数量</label>
                <input
                    type="text"
                    value={afterTradingSolAmountInPool}
                    disabled
                />
            </div>

            <div>
                <label>得到Token的数量</label>
                <input type="text" value={buyWillGetTokenAmount} disabled />
            </div>
            <div>
                <label>最新成交价(市场价)</label>
                <input type="text" value={marketPrice} disabled />
            </div>
            <div>
                <label>池中的Token数量</label>
                <input type="text" value={tokenAmountInPool} disabled />
            </div>

            {/* <h2>卖出计算</h2>

            <div>
                <label>卖出Token的数量</label>
                <input type="text" value={""} disabled />
            </div>
            <div>
                <label>得到SOL的数量</label>
                <input type="text" value={""} disabled />
            </div>
            <div>
                <label>最新成交价(市场价)</label>
                <input type="text" value={marketPrice} disabled />
            </div> */}

            <button onClick={handleCalculate}>Calculate</button>
        </div>
    );
}
