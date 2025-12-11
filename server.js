import { serve, file } from "bun";

// In-memory shared state
let gridSize = 16;
// Map key: `${row},${col}` => { color, opacity }
const cells = new Map();
const clients = new Set();

const server = serve({
  port: 3000,
  hostname: "0.0.0.0", // Listen on all interfaces for Tailscale/access from LAN

  async fetch(req, server) {
    try {
      const url = new URL(req.url);
      let filePath = url.pathname;

      // WebSocket upgrade at /ws
      if (filePath === "/ws") {
        const ok = server.upgrade(req);
        if (ok) return; // WebSocket connection will be handled below
        return new Response("Upgrade failed", { status: 500 });
      }

      // Default to index.html for root path
      if (filePath === "/") {
        filePath = "/index.html";
      }

      // Basic safeguard against directory traversal
      if (filePath.includes("..")) {
        return new Response("Bad request", { status: 400 });
      }

      // Serve static files from current directory
      const staticFile = file(`.${filePath}`);
      if (await staticFile.exists()) {
        return new Response(staticFile);
      }

      // Fallback to index.html for SPA-like behavior
      const indexFile = file("./index.html");
      if (await indexFile.exists()) {
        return new Response(indexFile);
      }

      return new Response("File not found", { status: 404 });
    } catch (error) {
      return new Response("Server error", { status: 500 });
    }
  },

  websocket: {
    open(ws) {
      clients.add(ws);
      // Send current snapshot to the new client
      const snapshot = Array.from(cells.entries()).map(([key, value]) => {
        const [row, col] = key.split(",").map(Number);
        return { row, col, ...value };
      });
      ws.send(JSON.stringify({ type: "init", gridSize, cells: snapshot }));
    },
    close(ws) {
      clients.delete(ws);
    },
    message(ws, message) {
      try {
        const data =
          typeof message === "string"
            ? JSON.parse(message)
            : JSON.parse(new TextDecoder().decode(message));
        if (data.type === "grid") {
          // Reset grid and broadcast
          gridSize = Number(data.gridSize) || 16;
          cells.clear();
          for (const c of clients)
            if (c !== ws) c.send(JSON.stringify({ type: "grid", gridSize }));
        } else if (data.type === "paint") {
          const key = `${data.row},${data.col}`;
          cells.set(key, { color: data.color, opacity: data.opacity });
          for (const c of clients) if (c !== ws) c.send(JSON.stringify(data));
        }
      } catch (_) {
        // ignore malformed messages
      }
    },
  },
});

console.log(`Server running at http://0.0.0.0:${server.port}`);
