import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";

describe("braket", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Braket as Program;

  it("initializes", async () => {
    const tx = await program.methods.initialize().rpc();
    console.log("tx:", tx);
  });
});
