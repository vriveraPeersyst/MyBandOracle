import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

const app = express()
const PORT = 3000
const BASE_URL = 'https://api.football-data.org/v4/competitions'

// Required: set FOOTBALL_API_KEY in your `.env`
const API_KEY = process.env.FOOTBALL_API_KEY
if (!API_KEY) {
  console.error('❌ FOOTBALL_API_KEY not set in .env')
  process.exit(1)
}

const HEADERS = { 'X-Auth-Token': API_KEY }

/**
 * GET /fixtures?matchday=35&competition=PD
 * Used by BandChain to schedule matchday (fetches kickoff time + match IDs)
 */
app.get('/fixtures', async (req, res) => {
  const { matchday, competition } = req.query

  try {
    const url = `${BASE_URL}/${competition}/matches?matchday=${matchday}`
    const response = await axios.get(url, { headers: HEADERS })

    const output = response.data.matches.map((match: any) => {
      const home = match.homeTeam.tla.toUpperCase()
      const away = match.awayTeam.tla.toUpperCase()
      return {
        id: home + away,
        kickoff: Math.floor(new Date(match.utcDate).getTime() / 1000)
      }
    })

    res.json(output)
  } catch (err: unknown) {
    const error = err as Error
    console.error('❌ Error in /fixtures:', error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /results?matchday=35&competition=PD
 * Used by BandChain to fetch match results
 */
app.get('/results', async (req, res) => {
  const { matchday, competition } = req.query

  try {
    const url = `${BASE_URL}/${competition}/matches?matchday=${matchday}`
    const response = await axios.get(url, { headers: HEADERS })

    const output = response.data.matches
      .filter((m: any) => m.status === 'FINISHED')
      .map((match: any) => {
        const home = match.homeTeam.tla.toUpperCase()
        const away = match.awayTeam.tla.toUpperCase()
        const result = match.score.winner === 'HOME_TEAM' ? '1'
                      : match.score.winner === 'AWAY_TEAM' ? '2'
                      : 'X'

        return { id: home + away, result }
      })

    res.json(output)
  } catch (err: unknown) {
    const error = err as Error
    console.error('❌ Error in /results:', error.message)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`⚽ Football proxy running at http://localhost:${PORT}`)
})