import { Client, Wallet, Message, Coin, Transaction, Fee } from '@bandprotocol/bandchain.js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

const grpcURL = process.env.BAND_GRPC_URL || 'https://laozi-testnet6.bandchain.org/grpc-web'
const client = new Client(grpcURL)

async function createFixturesOracleScript() {
  const { PrivateKey } = Wallet
  const mnemonic = process.env.BAND_MNEMONIC as string
  const privateKey = PrivateKey.fromMnemonic(mnemonic)
  const publicKey = privateKey.toPubkey()
  const sender = publicKey.toAddress().toAccBech32()

  const chainId = await client.getChainId()
  const wasmPath = path.resolve(__dirname, '../oracle-script/fixtures_oracle_script.wasm')
  const code = fs.readFileSync(wasmPath)

  const feeCoin = new Coin()
  feeCoin.setDenom('uband')
  feeCoin.setAmount('50000')

  const requestMessage = new Message.MsgCreateOracleScript(
    'Fixtures Oracle Script',
    code,
    sender,
    sender,
    'Returns a matchday fixture schedule (kickoff timestamp + match IDs)',
    '{matchday:u64}/[{id:string,kickoff:u64}]',
    'https://github.com/your-org/band-oracle-monorepo/oracle-script/fixtures_oracle_script.rs'
  )

  const fee = new Fee()
  fee.setAmountList([feeCoin])
  fee.setGasLimit(350000)

  const txn = new Transaction()
  txn.withMessages(requestMessage)
  await txn.withSender(client, sender)
  txn.withChainId(chainId)
  txn.withFee(fee)

  const signDoc = txn.getSignDoc(publicKey)
  const signature = privateKey.sign(signDoc)
  const txRawBytes = txn.getTxData(signature, publicKey)
  const sendTx = await client.sendTxBlockMode(txRawBytes)

  console.log('✅ Fixtures oracle script created:', sendTx)
}

createFixturesOracleScript()
