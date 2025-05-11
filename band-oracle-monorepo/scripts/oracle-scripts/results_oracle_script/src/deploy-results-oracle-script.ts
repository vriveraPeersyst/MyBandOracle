// deploy-results-oracle-script.ts

import { Client, Wallet, Message, Coin, Transaction, Fee } from '@bandprotocol/bandchain.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const grpcURL = process.env.BAND_GRPC_URL || 'https://laozi-testnet6.bandchain.org/grpc-web';
const client = new Client(grpcURL);

async function createResultsOracleScript() {
  const { PrivateKey } = Wallet;
  const mnemonic = process.env.BAND_MNEMONIC as string;
  const privateKey = PrivateKey.fromMnemonic(mnemonic);
  const publicKey = privateKey.toPubkey();
  const sender = publicKey.toAddress().toAccBech32();

  const chainId = await client.getChainId();

  const execPath = path.resolve(__dirname, '../oracle-script-results/target/wasm32-unknown-unknown/release/results_oracle_script.wasm');
  const code = fs.readFileSync(execPath);

  let feeCoin = new Coin();
  feeCoin.setDenom('uband');
  feeCoin.setAmount('0');

  const schema = '{matchday:u64}/{matches:[{id:string,result:string}]}';

  const requestMessage = new Message.MsgCreateOracleScript(
    'Match Results Oracle Script',
    code,
    sender,
    sender,
    'Aggregates 1X2 match results for LaLiga',
    schema,
    'https://github.com/your-org/band-oracle-monorepo/blob/main/oracle-script-results/src/lib.rs'
  );

  const fee = new Fee();
  fee.setAmountList([feeCoin]);
  fee.setGasLimit(350000);

  const txn = new Transaction();
  txn.withMessages(requestMessage);
  await txn.withSender(client, sender);
  txn.withChainId(chainId);
  txn.withFee(fee);

  const signDoc = txn.getSignDoc(publicKey);
  const signature = privateKey.sign(signDoc);
  const txRawBytes = txn.getTxData(signature, publicKey);
  const sendTx = await client.sendTxBlockMode(txRawBytes);

  console.log('✅ Results Oracle Script created:', sendTx);
}

createResultsOracleScript().catch(console.error);
