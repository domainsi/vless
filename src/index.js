// ================= CONFIG =================
const UUIDS = [
  "2ebc4824-a9a2-4edf-bb7b-abd9c4ff54cf",
  "be3d3347-e098-47c2-a3e4-52cdcb1887a5"
]

const SECRET = "X-EDGE-AUTH"
const SECRET_VALUE = "my-secret-key-123"

const PATHS = [
  "/assets/js/app.js",
  "/cdn/v1/data",
  "/images/load"
]

// rate limit (per request, basic)
const MAX_FRAME = 1000
// =========================================

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url)

    // ❌ bukan websocket → kasih fake web
    if (req.headers.get("Upgrade") !== "websocket") {
      return fakeSite()
    }

    // ❌ path tidak valid
    if (!PATHS.includes(url.pathname)) {
      return new Response("404", { status: 404 })
    }

    // ❌ header auth salah
    if (req.headers.get(SECRET) !== SECRET_VALUE) {
      return new Response("Forbidden", { status: 403 })
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    server.accept()

    handleVLESS(server)

    return new Response(null, {
      status: 101,
      webSocket: client
    })
  }
}

function handleVLESS(ws) {
  let count = 0

  ws.addEventListener("message", (event) => {
    count++
    if (count > MAX_FRAME) {
      ws.close()
      return
    }
    ws.send(event.data)
  })
}

function fakeSite() {
  return new Response(`
<!doctype html>
<html>
<head>
<title>Welcome</title>
<style>
body{font-family:sans-serif;background:#111;color:#eee;text-align:center;padding-top:20%}
</style>
</head>
<body>
<h1>Welcome</h1>
<p>Service is running normally.</p>
</body>
</html>
`, {
    headers: { "content-type": "text/html" }
  })
}
