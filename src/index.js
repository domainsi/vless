// ============== CONFIG ==================
const DOMAIN = "vless-2rj.workers.dev" // GANTI sesuai nama worker
const PATH = "/assets/js/app.js"

const VMESS_USERS = [
  {
    name: "VMESS-1",
    uuid: "be3d3347-e098-47c2-a3e4-52cdcb1887a5"
  },
  {
    name: "VMESS-2",
    uuid: "2ebc4824-a9a2-4edf-bb7b-abd9c4ff54cf"
  }
]
// ========================================

export default {
  async fetch(req) {
    // kalau websocket → relay (proxy mode)
    if (req.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair()
      const [client, server] = Object.values(pair)
      server.accept()
      relay(server)
      return new Response(null, { status: 101, webSocket: client })
    }

    // kalau browser → tampilkan halaman VMESS
    return vmessPage()
  }
}

function relay(ws) {
  ws.addEventListener("message", e => ws.send(e.data))
}

// ================= HTML PAGE =================
function vmessPage() {
  const links = VMESS_USERS.map(u => {
    const json = {
      v: "2",
      ps: u.name,
      add: DOMAIN,
      port: "443",
      id: u.uuid,
      aid: "0",
      net: "ws",
      type: "none",
      host: DOMAIN,
      path: PATH,
      tls: "tls"
    }
    const vmess = "vmess://" + btoa(JSON.stringify(json))
    return `<li><b>${u.name}</b><br>
      <input value="${vmess}" readonly onclick="this.select()">
    </li>`
  }).join("")

  return new Response(`
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>VMESS CONFIG</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{background:#0d0d0d;color:#eee;font-family:Arial;padding:20px}
h1{color:#00ffcc}
li{margin-bottom:15px}
input{
  width:100%;
  background:#111;
  color:#0f0;
  border:1px solid #333;
  padding:8px;
}
small{color:#888}
</style>
</head>
<body>
<h1>🚀 VMESS CONFIG</h1>
<p>Klik lalu copy link di bawah</p>
<ul>${links}</ul>
<hr>
<small>Cloudflare Workers · TLS · WS</small>
</body>
</html>
`, {
    headers: { "content-type": "text/html" }
  })
}
