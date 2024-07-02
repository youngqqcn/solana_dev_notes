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

import {
  useConnection,
  useWallet,
  ConnectionContext,
  WalletContext,
} from "@solana/wallet-adapter-react";
import { Buffer } from 'buffer';

// @ts-ignore
window.Buffer = Buffer;

const TO_ATA_PUBLIC_KEY = new PublicKey("FZQ6qrSHTPERXoQC9tp1WESVpzhZjugLMyQaHmg1BHmx");
// const TO_ATA_PUBLIC_KEY = new PublicKey("7DxeAgFoxk9Ha3sdciWE4G4hsR9CUjPxsHAxTmuCJrop");
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const FROM_ATA_PUBKEY_KEY = new PublicKey("8gDUi1gMxy95WaMr5Phtmv8HoX52m5vw7t3Tum22n9hi");

export default function HomePage() {
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState(0);
  const [toPublicKey, setToPublicKey] = useState(TO_ATA_PUBLIC_KEY);
  const [toCount, setToCount] = useState(100000000);
  const { connection } = useConnection();
  const onToPublicKey = (e) => {
    setToPublicKey(e.target.value);
  };

  const onToCount = (e) => {
    setToCount(e.target.value * LAMPORTS_PER_SOL);
  };

  function createTransferInstruction(
    source,
    destination,
    owner,
    amount,
    programId
) {
    const keys = [
            { pubkey: source, isSigner: false, isWritable: true },
            { pubkey: destination, isSigner: false, isWritable: true },
            { pubkey: owner, isSigner:true, isWritable: false}
    ];

    const data = Buffer.alloc(9);
    data.writeUInt8(3);
    const bigAmount = BigInt(amount);
    data.writeBigInt64LE(bigAmount,1)


    return new TransactionInstruction({ keys, programId, data });
}

  const onTransfer = async () => {
    enqueueSnackbar(`transfer to ${toPublicKey} ${toCount} Token`);
    enqueueSnackbar(`SystemProgram: ${SystemProgram.programId.toBase58()}`);
    const txInstructions = [
      createTransferInstruction(
        FROM_ATA_PUBKEY_KEY,
        TO_ATA_PUBLIC_KEY,
        publicKey,
        toCount,
        TOKEN_PROGRAM_ID
      ),
    ];

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
    try {
        const signature = await sendTransaction(trx, connection, {
            minContextSlot,
          });
          console.log("signature:", signature);
    } catch (error) {
        console.log("error:", error);
    }

  };

  const onBalance = () => {
    console.log("wallet is ", publicKey);
    connection.getTokenAccountBalance(FROM_ATA_PUBKEY_KEY).then((balance) => {
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
                <span>Balance:{balance } </span>
                <Button onClick={onBalance}> Query Balance </Button>
              </React.Fragment>
              <React.Fragment>
                <div>
                  <TextField label="To" onChange={onToPublicKey} />
                  <TextField label="Count" onChange={onToCount} />
                  <Button onClick={onTransfer}> Transfer </Button>
                </div>
              </React.Fragment>
            </Container>
          </Stack>
        </Container>
      </Box>
  );
}
