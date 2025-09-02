import tls from 'tls'
import net from 'net'

export default async function handler(req, res) {
  const databaseUrl = process.env.DATABASE_URL || ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  const response = {
    ok: true,
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: Boolean(databaseUrl),
      NEXT_PUBLIC_SUPABASE_URL_SET: Boolean(supabaseUrl),
      NEXT_PUBLIC_SUPABASE_ANON_KEY_SET: Boolean(supabaseAnon),
      SUPABASE_URL_VALUE: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT_SET',
      SUPABASE_KEY_LENGTH: supabaseAnon ? supabaseAnon.length : 0,
    },
    database: {
      host: null,
      port: null,
      canConnectTcp: null,
      canConnectTls: null,
      error: null,
    },
  }

  try {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not set')
    }

    let host = null
    let port = null
    try {
      const u = new URL(databaseUrl)
      host = u.hostname
      port = Number(u.port || (u.protocol === 'postgresql:' ? 5432 : 5432))
      response.database.host = host
      response.database.port = port
    } catch (e) {
      response.database.error = 'Invalid DATABASE_URL format'
      response.ok = false
      return res.status(200).json(response)
    }

    // Plain TCP test
    response.database.canConnectTcp = await new Promise((resolve) => {
      const socket = new net.Socket()
      const onDone = (ok) => {
        try { socket.destroy() } catch {}
        resolve(ok)
      }
      socket.setTimeout(3000)
      socket.once('timeout', () => onDone(false))
      socket.once('error', () => onDone(false))
      socket.connect(port, host, () => onDone(true))
    })

    // TLS test (common for sslmode=require)
    response.database.canConnectTls = await new Promise((resolve) => {
      const socket = tls.connect({ host, port, servername: host, timeout: 4000 }, () => {
        try { socket.end() } catch {}
        resolve(true)
      })
      socket.once('error', () => resolve(false))
      socket.once('timeout', () => resolve(false))
    })

    res.status(200).json(response)
  } catch (error) {
    response.ok = false
    response.database.error = error.message
    res.status(200).json(response)
  }
}


