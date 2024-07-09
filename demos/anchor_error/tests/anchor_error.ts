import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorError } from "../target/types/anchor_error";
const { SystemProgram } = anchor.web3;
const assert = require("assert");
// const anchor = require("@coral-xyz/anchor");

describe("anchor_error", () => {
    // Use a local provider.
    const provider = anchor.AnchorProvider.local();
    // Configure the client to use the local cluster.
    anchor.setProvider(provider);

    const program = anchor.workspace.AnchorError as Program<AnchorError>;
    let _myAccount = undefined;

    it("Creates and initializes an account in a single atomic transaction (simplified)", async () => {
        // #region code-simplified
        // The program to execute.
        // const program = anchor.workspace.;

        // The Account to create.
        const myAccount = anchor.web3.Keypair.generate();

        // Create the new account and initialize it with the program.
        // #region code-simplified
        await program.methods
          .initialize(new anchor.BN(1234))
          .accounts({
            myAccount: myAccount.publicKey,
            user: provider.wallet.publicKey,
            // systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([myAccount])
          .rpc();
        // #endregion code-simplified

        // Fetch the newly created account from the cluster.
        const account = await program.account.myAccount.fetch(myAccount.publicKey);

        // Check it's state was initialized.
        assert.ok(account.data.eq(new anchor.BN(1234)));

        // Store the account for the next test.
        _myAccount = myAccount;
      });

    it("Set Data!", async () => {
        console.log("myAccount: ", _myAccount);
        const data = {
            data: new anchor.BN(5),
        };
        // The Account to create.
        // const myAccount = anchor.web3.Keypair.generate();
        // console.log(myAccount.publicKey);

        // Add your test here.
        let tx = await program.methods
            .setData(data)
            .accounts({
                myAccount: _myAccount.publicKey,
                // user: provider.wallet.publicKey,
                // systemProgram: anchor.web3.SystemProgram.programId,
            })
            // .signers([_myAccount])
            .rpc();
        console.log("Your transaction signature", tx);
    });
});
