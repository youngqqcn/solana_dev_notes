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

    const [payInAmount, setPayInAmount] = useState("");
    const [payOutAmount, setPayOutAmount] = useState("");
    const [marketPrice, setMarketPrice] = useState("");

    // buy/sell 操作
    const [selectedOption, setSelectedOption] = useState("buy");
    const [isBuyOperation, setIsBuyOperation] = useState(true); // true: buy, false: sell

    // 付出的Token文案
    const [payOutText, setPayOutText] = useState("买入数量(SOL数量):");
    const [payInText, setPayInText] = useState("得到的数量(Token数量):");
    // const [calcButtonText, setCalcButtonText] = useState("计算买入");

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
        let rent = await connection.getMinimumBalanceForRentExemption(
            accountSize
        );
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
            console.log("marketPrice = ", marketPrice);
            console.log("payInAmount = ", payInAmount);
            console.log("payOutAmount = ", payOutAmount);

            let rsp = await getTokenBalance(bondingCurvePDA, tokenMint);
            console.log("======获取结果: ");
            console.log(rsp);

            // 计算买入
            let [dx, dy, mprice] = [0, 0, 0];
            if (isBuyOperation) {
                // 买入token
                let x = rsp.sol;
                dx = parseFloat(payOutAmount);
                dy = calc_buy_for_dy(x, dx);
                console.log("dy = ", dy);

                // 计算最新成交价
                mprice = calc_market_price(x + dx);
                setPayInAmount(dy.toFixed(6).toString());
                setMarketPrice(mprice.toFixed(10).toString());
                setCurSolAmountInPool(rsp.sol.toFixed(9).toString());
                setTokenAmountInPool(rsp.token.toFixed(6).toString());
                setAfterTradingSolAmountInPool(
                    (rsp.sol + dx).toFixed(9).toString()
                );
            } else {
                // 卖出token
                let x = rsp.sol;
                let y = rsp.token;
                dy = parseFloat(payOutAmount);
                dx = calc_sell_for_dx(y, dy);
                console.log("dx = ", dx);

                // 计算最新成交价
                mprice = calc_market_price(x - dx);
                setPayInAmount(dx.toFixed(9).toString()); // sol
                setMarketPrice(mprice.toFixed(10).toString());
                setCurSolAmountInPool(rsp.sol.toFixed(9).toString());
                setTokenAmountInPool(rsp.token.toFixed(6).toString());
                setAfterTradingSolAmountInPool(
                    (rsp.sol - dx).toFixed(9).toString()
                );
            }
        } catch (error) {
            console.error("Error occured:", error);
        }
    };

    const handleOptionChange = (event: any) => {
        let select = (() => {
            switch (event.target.value) {
                case "buy":
                    return "buy";
                case "sell":
                    return "sell";
                default:
                    return "buy";
            }
        })();

        setSelectedOption(select);
        setPayOutText(
            select == "buy" ? "买入数量(SOL数量):" : "卖出数量(Token数量):"
        );
        setPayInText(
            select == "buy" ? "得到的数量(Token数量):" : "得到的数量(SOL数量):"
        );

        // 设置交易类型
        setIsBuyOperation(select == "buy" ? true : false);
    };

    return (
        <div>
            <h2>FanslandAI-交易计算</h2>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <label style={{ marginRight: "20px" }}>
                    <input
                        type="radio"
                        value="buy"
                        checked={selectedOption === "buy"}
                        onChange={handleOptionChange}
                    />
                    买入Token
                </label>
                <label>
                    <input
                        type="radio"
                        value="sell"
                        checked={selectedOption === "sell"}
                        onChange={handleOptionChange}
                    />
                    卖出Token
                </label>
            </div>

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

            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ marginRight: "20px" }}>
                    <label>{payOutText}</label>
                    <input
                        type="number"
                        value={payOutAmount}
                        onChange={(e) => setPayOutAmount(e.target.value)}
                        placeholder="请输入数量......"
                    />
                </div>
                <button onClick={handleCalculate}>开始计算</button>
            </div>

            <div>
                <label>{payInText}</label>
                <input type="text" value={payInAmount} disabled />
            </div>

            <div>
                <label>当前池中当前SOL数量: </label>
                <input type="text" value={curSolAmountInPool} disabled />
            </div>

            <div>
                <label>交易后池中SOL数量: </label>
                <input
                    type="text"
                    value={afterTradingSolAmountInPool}
                    disabled
                />
            </div>

            <div>
                <label>当前池中的Token数量: </label>
                <input type="text" value={tokenAmountInPool} disabled />
            </div>
            <div>
                <label>交易后池中的Token数量: </label>
                <input type="text" value={tokenAmountInPool} disabled />
            </div>

            <div>
                <label>最新成交价(市场价): </label>
                <input type="text" value={marketPrice} disabled />
            </div>
        </div>
    );
}
