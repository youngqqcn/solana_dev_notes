/* global BigInt */

import {
  Box,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  TransactionInstruction,
} from "@solana/web3.js";
import React, { useContext, useEffect, useState } from "react";
import { useRef } from "react";
import Layout from "../../layouts";
import { enqueueSnackbar } from "notistack";
import {getMinimumBalanceForRentExemptMint,
  createInitializeMint2Instruction,
  getAssociatedTokenAddressSync,
  getAccount,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  MINT_SIZE} from "@solana/spl-token";

import {
  useConnection,
  useWallet,
  ConnectionContext,
  WalletContext,
} from "@solana/wallet-adapter-react";
import { Buffer } from 'buffer';

// @ts-ignore
window.Buffer = Buffer;

// mint接受代币的地址
const TO_PUBLIC_KEY = new PublicKey("38jEaxphBTa3NEg4K6nG8Zgs6eVsSsr9AoSZCfax2pH8");

// 这个是系统的, 固定即可
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

// 这个是系统的，固定即可, https://explorer.solana.com/address/ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL?cluster=devnet
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');


export default function HomePage() {
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState(0);
  const [toPublicKey, setToPublicKey] = useState(TO_PUBLIC_KEY);
  const [toCount, setToCount] = useState(1000000000);
  const { connection } = useConnection();
  let [mintKeypair, setMintKeypair] = useState(null);
  let [ataAccount, setAtaAccount] = useState(null);
  const onToPublicKey = (e) => {
    setToPublicKey(e.target.value);
  };

  const onToCount = (e) => {
    setToCount(e.target.value * LAMPORTS_PER_SOL);
  };



  const onCreateToken = async () => {
    mintKeypair = Keypair.generate();
    setMintKeypair(mintKeypair);
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    console.log("publick:", publicKey);
    console.log(`lamports:${lamports}`);
    console.log(`mint:${mintKeypair.publicKey}`)
    const txInstructions = [
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports:lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(mintKeypair.publicKey,
        9,
        publicKey,
        publicKey,
        TOKEN_PROGRAM_ID)
    ];

    console.log("txi : ", txInstructions);
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();
    //let latestBlockhash = await connection.getLatestBlockhash("finalized");
    enqueueSnackbar(
      `   ✅ - Fetched latest blockhash. Last Valid Height:
      ${lastValidBlockHeight}`
    );
    console.log("slot:", minContextSlot);
    console.log("latestBlockhash:", blockhash);

    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: txInstructions,
    }).compileToV0Message();

    const trx = new VersionedTransaction(messageV0);
    const signature = await sendTransaction(trx, connection, {
      minContextSlot,
      signers:[mintKeypair],
    });
    console.log("signature:", signature);

    enqueueSnackbar(
      `   ✅ - Create Token:
      ${mintKeypair.publicKey}`
    );
  };

  const onMint = async () => {
    const owner = new PublicKey(toPublicKey);
    console.log(owner);
    console.log("mintKeypair:",mintKeypair);
    console.log("mintKeypair:", mintKeypair.publicKey);
    ataAccount = await getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      owner,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log("ata ", ataAccount);
    setAtaAccount(ataAccount);


    let  txInstructions = [];
    try {
        await getAccount(connection, ataAccount);
    } catch (error) {
      txInstructions.push(
          createAssociatedTokenAccountInstruction(
              publicKey,
              ataAccount,
              owner,
              mintKeypair.publicKey,
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
          )
      );
    }
    console.log("toCount:", toCount);
    txInstructions.push(
      createMintToInstruction(
        mintKeypair.publicKey,
        ataAccount,
        publicKey,
        BigInt(toCount)
      )
    );


    console.log("txi : ", txInstructions);
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();
    //let latestBlockhash = await connection.getLatestBlockhash("finalized");
    enqueueSnackbar(
      `   ✅ - Fetched latest blockhash. Last Valid Height:
      ${lastValidBlockHeight}`
    );
    console.log("slot:", minContextSlot);
    console.log("latestBlockhash:", blockhash);

    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: txInstructions,
    }).compileToV0Message();

    const trx = new VersionedTransaction(messageV0);
    const signature = await sendTransaction(trx, connection, {
      minContextSlot
    });
    console.log("signature:", signature);
    console.log(`   ✅ - Mint Token ${toCount/LAMPORTS_PER_SOL} to ${ataAccount}`)
    enqueueSnackbar(
      `   ✅ - Mint Token ${toCount/LAMPORTS_PER_SOL} to ${ataAccount}`
    );
  };

  const onBalance = () => {
    connection.getTokenAccountBalance(ataAccount).then((balance) => {
      console.log("balance:", balance);
      enqueueSnackbar(`${publicKey} has a balance of ${balance.value.uiAmount}`);
      setBalance(balance.value.uiAmount);
    });
  };


  return (
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Transfer SPL Token
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            paragraph
          >
            Transfer SPL Token with instruction for Token:7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9.
          </Typography>


          <Stack
            sx={{ pt: 4 }}
            direction="row"
            spacing={2}
            justifyContent="center"
          >
            <Container>
              <React.Fragment>
                <Button onClick={onCreateToken}> CreateToken</Button>
              </React.Fragment>
              <br />

              <React.Fragment>
                <div>
                  <TextField label="To" onChange={onToPublicKey} />
                  <TextField label="Count" onChange={onToCount} />
                  <Button onClick={onMint}> Mint </Button>
                </div>
              </React.Fragment>

              <React.Fragment>
                <span>Balance:{balance } </span>
                <Button onClick={onBalance}> Query Balance </Button>
              </React.Fragment>

            </Container>
          </Stack>
        </Container>
      </Box>
  );
}
