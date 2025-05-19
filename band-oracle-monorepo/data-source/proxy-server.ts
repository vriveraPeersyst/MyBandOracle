import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config({ path: __dirname + '/.env' })

const app = express()
const PORT = Number(process.env.PORT) || 3000

// ── Verification config ─────────────────────────────────────────────────────
const BAND_NODE_URL = process.env.BAND_NODE_URL || "https://rpc.laozi-testnet6.bandchain.org"
const ALLOWED_DS_IDS = new Set<number>([1, 2, 3])
const MAX_DELAY = Number(process.env.MAX_DELAY) || 5

interface VerificationParams {
  chain_id: string
  validator: string
  request_id: number
  external_id: number
  data_source_id: number
  reporter: string
  signature: string
  max_delay: number
}

// Middleware to call /oracle/v1/verify_request and enforce allowlist
function verifyRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // Wrap async logic to avoid returning a value from middleware
  (async () => {
    try {
      // Extract Band headers (lowercased by Express)
      const hdr = (k: string) => req.header(k.toLowerCase())!
      const params: VerificationParams = {
        chain_id: hdr('band_chain_id'),
        validator: hdr('band_validator'),
        request_id: Number(hdr('band_request_id')),
        external_id: Number(hdr('band_external_id')),
        data_source_id: Number(hdr('band_data_source_id')),
        reporter: hdr('band_reporter'),
        signature: hdr('band_signature'),
        max_delay: MAX_DELAY,
      }

      const rpcRes = await axios.get(
        `${BAND_NODE_URL}/oracle/v1/verify_request`,
        { params }
      )
      const { is_delay, data_source_id: dsId } = rpcRes.data as any

      if (!ALLOWED_DS_IDS.has(dsId)) {
        res
          .status(403)
          .json({ error: `Data source ${dsId} is not allowed.` })
        return
      }

      if (is_delay) {
        // still within acceptable delay; you can choose to queue or return 202
        res
          .status(202)
          .json({ error: 'Request not on-chain yet', is_delay: true })
        return
      }

      // all good
      next()
    } catch (err: any) {
      console.error('🔒 Verification failed:', err.message ?? err)
      res.status(401).json({ error: 'Request verification failed.' })
    }
  })()
}

// ── Your existing Football-Data routes, now protected ───────────────────────
const HEADERS = { 'X-Auth-Token': process.env.FOOTBALL_API_KEY! }

app.get('/fixtures', verifyRequest, async (req, res) => {
  /* … your existing logic … */
})

app.get('/results', verifyRequest, async (req, res) => {
  /* … your existing logic … */
})

app.listen(PORT, () =>
  console.log(`⚽ Football proxy running at http://localhost:${PORT}`)
)
