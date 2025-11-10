// src/index.ts
export interface Env {
  "Hello-DO": DurableObjectNamespace;
  ASSETS: any; // Static assets binding
}

export class Hello {
  state: DurableObjectState;
  env: Env;  // Store env if needed

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;  // Now accessible in other methods
  }

  async fetch(request: Request): Promise<Response> {
    const sql = this.state.storage.sql;
    const url = new URL(request.url);

    // Ensure the table exists
    sql.exec(`
      CREATE TABLE IF NOT EXISTS kv (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    const key = "message"; // Simple key for storage

    if (request.method === "GET") {
      // Read from storage, default to "Hello World" if not set
      const cursor = sql.exec(`SELECT value FROM kv WHERE key = ?`, key);
      const rows = cursor.toArray();
      const value = rows[0]?.value ?? "Hello World";
      return new Response(value);
    } else if (request.method === "POST") {
      // Write the request body to storage
      const body = await request.text();
      if (body) {
        sql.exec(`INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)`, key, body);
        return new Response("Value written successfully");
      } else {
        return new Response("No body provided", { status: 400 });
      }
    }

    return new Response("Method not allowed", { status: 405 });
  }
}


export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Serve static assets for known file extensions or /index.html
    const staticFileExtensions = [
      '.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf'
    ];

    const hasExtension = staticFileExtensions.some(ext => pathname.endsWith(ext));
    const isRoot = pathname === '/' || pathname === '/index.html';

    if (hasExtension || isRoot) {
      // Serve index.html for root
      const assetPath = isRoot ? '/index.html' : pathname;
      return env.ASSETS.fetch(new Request(new URL(assetPath, 'https://fake-origin.com').toString(), request));
    }

    // 2. Everything else → forward to Durable Object
    const id = env["Hello-DO"].idFromName("default");
    const stub = env["Hello-DO"].get(id);
    return stub.fetch(request);
  },
};

