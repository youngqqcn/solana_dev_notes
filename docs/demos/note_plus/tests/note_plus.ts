import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NotePlus } from "../target/types/note_plus";
import { expect } from "chai";
import { PublicKey, Keypair } from "@solana/web3.js";

describe("note_plus", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.NotePlus as Program<NotePlus>;

    // 计算note PDA 和bump
    const [notePDA, bump] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode("note-plus"),
            provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
    );
    console.log("bump值是:", bump);

    it("create msg!", async () => {
        // Add your test here.
        const tx = await program.methods.create("hello").rpc();
        console.log("Your transaction signature", tx);

        // 获取msg内容, 进行对比
        expect((await program.account.note.fetch(notePDA)).msg).to.equal(
            "hello"
        );
    });

    it("update msg!", async () => {
        // 更新msg内容
        const tx = await program.methods
            .update("world")
            .accounts({
                // authority: provider.wallet.publicKey,
            })
            .rpc();
        console.log("Your transaction signature", tx);

        const noteAccount = await program.account.note.fetch(notePDA);

        // 对比 authority
        expect(noteAccount.authority.toString()).to.equal(
            provider.wallet.publicKey.toString()
        );
        // 获取msg内容, 进行对比
        expect(noteAccount.msg).to.equal("world");
    });

    it("Fails to update another user's note", async () => {
        const newAccount = Keypair.generate();
        // await provider.connection.requestAirdrop(
        //     newAccount.publicKey,
        //     10000000000
        // );

        try {
            // 更新msg内容
            const tx = await program.methods
                .update("world")
                .accounts({
                    // note: notePDA,
                    // user: provider.wallet.publicKey
                    user: newAccount.publicKey,

                })
                .signers([newAccount])
                .rpc();
            console.log("Your transaction signature", tx);

            // If we reach here, the test has failed
            expect.fail("Expected an error, but the transaction succeeded");
        } catch (error) {
            console.error(error);
            expect(error.toString()).to.include("Unauthorized");
        }
    });
});
