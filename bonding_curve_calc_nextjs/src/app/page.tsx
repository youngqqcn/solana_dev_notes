"use client";
import { useState } from "react";
import * as web3 from "@solana/web3.js";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import {
    getAccount,
    getAssociatedTokenAddressSync,
    getMint,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

interface RespType {
    sol: number; // Adjust the type based on your actual data type
    token: number;
    // decimals: number;
}

interface TokenMintInfo {
    symbol: String;
    decimals: number;
    supply: number;
    mintAuthority: String;
}

export default function Home() {
    const K = 1073000000;
    const V = 32190000000;

    const [programId, setProgramId] = useState(
        "B8ncJu5LdBgPeDqfpHirUhr9nunpjvjB8tACc9X3kc3L"
    );

    const [bondingCurveATA, setBondingCurveATA] = useState("");
    const [bondingCurvePDA, setBondingCurvePDA] = useState("");
    const [tokenMint, setTokenMint] = useState("");

    // 虚拟池子， 注意与实际账户余额区分
    const [curSolAmountInPool, setCurSolAmountInPool] = useState("");
    const [afterTradingSolAmountInPool, setAfterTradingSolAmountInPool] =
        useState("");
    const [curTokenAmountInPool, setCurTokenAmountInPool] = useState("");
    const [afterTradingTokenAmountInPool, setAfterTradingTokenAmountInPool] =
        useState("");

    // bonding curve PDA 账户实际余额 , 注意和虚拟池子区分
    const [curBondingCurveSolAmount, setCurBondingCurvePDASolAmount] =
        useState("");
    const [curBondingCurveTokenAmount, setCurBondingCurveTokenAmount] =
        useState("");
    const [
        afterTradingBondingCurveSolAmount,
        setAfterTradingBondingCurveSolAmount,
    ] = useState("");
    const [
        afterTradingBondingCurveTokenAmount,
        setafterTradingBondingCurveTokenAmount,
    ] = useState("");

    const [payInAmount, setPayInAmount] = useState("");
    const [payOutAmount, setPayOutAmount] = useState("0.12");
    const [marketPrice, setMarketPrice] = useState("");

    // buy/sell 操作
    const [selectedOption, setSelectedOption] = useState("buy");
    const [isBuyOperation, setIsBuyOperation] = useState(true); // true: buy, false: sell

    // 付出的Token文案
    const [payOutText, setPayOutText] = useState(
        "你想买入的数量(SOL数量,不含1%手续费):"
    );
    const [payInText, setPayInText] = useState("你将得到的Token数量:");

    // 默认买入
    const [payInFormularImgPath, setPayInFormularImgPath] =
        useState("./formular_dy.png");

    // 公式
    const [priceFormularShow, setPriceFormularShow] = useState("");
    const [dydxFormularShow, setDyDxFormularShow] = useState("");

    // 设置token信息
    const [tokenInfoSymbol, setTokenInfoSymbol] = useState("-");
    const [tokenInfoSupply, setTokenInfoSupply] = useState("-");
    const [tokenInfoDecimals, setTokenInfoDecimals] = useState("-");
    const [tokenInfoCanMint, setTokenInfoCanMint] = useState("-");

    // loading
    const [btnLoading, setBtnLoading] = useState(false);

    // 交易手续费
    const [tradeFeeAmount, setTradeFeeAmount] = useState("");

    async function getTokenInfo(
        connection: Connection,
        _mintAddress: String
    ): Promise<TokenMintInfo> {
        try {
            // 创建 Mint 地址的 PublicKey 对象
            const mintPublicKey = new PublicKey(_mintAddress);

            // 获取 Mint 信息
            const mintInfo = await getMint(connection, mintPublicKey);

            // 尝试获取 Metaplex 元数据
            let nft = await Metaplex.make(connection).nfts().findByMint({
                mintAddress: mintPublicKey,
                loadJsonMetadata: true,
            });

            console.log("nft: {}", nft);

            // 获取 Token 账户的数据
            const accountInfo = await connection.getAccountInfo(mintPublicKey);

            if (!accountInfo) {
                throw new Error("Token 账户不存在");
            }

            return {
                symbol: nft.symbol,
                decimals: mintInfo.decimals,
                supply: Number(
                    mintInfo.supply / BigInt(Math.pow(10, mintInfo.decimals))
                ),
                mintAuthority:
                    mintInfo.mintAuthority === null
                        ? "null"
                        : mintInfo.mintAuthority.toBase58(),
            };
        } catch (error) {
            console.error("获取 Token 信息时出错:", error);
            throw error;
        }
    }

    function getBondingCurvePDA(tokenMint: String): [PublicKey, PublicKey] {
        let programIdAcc = new PublicKey(programId);

        // 计算存放 sol 的pda
        let [bondingCurvePda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("liquidity_sol_vault"),
                new PublicKey(tokenMint).toBuffer(),
            ],
            programIdAcc
        );
        console.log("Bonding Curve PDA 地址: ", bondingCurvePda.toBase58());

        let ataAcc = getAssociatedTokenAddressSync(
            new PublicKey(tokenMint),
            bondingCurvePda,
            true,
            TOKEN_PROGRAM_ID
        );
        return [bondingCurvePda, ataAcc];
    }

    async function getTokenBalance(
        connection: Connection,
        bondingCurvePDA: PublicKey,
        tokenMint: String
    ): Promise<RespType> {
        // 获取 SOL 余额
        console.log("存放SOL的地址: ", bondingCurvePDA.toBase58());
        let rawSolBalance = await connection.getBalance(bondingCurvePDA);

        // TODO: 这里要减去账户租金, 最保险的做法，应该读取PDA账户中的变量值
        // let accountSize = 0;
        // let rent = await connection.getMinimumBalanceForRentExemption(
        //     accountSize
        // );
        // console.log("rent =", rent);
        // console.log("rawSolBalance = ", rawSolBalance);
        let trueSolBalance = rawSolBalance;
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

    function clearText() {
        setTokenInfoSymbol("-");
        setTokenInfoSupply("-");
        setTokenInfoDecimals("-");
        setTokenInfoCanMint("-");

        setTradeFeeAmount("");

        setBondingCurvePDA("");
        setBondingCurveATA("");
        setDyDxFormularShow("");
        setPayInAmount("");
        setMarketPrice("");
        setPriceFormularShow("");
        setCurSolAmountInPool("");
        setCurTokenAmountInPool("");
        setAfterTradingSolAmountInPool("");
        setAfterTradingTokenAmountInPool("");

        // 链上Bonding Curve  PDA账户余额
        setCurBondingCurvePDASolAmount("");
        setAfterTradingBondingCurveSolAmount("");
        setCurBondingCurveTokenAmount("");
        setafterTradingBondingCurveTokenAmount("");
    }

    const handleCalculate = async () => {
        clearText();
        setBtnLoading(true);
        try {
            // let url = "https://api.devnet.solana.com";
            let url =
                "https://devnet.helius-rpc.com/?api-key=b3fdafcd-cf2e-4096-8b89-bb0ea8b44c38";
            let connection = new Connection(url);

            let tokenInfo = await getTokenInfo(connection, tokenMint);
            setTokenInfoSymbol(tokenInfo.symbol.toString());
            setTokenInfoSupply(tokenInfo.supply.toString());
            setTokenInfoDecimals(tokenInfo.decimals.toString());
            setTokenInfoCanMint(
                tokenInfo.mintAuthority == "null" ? "否" : "是"
            );

            let [bondingCurvePDARet, bondingCurveATARet] =
                getBondingCurvePDA(tokenMint);

            console.log("bondingCurvePDARet =====", bondingCurvePDARet);
            console.log("bondingCurveATARet =====", bondingCurveATARet);

            console.log("Calculation triggered");

            // const [bondingCurvePdaRet, tokenMintRet] =
            //     await getBondingCurvePDAByTokenATA(connection, bondingCurveATA);
            // console.log("tokenMintRet = ", tokenMintRet.toBase58());

            setBondingCurvePDA(bondingCurvePDARet.toBase58());
            setBondingCurveATA(bondingCurveATARet.toBase58());

            console.log("bondingCurvePDA = ", bondingCurvePDA);
            console.log("tokenMint = ", tokenMint);
            console.log("tokenAmountInPool = ", curTokenAmountInPool);
            console.log("marketPrice = ", marketPrice);
            console.log("payInAmount = ", payInAmount);
            console.log("payOutAmount = ", payOutAmount);

            let rsp = await getTokenBalance(
                connection,
                bondingCurvePDARet,
                tokenMint
            );
            console.log("======获取结果: ");
            console.log(rsp);

            // 计算买入
            let [dx, dy, mprice] = [0, 0, 0];
            if (isBuyOperation) {
                // 买入token
                let x = rsp.sol;
                let y = 1000000000 - rsp.token;
                dx = parseFloat(payOutAmount);
                dy = calc_buy_for_dy(x, dx);
                console.log("dy = ", dy);
                setDyDxFormularShow(
                    `Δy = ${dy
                        .toFixed(6)
                        .toString()} =(${V} * ${dx}) / ((30 + ${x}) * (30 + ${x} + ${dx}))`
                );

                // 计算最新成交价
                mprice = calc_market_price(x + dx);
                setPayInAmount(dy.toFixed(6).toString());
                setMarketPrice(mprice.toFixed(10).toString());
                setPriceFormularShow(
                    `price = ${mprice.toFixed(10).toString()} = (30 + (${x} + ${dx} )) * (30 + (${x} + ${dx})) / ${V}`
                );

                // 虚拟池子余额
                setCurSolAmountInPool(rsp.sol.toFixed(9).toString());
                setCurTokenAmountInPool(y.toFixed(6).toString());
                setAfterTradingSolAmountInPool(
                    (rsp.sol + dx).toFixed(9).toString()
                );
                setAfterTradingTokenAmountInPool(
                    (y + dy).toFixed(6).toString()
                );

                // 链上Bonding Curve  PDA账户余额
                setCurBondingCurvePDASolAmount(rsp.sol.toFixed(9).toString());
                setAfterTradingBondingCurveSolAmount(
                    (rsp.sol + dx).toFixed(9).toString()
                );
                setCurBondingCurveTokenAmount(rsp.token.toFixed(6).toString());
                setafterTradingBondingCurveTokenAmount(
                    (rsp.token - dy).toFixed(6).toString()
                );
            } else {
                // 卖出token
                let x = rsp.sol;
                // 注意: 总量减去现有的，才是真正卖出的，真正卖出的才是 虚拟池子中的 token数量
                let y = 1000000000 - rsp.token;
                console.log("y = ", y);
                dy = parseFloat(payOutAmount);
                dx = calc_sell_for_dx(y, dy);
                console.log("dx = ", dx);
                setDyDxFormularShow(
                    `Δx = ${dx
                        .toFixed(9)
                        .toString()} = (${V} * ${dy}) / ((${K} - ${y}) * (${K} - ${y} + ${dy}))`
                );

                // 计算手续费 1%
                let fee = (dx * Math.pow(10, 9)) / (Math.pow(10, 9) * 100);
                setTradeFeeAmount(fee.toFixed(9).toString());

                // 计算最新成交价
                mprice = calc_market_price(x - dx);
                setPayInAmount((dx - fee).toFixed(9).toString()); // 到手的 SOL, 扣除1%手续费

                setMarketPrice(mprice.toFixed(10).toString());
                setPriceFormularShow(
                    `price = ${mprice.toFixed(10).toString()} = (30 + (${x} - ${dx} )) * (30 + (${x} - ${dx})) / ${V}`
                );

                // 虚拟池子余额
                setCurSolAmountInPool(rsp.sol.toFixed(9).toString());
                setCurTokenAmountInPool(rsp.token.toFixed(6).toString());
                setAfterTradingSolAmountInPool(
                    (rsp.sol - dx).toFixed(9).toString()
                );
                setAfterTradingTokenAmountInPool(
                    (y - dy).toFixed(6).toString()
                );

                // 链上Bonding Curve  PDA账户余额
                setCurBondingCurvePDASolAmount(rsp.sol.toFixed(9).toString());
                setAfterTradingBondingCurveSolAmount(
                    (rsp.sol - dx).toFixed(9).toString()
                );
                setCurBondingCurveTokenAmount(rsp.token.toFixed(6).toString());
                setafterTradingBondingCurveTokenAmount(
                    (rsp.token + dy).toFixed(6).toString()
                );
            }
        } catch (error) {
            console.error("Error occured:", error);
        }
        setBtnLoading(false);
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
            select == "buy"
                ? "你想买入的数量(SOL的数量,不含手续费):"
                : "你想卖出的数量(Token的数量):"
        );
        setPayInText(
            select == "buy"
                ? "你将得到的Token数量:"
                : "你将得到的SOL数量(已扣除1%手续费):"
        );

        // 设置交易类型
        setIsBuyOperation(select == "buy" ? true : false);

        // 设置公式图片
        setPayInFormularImgPath(
            select == "buy" ? "./formular_dy.png" : "./formular_dx.png"
        );
    };

    return (
        <div>
            <h3>FanslandAI交易计算(程序ID: {programId} )</h3>

            <div style={{ display: "flex", flexDirection: "row" }}>
                <label>交易类型: </label>
                <label style={{ marginRight: "20px", color: "#218457" }}>
                    <input
                        type="radio"
                        value="buy"
                        checked={selectedOption === "buy"}
                        onChange={handleOptionChange}
                    />
                    <b>买入Token</b>
                </label>
                <label style={{ color: "#f80022" }}>
                    <input
                        type="radio"
                        value="sell"
                        checked={selectedOption === "sell"}
                        onChange={handleOptionChange}
                    />
                    <b>卖出Token</b>
                </label>
            </div>
            <br></br>

            <div>
                <label>Token Mint地址 : </label>
                <input
                    className="url-input"
                    type="text"
                    value={tokenMint}
                    onChange={(e) => {
                        let input = e.target.value;
                        if (
                            input.startsWith("https") &&
                            input.length >=
                                44 +
                                    "https://test-ai.fansland.xyz/trade/".length
                        ) {
                            let startIndex = input.indexOf("trade/") + 6;
                            let endIndex = startIndex + 44;
                            input = input.substring(startIndex, endIndex);
                        }

                        setTokenMint(input);
                    }}
                    placeholder="输入Token Mint地址"
                />
            </div>
            <br></br>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ marginRight: "20px" }}>
                    <label>{payOutText}</label>
                    <input
                        className="large-input"
                        type="number"
                        value={payOutAmount}
                        onChange={(e) => setPayOutAmount(e.target.value)}
                        placeholder="请输入数量......"
                    />
                </div>
                <button
                    className="my-button"
                    onClick={handleCalculate}
                    disabled={btnLoading}
                >
                    <label style={{ color: "#0000ff", fontSize: "bold" }}>
                        <b> {btnLoading ? "计算中..." : "开始计算"}</b>
                    </label>{" "}
                </button>
            </div>

            <hr></hr>

            <div>
                <label>
                    Token详细信息:{" "}
                    <a
                        href={
                            tokenMint === ""
                                ? ""
                                : `https://explorer.solana.com/address/${tokenMint}?cluster=devnet`
                        }
                    >
                        {tokenMint === "" ? "" : `${tokenMint}`}
                    </a>{" "}
                </label>
                <table className="my-table">
                    <tbody>
                        <tr>
                            <td>Token名称</td>
                            <td>总量</td>
                            <td>精度</td>
                            <td>能否可增发</td>
                        </tr>
                        <tr>
                            <td>{tokenInfoSymbol}</td>
                            <td>{tokenInfoSupply}</td>
                            <td>{tokenInfoDecimals}</td>
                            <td>{tokenInfoCanMint}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <hr></hr>
            <div>
                <label>{payInText} </label>
                <span>{payInAmount}</span>
                <code>
                    {isBuyOperation
                        ? ""
                        : payInAmount.length > 0
                        ? ` (${payInAmount} = ${Number(
                              Number(payInAmount) + Number(tradeFeeAmount)
                          )
                              .toFixed(9)
                              .toString()} - ${Number(tradeFeeAmount)
                              .toFixed(9)
                              .toString()}`
                        : ""}
                    )
                </code>
                <div>
                    <label>
                        {" "}
                        计算公式: <code>{dydxFormularShow}</code>{" "}
                    </label>
                </div>
                <img src={payInFormularImgPath} />
            </div>

            <hr></hr>

            <div>
                <div>
                    <label>交易后最新成交价(市场价): </label>
                    <span>{marketPrice}</span>
                    <div>
                        <label>
                            计算公式: <code>{priceFormularShow} </code>
                        </label>
                    </div>
                </div>
                <img src="./formular_price.png" />
            </div>

            <hr></hr>

            <div>
                <label>当前虚拟池中当前SOL数量: </label>
                <span>{curSolAmountInPool}</span>
            </div>

            <div>
                <label>交易后虚拟池中SOL数量: </label>
                <span>{afterTradingSolAmountInPool}</span>
            </div>

            <div>
                <label>当前虚拟池中的Token数量: </label>
                <span>{curTokenAmountInPool}</span>
            </div>
            <div>
                <label>交易后虚拟池中的Token数量: </label>
                <span>{afterTradingTokenAmountInPool}</span>
            </div>

            <hr></hr>

            <div>
                <label>BondingCurve PDA地址 : </label>
                <a
                    href={`https://explorer.solana.com/address/${bondingCurvePDA}?cluster=devnet`}
                >
                    {bondingCurvePDA}
                </a>
            </div>

            <div>
                <label>BondingCurve ATA地址: </label>
                <a
                    href={`https://explorer.solana.com/address/${bondingCurveATA}?cluster=devnet`}
                >
                    {bondingCurveATA}
                </a>
            </div>

            <div>
                <label>当前BondingCurve的Token余额: </label>
                <span>{curBondingCurveTokenAmount}</span>
            </div>

            <div>
                <label>交易后BondingCurve的Token余额: </label>
                <span>{afterTradingBondingCurveTokenAmount}</span>
            </div>
            <div>
                <label>当前BondingCurve的SOL余额: </label>
                <span>{curBondingCurveSolAmount}</span>
            </div>
            <div>
                <label>交易后BondingCurve的SOL余额: </label>
                <span>{afterTradingBondingCurveSolAmount}</span>
            </div>

            <hr></hr>
        </div>
    );
}
