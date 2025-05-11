import { Client, Wallet, Message, Coin, Transaction, Fee } from '@bandprotocol/bandchain.js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

const grpcURL = process.env.BAND_GRPC_URL || 'https://laozi-testnet6.bandchain.org/grpc-web'
const client = new Client(grpcURL)

async function createDataSource() {
  const { PrivateKey } = Wallet
  const mnemonic = process.env.BAND_MNEMONIC as string
  const privateKey = PrivateKey.fromMnemonic(mnemonic)
  const publicKey = privateKey.toPubkey()
  const sender = publicKey.toAddress().toAccBech32()
  const chainId = await client.getChainId()

  const execPath = path.resolve(__dirname, '../data-source/football_ds.py')
  const file = fs.readFileSync(execPath, 'utf8')
  const executable = Buffer.from(file).toString('base64')

  const feeCoin = new Coin()
  feeCoin.setDenom('uband')
  feeCoin.setAmount('50000') // ~0.05 BAND per query

  const requestMessage = new Message.MsgCreateDataSource(
    'Football Match Results',
    executable,
    sender, // Treasury address
    sender, // Owner
    sender, // Sender
    [feeCoin],
    'Returns match results (1/X/2) for a given matchday'
  )

  const fee = new Fee()
  fee.setAmountList([feeCoin])
  fee.setGasLimit(100000)

  const txn = new Transaction()
  txn.withMessages(requestMessage)
  await txn.withSender(client, sender)
  txn.withChainId(chainId)
  txn.withFee(fee)

  const signDoc = txn.getSignDoc(publicKey)
  const signature = privateKey.sign(signDoc)
  const txRawBytes = txn.getTxData(signature, publicKey)
  const sendTx = await client.sendTxBlockMode(txRawBytes)

  console.log('✅ Data source created:', sendTx)
}

createDataSource()
