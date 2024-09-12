"use client";
import { useEffect, useState } from "react";
import * as web3 from "@solana/web3.js";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import {
    getAccount,
    getAssociatedTokenAddressSync,
    getMint,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import * as anchor from "@project-serum/anchor";
// import idl from "../../pump_fun_idl.json";
import { AnchorProvider } from "@project-serum/anchor";

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

class CustomWallet implements anchor.Wallet {
    public payer: web3.Keypair;
    public publicKey: PublicKey;
    constructor() {
        this.payer = web3.Keypair.generate();
        this.publicKey = this.payer.publicKey;
    }

    async signTransaction(
        transaction: web3.Transaction
    ): Promise<web3.Transaction> {
        // Implement transaction signing
        return transaction;
    }

    async signAllTransactions(
        transactions: web3.Transaction[]
    ): Promise<web3.Transaction[]> {
        // Implement signing of multiple transactions
        return transactions;
    }
}

export default function Home() {
    const K = 1073000000;
    const V = 32190000000;

    const [programId, setProgramId] = useState(
        "3RRdft47XcU6ziG3f5W99soJzaaChFDCMQzmemKpWfLB"
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
    const [tradeOption, setSelectedOption] = useState("buy");
    const [isBuyOperation, setIsBuyOperation] = useState(true); // true: buy, false: sell

    // 付出的Token文案
    const [payOutText, setPayOutText] = useState("买入数量:");
    const [payInText, setPayInText] = useState("将得到的Token数量:");

    // 默认买入
    const [payInFormularImgPath, setPayInFormularImgPath] = useState(
        "./formular_buy_dy.png"
    );

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

    // 按SOL 或 按Token
    const [calcByOption, setCalcByOption] = useState("calcBySOL");
    // const [calcBySymbolText, calcBySymbolText]

    useEffect(() => {
        if (tradeOption === "sell") {
            setCalcByOption("calcByToken");
        }
    }, [tradeOption]);

    useEffect(() => {
        // 更新图片基于交易类型和计算方式
        if (tradeOption === "buy") {
            if (calcByOption === "calcBySOL") {
                setPayInFormularImgPath("./formular_buy_dy.png");
            } else {
                setPayInFormularImgPath("./formular_buy_dx.png");
            }
        } else {
            setPayInFormularImgPath("./formular_sell_dx.png");
        }
    }, [tradeOption, calcByOption]);

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
        let trueSolBalance = rawSolBalance - 0.002 * Math.pow(10, 9);
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

    function calc_buy_for_dx(x: number, dy: number) {
        // 买入， 按照token计算
        const k = 1073000000;
        const v = 32190000000;
        const dx = (dy * (30 + x) * (30 + x)) / (v - dy * (30 + x));
        return dx;
    }

    function calc_buy_for_dy(x: number, dx: number): number {
        // 买入， 按照 SOL计算
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

    async function fetchPumpFunc() {
        let idl_str = `{"version":"0.1.0","name":"pump","instructions":[{"name":"initialize","docs":["Creates the global state."],"accounts":[{"name":"global","isMut":true,"isSigner":false},{"name":"user","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[]},{"name":"setParams","docs":["Sets the global state parameters."],"accounts":[{"name":"global","isMut":true,"isSigner":false},{"name":"user","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false},{"name":"eventAuthority","isMut":false,"isSigner":false},{"name":"program","isMut":false,"isSigner":false}],"args":[{"name":"feeRecipient","type":"publicKey"},{"name":"initialVirtualTokenReserves","type":"u64"},{"name":"initialVirtualSolReserves","type":"u64"},{"name":"initialRealTokenReserves","type":"u64"},{"name":"tokenTotalSupply","type":"u64"},{"name":"feeBasisPoints","type":"u64"}]},{"name":"create","docs":["Creates a new coin and bonding curve."],"accounts":[{"name":"mint","isMut":true,"isSigner":true},{"name":"mintAuthority","isMut":false,"isSigner":false},{"name":"bondingCurve","isMut":true,"isSigner":false},{"name":"associatedBondingCurve","isMut":true,"isSigner":false},{"name":"global","isMut":false,"isSigner":false},{"name":"mplTokenMetadata","isMut":false,"isSigner":false},{"name":"metadata","isMut":true,"isSigner":false},{"name":"user","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false},{"name":"tokenProgram","isMut":false,"isSigner":false},{"name":"associatedTokenProgram","isMut":false,"isSigner":false},{"name":"rent","isMut":false,"isSigner":false},{"name":"eventAuthority","isMut":false,"isSigner":false},{"name":"program","isMut":false,"isSigner":false}],"args":[{"name":"name","type":"string"},{"name":"symbol","type":"string"},{"name":"uri","type":"string"}]},{"name":"buy","docs":["Buys tokens from a bonding curve."],"accounts":[{"name":"global","isMut":false,"isSigner":false},{"name":"feeRecipient","isMut":true,"isSigner":false},{"name":"mint","isMut":false,"isSigner":false},{"name":"bondingCurve","isMut":true,"isSigner":false},{"name":"associatedBondingCurve","isMut":true,"isSigner":false},{"name":"associatedUser","isMut":true,"isSigner":false},{"name":"user","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false},{"name":"tokenProgram","isMut":false,"isSigner":false},{"name":"rent","isMut":false,"isSigner":false},{"name":"eventAuthority","isMut":false,"isSigner":false},{"name":"program","isMut":false,"isSigner":false}],"args":[{"name":"amount","type":"u64"},{"name":"maxSolCost","type":"u64"}]},{"name":"sell","docs":["Sells tokens into a bonding curve."],"accounts":[{"name":"global","isMut":false,"isSigner":false},{"name":"feeRecipient","isMut":true,"isSigner":false},{"name":"mint","isMut":false,"isSigner":false},{"name":"bondingCurve","isMut":true,"isSigner":false},{"name":"associatedBondingCurve","isMut":true,"isSigner":false},{"name":"associatedUser","isMut":true,"isSigner":false},{"name":"user","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false},{"name":"associatedTokenProgram","isMut":false,"isSigner":false},{"name":"tokenProgram","isMut":false,"isSigner":false},{"name":"eventAuthority","isMut":false,"isSigner":false},{"name":"program","isMut":false,"isSigner":false}],"args":[{"name":"amount","type":"u64"},{"name":"minSolOutput","type":"u64"}]},{"name":"withdraw","docs":["Allows the admin to withdraw liquidity for a migration once the bonding curve completes"],"accounts":[{"name":"global","isMut":false,"isSigner":false},{"name":"lastWithdraw","isMut":true,"isSigner":false},{"name":"mint","isMut":false,"isSigner":false},{"name":"bondingCurve","isMut":true,"isSigner":false},{"name":"associatedBondingCurve","isMut":true,"isSigner":false},{"name":"associatedUser","isMut":true,"isSigner":false},{"name":"user","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false},{"name":"tokenProgram","isMut":false,"isSigner":false},{"name":"rent","isMut":false,"isSigner":false},{"name":"eventAuthority","isMut":false,"isSigner":false},{"name":"program","isMut":false,"isSigner":false}],"args":[]}],"accounts":[{"name":"Global","type":{"kind":"struct","fields":[{"name":"initialized","type":"bool"},{"name":"authority","type":"publicKey"},{"name":"feeRecipient","type":"publicKey"},{"name":"initialVirtualTokenReserves","type":"u64"},{"name":"initialVirtualSolReserves","type":"u64"},{"name":"initialRealTokenReserves","type":"u64"},{"name":"tokenTotalSupply","type":"u64"},{"name":"feeBasisPoints","type":"u64"}]}},{"name":"LastWithdraw","type":{"kind":"struct","fields":[{"name":"lastWithdrawTimestamp","type":"i64"}]}},{"name":"BondingCurve","type":{"kind":"struct","fields":[{"name":"virtualTokenReserves","type":"u64"},{"name":"virtualSolReserves","type":"u64"},{"name":"realTokenReserves","type":"u64"},{"name":"realSolReserves","type":"u64"},{"name":"tokenTotalSupply","type":"u64"},{"name":"complete","type":"bool"}]}}],"events":[{"name":"CreateEvent","fields":[{"name":"name","type":"string","index":false},{"name":"symbol","type":"string","index":false},{"name":"uri","type":"string","index":false},{"name":"mint","type":"publicKey","index":false},{"name":"bondingCurve","type":"publicKey","index":false},{"name":"user","type":"publicKey","index":false}]},{"name":"TradeEvent","fields":[{"name":"mint","type":"publicKey","index":false},{"name":"solAmount","type":"u64","index":false},{"name":"tokenAmount","type":"u64","index":false},{"name":"isBuy","type":"bool","index":false},{"name":"user","type":"publicKey","index":false},{"name":"timestamp","type":"i64","index":false},{"name":"virtualSolReserves","type":"u64","index":false},{"name":"virtualTokenReserves","type":"u64","index":false},{"name":"realSolReserves","type":"u64","index":false},{"name":"realTokenReserves","type":"u64","index":false}]},{"name":"CompleteEvent","fields":[{"name":"user","type":"publicKey","index":false},{"name":"mint","type":"publicKey","index":false},{"name":"bondingCurve","type":"publicKey","index":false},{"name":"timestamp","type":"i64","index":false}]},{"name":"SetParamsEvent","fields":[{"name":"feeRecipient","type":"publicKey","index":false},{"name":"initialVirtualTokenReserves","type":"u64","index":false},{"name":"initialVirtualSolReserves","type":"u64","index":false},{"name":"initialRealTokenReserves","type":"u64","index":false},{"name":"tokenTotalSupply","type":"u64","index":false},{"name":"feeBasisPoints","type":"u64","index":false}]}],"errors":[{"code":6000,"name":"NotAuthorized","msg":"The given account is not authorized to execute this instruction."},{"code":6001,"name":"AlreadyInitialized","msg":"The program is already initialized."},{"code":6002,"name":"TooMuchSolRequired","msg":"slippage: Too much SOL required to buy the given amount of tokens."},{"code":6003,"name":"TooLittleSolReceived","msg":"slippage: Too little SOL received to sell the given amount of tokens."},{"code":6004,"name":"MintDoesNotMatchBondingCurve","msg":"The mint does not match the bonding curve."},{"code":6005,"name":"BondingCurveComplete","msg":"The bonding curve has completed and liquidity migrated to raydium."},{"code":6006,"name":"BondingCurveNotComplete","msg":"The bonding curve has not completed."},{"code":6007,"name":"NotInitialized","msg":"The program is not initialized."},{"code":6008,"name":"WithdrawTooFrequent","msg":"Withdraw too frequent"}]}`;
        const idl = JSON.parse(idl_str);

        const provider = new AnchorProvider(
            new Connection(
                // "https://devnet.helius-rpc.com/?api-key=b3fdafcd-cf2e-4096-8b89-bb0ea8b44c38" // devnet
                "https://mainnet.helius-rpc.com/?api-key=b3fdafcd-cf2e-4096-8b89-bb0ea8b44c38" // 主网
            ),
            new CustomWallet(), // 实际可使用钱包适配器
            AnchorProvider.defaultOptions()
        );
        anchor.setProvider(provider);

        let pumpProgramId = new web3.PublicKey(
            "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
        );
        let [gb] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("global")],
            pumpProgramId
        );
        console.log("===pda: ", gb.toBase58());

        const program = new anchor.Program(
            idl as anchor.Idl,
            pumpProgramId,
            provider
        );

        let accInfo = await program.account.global.fetch(gb);
        console.log(accInfo);
        console.log(JSON.stringify(accInfo));

        console.log(
            "initialVirtualTokenReserves: ",
            accInfo.initialVirtualTokenReserves.toString()
        );
        console.log(
            "initialVirtualSolReserves: ",
            accInfo.initialVirtualSolReserves.toString()
        );
        console.log(
            "initialRealTokenReserves: ",
            accInfo.initialRealTokenReserves.toString()
        );
        console.log("tokenTotalSupply: ", accInfo.tokenTotalSupply.toString());
        console.log("feeBasisPoints: ", accInfo.feeBasisPoints.toString());
    }

    async function fecthFanslandAI() {
        const idlStr = `{"version":"0.1.0","name":"bonding_curve","instructions":[{"name":"calSol","accounts":[],"args":[{"name":"calType","type":"u8"},{"name":"reserveSol","type":"u64"},{"name":"tokenAmount","type":"u64"},{"name":"reserveToken","type":"u64"}]},{"name":"initialize","accounts":[{"name":"dexConfigurationAccount","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"CurveConfiguration"}]}},{"name":"poolAuthority","isMut":true,"isSigner":false},{"name":"feeCollector","isMut":true,"isSigner":false},{"name":"admin","isMut":true,"isSigner":true},{"name":"rent","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"buyFee","type":"u64"},{"name":"sellFee","type":"u64"},{"name":"lunchFee","type":"u64"}]},{"name":"updateFee","accounts":[{"name":"dexConfigurationAccount","isMut":false,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"CurveConfiguration"}]}},{"name":"admin","isMut":true,"isSigner":true},{"name":"rent","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"buyFee","type":"u64"},{"name":"sellFee","type":"u64"},{"name":"lunchFee","type":"u64"}]},{"name":"updatePoolAuthority","accounts":[{"name":"dexConfigurationAccount","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"CurveConfiguration"}]}},{"name":"poolAuthority","isMut":true,"isSigner":false},{"name":"feeCollector","isMut":true,"isSigner":false},{"name":"admin","isMut":true,"isSigner":true},{"name":"rent","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[]},{"name":"updateFeeCollector","accounts":[{"name":"dexConfigurationAccount","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"CurveConfiguration"}]}},{"name":"feeCollector","isMut":true,"isSigner":false},{"name":"admin","isMut":true,"isSigner":true},{"name":"rent","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[]},{"name":"createPool","accounts":[{"name":"pool","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"liquidity_pool"},{"kind":"account","type":"publicKey","account":"Mint","path":"token_mint"}]}},{"name":"tokenMint","isMut":true,"isSigner":true},{"name":"poolTokenAccount","isMut":true,"isSigner":false},{"name":"poolSolVault","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"liquidity_sol_vault"},{"kind":"account","type":"publicKey","account":"Mint","path":"token_mint"}]}},{"name":"poolAuthority","isMut":true,"isSigner":false},{"name":"feeCollector","isMut":true,"isSigner":false},{"name":"metadataAccount","isMut":true,"isSigner":false},{"name":"dexConfigurationAccount","isMut":false,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"CurveConfiguration"}]}},{"name":"payer","isMut":true,"isSigner":true},{"name":"tokenProgram","isMut":false,"isSigner":false},{"name":"associatedTokenProgram","isMut":false,"isSigner":false},{"name":"tokenMetadataProgram","isMut":false,"isSigner":false},{"name":"rent","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"tokenName","type":"string"},{"name":"tokenSymbol","type":"string"},{"name":"tokenUri","type":"string"}]},{"name":"buy","accounts":[{"name":"dexConfigurationAccount","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"CurveConfiguration"}]}},{"name":"pool","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"liquidity_pool"},{"kind":"account","type":"publicKey","account":"Mint","path":"token_mint"}]}},{"name":"tokenMint","isMut":true,"isSigner":false},{"name":"poolTokenAccount","isMut":true,"isSigner":false},{"name":"poolSolVault","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"liquidity_sol_vault"},{"kind":"account","type":"publicKey","account":"Mint","path":"token_mint"}]}},{"name":"userTokenAccount","isMut":true,"isSigner":false},{"name":"feeCollector","isMut":true,"isSigner":false},{"name":"user","isMut":true,"isSigner":true},{"name":"rent","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false},{"name":"tokenProgram","isMut":false,"isSigner":false},{"name":"associatedTokenProgram","isMut":false,"isSigner":false}],"args":[{"name":"amount","type":"u64"},{"name":"expectedAmount","type":"u64"}]},{"name":"sell","accounts":[{"name":"dexConfigurationAccount","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"CurveConfiguration"}]}},{"name":"pool","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"liquidity_pool"},{"kind":"account","type":"publicKey","account":"Mint","path":"token_mint"}]}},{"name":"tokenMint","isMut":true,"isSigner":false},{"name":"poolTokenAccount","isMut":true,"isSigner":false},{"name":"poolSolVault","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"liquidity_sol_vault"},{"kind":"account","type":"publicKey","account":"Mint","path":"token_mint"}]}},{"name":"userTokenAccount","isMut":true,"isSigner":false},{"name":"feeCollector","isMut":true,"isSigner":false},{"name":"user","isMut":true,"isSigner":true},{"name":"rent","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false},{"name":"tokenProgram","isMut":false,"isSigner":false},{"name":"associatedTokenProgram","isMut":false,"isSigner":false}],"args":[{"name":"amount","type":"u64"},{"name":"bump","type":"u8"},{"name":"expectedAmount","type":"u64"}]},{"name":"withdrawLiquidity","accounts":[{"name":"pool","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"liquidity_pool"},{"kind":"account","type":"publicKey","account":"Mint","path":"token_mint"}]}},{"name":"tokenMint","isMut":true,"isSigner":false},{"name":"poolTokenAccount","isMut":true,"isSigner":false},{"name":"userTokenAccount","isMut":true,"isSigner":false},{"name":"poolSolVault","isMut":true,"isSigner":false,"pda":{"seeds":[{"kind":"const","type":"string","value":"liquidity_sol_vault"},{"kind":"account","type":"publicKey","account":"Mint","path":"token_mint"}]}},{"name":"user","isMut":true,"isSigner":true},{"name":"rent","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false},{"name":"tokenProgram","isMut":false,"isSigner":false},{"name":"associatedTokenProgram","isMut":false,"isSigner":false}],"args":[{"name":"bump","type":"u8"}]}],"accounts":[{"name":"CurveConfiguration","type":{"kind":"struct","fields":[{"name":"buyFee","type":"u64"},{"name":"sellFee","type":"u64"},{"name":"lunchFee","type":"u64"},{"name":"poolAuthority","type":"publicKey"},{"name":"feeCollector","type":"publicKey"},{"name":"updateAuthority","type":"publicKey"}]}},{"name":"LiquidityPool","type":{"kind":"struct","fields":[{"name":"poolAuthority","type":"publicKey"},{"name":"creator","type":"publicKey"},{"name":"token","type":"publicKey"},{"name":"totalSupply","type":"u64"},{"name":"reserveToken","type":"u64"},{"name":"reserveSol","type":"u64"},{"name":"bump","type":"u8"},{"name":"closeStatus","type":"u8"},{"name":"relReserveToken","type":"u64"},{"name":"relReserveSol","type":"u64"}]}}],"errors":[{"code":6000,"name":"DuplicateTokenNotAllowed","msg":"Duplicate tokens are not allowed"},{"code":6001,"name":"FailedToAllocateShares","msg":"Failed to allocate shares"},{"code":6002,"name":"FailedToDeallocateShares","msg":"Failed to deallocate shares"},{"code":6003,"name":"InsufficientShares","msg":"Insufficient shares"},{"code":6004,"name":"InsufficientFunds","msg":"Insufficient funds to swap"},{"code":6005,"name":"InvalidAmount","msg":"Invalid amount to swap"},{"code":6006,"name":"InvalidFee","msg":"Invalid fee"},{"code":6007,"name":"FailedToAddLiquidity","msg":"Failed to add liquidity"},{"code":6008,"name":"FailedToRemoveLiquidity","msg":"Failed to remove liquidity"},{"code":6009,"name":"NotEnoughToRemove","msg":"Sold token is not enough to remove pool"},{"code":6010,"name":"NotCreator","msg":"Not a pool creator"},{"code":6011,"name":"OverflowOrUnderflowOccurred","msg":"Overflow or underflow occured"},{"code":6012,"name":"TokenAmountToSellTooBig","msg":"Token amount is too big to sell"},{"code":6013,"name":"NotEnoughSolInVault","msg":"SOL is not enough in vault"},{"code":6014,"name":"NotEnoughTokenInVault","msg":"Token is not enough in vault"},{"code":6015,"name":"NegativeNumber","msg":"Amount is negative"},{"code":6016,"name":"NotPower","msg":"No power"},{"code":6017,"name":"ToDex","msg":"Please to dex"},{"code":6018,"name":"AccountErr","msg":"account error"},{"code":6019,"name":"WithinSlippage","msg":"The price is not appropriate"},{"code":6020,"name":"TradeOnRay","msg":"The bonding curve has completed and liquidity migrated to raydium"}]}`;
        const idl = JSON.parse(idlStr);

        const provider = new AnchorProvider(
            new Connection(
                "https://devnet.helius-rpc.com/?api-key=b3fdafcd-cf2e-4096-8b89-bb0ea8b44c38" // devnet
                // "https://mainnet.helius-rpc.com/?api-key=b3fdafcd-cf2e-4096-8b89-bb0ea8b44c38" // 主网
            ),
            new CustomWallet(), // 实际可使用钱包适配器, 或者 phantom钱包
            AnchorProvider.defaultOptions()
        );
        anchor.setProvider(provider);

        let fanslandProgramId = new web3.PublicKey(
            "6pFVNRitagzVvP3Eh46bUtEyTGYg3bRJrfRrqLryz6kn"
        );

        let [liquidityPoolPDA] = web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("liquidity_pool"),
                new web3.PublicKey(
                    "EqvhmDM6HxgPBsa4YDA65uPy5S8PGH1UHk3o3spSCEmE" // token mint
                ).toBytes(),
            ],
            fanslandProgramId
        );
        console.log("===liquidity_pool pda: ", liquidityPoolPDA.toBase58());

        const program = new anchor.Program(
            idl as anchor.Idl,
            fanslandProgramId,
            provider
        );

        console.log(program.account);
        let accInfo = await program.account.liquidityPool.fetch(
            liquidityPoolPDA
        );
        console.log(accInfo);
        console.log("totalSupply: ", accInfo.totalSupply.toString());
        console.log("reserveToken: ", accInfo.reserveToken); // BN 类型
        console.log("reserveToken: ", accInfo.reserveToken.toString());
        console.log("reserveSol: ", accInfo.reserveSol.toString());
        console.log("relReserveToken: ", accInfo.relReserveToken.toString());
        console.log("relReserveSol: ", accInfo.relReserveSol.toString());
    }

    const handleCalculate = async () => {
        // await fetchPumpFunc();
        await fecthFanslandAI();

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
                if (calcByOption == "calcBySOL") {
                    console.log("买入，按照SOL计算");
                    // 买入token, 按照 SOL计算
                    let x = rsp.sol;
                    let y = 1000000000 - rsp.token;
                    dx = parseFloat(payOutAmount);
                    dy = calc_buy_for_dy(x, dx);
                    console.log("dy = ", dy);
                    setDyDxFormularShow(
                        `Δy = ${dy
                            .toFixed(6)
                            .toString()} = (${V} * ${dx}) / ((30 + ${x}) * (30 + ${x} + ${dx}))`
                    );

                    // 计算最新成交价
                    mprice = calc_market_price(x + dx);
                    setPayInAmount(dy.toFixed(6).toString());
                    setMarketPrice(mprice.toFixed(10).toString());
                    setPriceFormularShow(
                        `price = ${mprice
                            .toFixed(10)
                            .toString()} = (30 + (${x} + ${dx} )) * (30 + (${x} + ${dx})) / ${V}`
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
                    setCurBondingCurvePDASolAmount(
                        rsp.sol.toFixed(9).toString()
                    );
                    setAfterTradingBondingCurveSolAmount(
                        (rsp.sol + dx).toFixed(9).toString()
                    );
                    setCurBondingCurveTokenAmount(
                        rsp.token.toFixed(6).toString()
                    );
                    setafterTradingBondingCurveTokenAmount(
                        (rsp.token - dy).toFixed(6).toString()
                    );
                } else {
                    // 按照Token计算
                    console.log("买入，按照token计算");

                    let x = rsp.sol;
                    let y = 1000000000 - rsp.token;
                    dy = parseFloat(payOutAmount);
                    dx = calc_buy_for_dx(x, dy);
                    console.log("dx = ", dx);

                    setDyDxFormularShow(
                        `Δx = ${dx
                            .toFixed(9)
                            .toString()} = (${dy} * (30 + ${x})*(30 + ${x})) / (${V} - ${dy} * (30 + ${x}))`
                    );

                    // 计算最新成交价
                    mprice = calc_market_price(x + dx);
                    setPayInAmount(dx.toFixed(9).toString());
                    setMarketPrice(mprice.toFixed(10).toString());
                    setPriceFormularShow(
                        `price = ${mprice
                            .toFixed(10)
                            .toString()} = (30 + (${x} + ${dx} )) * (30 + (${x} + ${dx})) / ${V}`
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
                    setCurBondingCurvePDASolAmount(
                        rsp.sol.toFixed(9).toString()
                    );
                    setAfterTradingBondingCurveSolAmount(
                        (rsp.sol + dx).toFixed(9).toString()
                    );
                    setCurBondingCurveTokenAmount(
                        rsp.token.toFixed(6).toString()
                    );
                    setafterTradingBondingCurveTokenAmount(
                        (rsp.token - dy).toFixed(6).toString()
                    );
                }
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
                    `price = ${mprice
                        .toFixed(10)
                        .toString()} = (30 + (${x} - ${dx} )) * (30 + (${x} - ${dx})) / ${V}`
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
        setPayOutText(select == "buy" ? "买入的数量:" : "卖出的数量:");

        // 设置交易类型
        setIsBuyOperation(select == "buy" ? true : false);

        if (select == "buy") {
            if (calcByOption.toString() === "calcByToken") {
                setPayInText("将付出的SOL数量(不含手续费): ");
            } else if (calcByOption.toString() === "calcBySOL") {
                setPayInText("将得到的Token数量(不含手续费): ");
            }
        } else {
            if (select == "sell") {
                setPayInText("将得到的SOL数量(已扣手续费): ");
            }
        }
    };

    function handleCalcByOption(event: any): void {
        // throw new Error("Function not implemented.");
        let select: String = event.target.value.toString();

        setCalcByOption(select.toString());

        if (tradeOption == "buy") {
            if (select.toString() === "calcByToken") {
                setPayInText("将付出的SOL数量(不含手续费): ");
            } else if (select.toString() === "calcBySOL") {
                setPayInText("将得到的Token数量(不含手续费): ");
            }
        } else {
            if (select == "sell") {
                setPayInText("将得到的SOL数量(未扣手续费): ");
            }
        }
    }

    return (
        <div>
            <h3>FanslandAI交易计算(程序ID: {programId} )</h3>
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
                <label>交易类型: </label>
                <label style={{ marginRight: "20px", color: "#218457" }}>
                    <input
                        type="radio"
                        value="buy"
                        checked={tradeOption === "buy"}
                        onChange={handleOptionChange}
                    />
                    <b>买入Token</b>
                </label>

                <label style={{ color: "#f80022" }}>
                    <input
                        type="radio"
                        value="sell"
                        checked={tradeOption === "sell"}
                        onChange={handleOptionChange}
                    />
                    <b>卖出Token</b>
                </label>
            </div>
            <br></br>

            <div>
                <label>计算方式: </label>
                <label style={{ marginRight: "20px" }}>
                    <input
                        type="radio"
                        value="calcBySOL"
                        checked={calcByOption == "calcBySOL"}
                        onChange={handleCalcByOption}
                        disabled={tradeOption === "sell"}
                    />
                    <span>按SOL数量</span>
                </label>
                <label>
                    <input
                        type="radio"
                        value="calcByToken"
                        checked={calcByOption == "calcByToken"}
                        onChange={handleCalcByOption}
                    />
                    <span>按Token数量</span>
                </label>
            </div>

            <br></br>

            <div style={{ display: "flex", flexDirection: "row" }}>
                <div className="my-input-container">
                    <label>{payOutText}</label>
                    <input
                        className="my-input"
                        type="number"
                        value={payOutAmount}
                        onChange={(e) => setPayOutAmount(e.target.value)}
                        placeholder="请输入数量......"
                    />
                    <span className="currency-label">
                        {" "}
                        {calcByOption === "calcBySOL"
                            ? "SOL"
                            : tokenInfoSymbol === "-"
                            ? "Token"
                            : tokenInfoSymbol}
                    </span>
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
                            <td>能否增发</td>
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
