"use client";
import { useState } from "react";

export default function Home() {
    const [bondingCurvePDA, setBondingCurvePDA] = useState("");
    const [tokenMint, setTokenMint] = useState("");
    const [solAmountInPool, setsolAmountInPool] = useState("");
    const [tokenAmountInPool, setTokenAmountInPool] = useState("");
    const [buyWillGetTokenAmount, setBuyWillGetTokenAmount] = useState("");
    const [buySolAmount, setBuySolAmount] = useState("");
    const [marketPrice, setMarketPrice] = useState("");

    const handleCalculate = () => {
        console.log("Calculation triggered");

        console.log("bondingCurvePDA = ", bondingCurvePDA);
        console.log("tokenMint = ", tokenMint);
        console.log("tokenAmountInPool = ", tokenAmountInPool);
        console.log("buyWillGetTokenAmount = ", buyWillGetTokenAmount);
        console.log("buySolAmount = ", buySolAmount);
        console.log("marketPrice = ", marketPrice);
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
                <label>池中的SOL数量</label>
                <input
                    type="text"
                    value={solAmountInPool}
                    // onChange={(e) => setSolAmount(e.target.value)}
                    // placeholder="input current SOL in pool"
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

            {/* <h2>卖出计算</h2>
            <div>
                <label>池中的Token数量</label>
                <input
                    type="text"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                />
            </div>
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
