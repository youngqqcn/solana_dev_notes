import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { Note } from "../target/types/note";

describe("note", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Note as Program<Note>;

    it("create note!", async () => {

        // noteAccount = KeyPia
        const noteAccount = Keypair.generate();
        // Add your test here.
        // const tx = await program.methods.initialize().rpc();
        // let user = anchor.web3.Keypair.generate();
        let tx = await program.methods
            .create("good")
            .accounts({
                user: provider.wallet.publicKey,
                note: noteAccount.publicKey,
                // systemProgram: "xx",
                // systemProgram:
            })
            .signers([noteAccount])
            .rpc();
        console.log("Your transaction signature", tx);
    });
});
