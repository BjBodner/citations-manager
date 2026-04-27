/**
 * Vercel Serverless Function – Google Patents proxy
 * Route:    /api/google-patents?path=/patent/WO2020227475A1/en
 * Forwards: https://patents.google.com/patent/WO2020227475A1/en
 */
export default async function handler(req, res) {
  const rawPath = req.query.path || '/'
  const targetUrl = `https://patents.google.com${rawPath}`

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    })

    const body = await upstream.text()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(upstream.status).send(body)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
