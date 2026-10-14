// Simulates the dApp's Tikkun commit transaction against X1 mainnet without signing.
// Uses a funded validator identity as fee payer with sigVerify disabled.
import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";

const RPC = "https://rpc.mainnet.x1.xyz";
const MEMO = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const [REGISTRY] = PublicKey.findProgramAddressSync([Buffer.from("kabbalistic-rhizomorph")], MEMO);

const conn = new Connection(RPC, "confirmed");
const votes = await conn.getVoteAccounts();
const payer = new PublicKey(votes.current[0].nodePubkey);

const transfer = SystemProgram.transfer({ fromPubkey: payer, toPubkey: payer, lamports: 0 });
transfer.keys.push({ pubkey: REGISTRY, isSigner: false, isWritable: false });
const memo = new TransactionInstruction({
  programId: MEMO,
  keys: [{ pubkey: payer, isSigner: true, isWritable: false }],
  data: Buffer.from("rhizomorph:v1|tikkun|d=0|S=0|C=0.000|test=1", "utf8"),
});
const tx = new Transaction().add(transfer, memo);
tx.feePayer = payer;
tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;

const res = await conn.simulateTransaction(tx.compileMessage(), undefined);
console.log("registry:", REGISTRY.toBase58());
console.log(JSON.stringify(res.value, null, 2));
