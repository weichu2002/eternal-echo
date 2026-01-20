/**
 * Eternal Echo - Edge Function
 * 路径: /api/vault
 * 
 * 此代码由 ESA Pages 自动部署。
 * KV 绑定关系在项目根目录的 esa.jsonc 中定义。
 */

export default {
  async fetch(request, env, ctx) {
    // 1. 安全检查
    // 虽然是同源，但为了严谨，我们检查 KV 是否成功绑定
    if (!env.ETERNAL_VAULT_KV) {
      return new Response(JSON.stringify({ 
        error: "Server Configuration Error: KV 'ETERNAL_VAULT_KV' not bound. Please check esa.jsonc." 
      }), { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const url = new URL(request.url);
    
    // 2. 处理请求逻辑
    // 因为我们在 esa.jsonc 里配置了路由 pattern: "/api/vault"，所以这里不需要手动判断路径前缀
    
    try {
      const headers = { "Content-Type": "application/json" };

      // --- POST: 存入数据 (生前预置) ---
      if (request.method === "POST") {
        const body = await request.json();
        const { key, value, expirationTTL } = body;

        if (!key || !value) {
          return new Response(JSON.stringify({ error: "Missing key or value" }), { status: 400, headers });
        }

        // 写入 ESA KV
        await env.ETERNAL_VAULT_KV.put(key, value, {
          expirationTtl: expirationTTL || 31536000, // 默认 1 年
        });

        return new Response(JSON.stringify({ success: true, message: "Securely stored on Edge Node via Integrated Function" }), { status: 200, headers });
      }

      // --- GET: 读取数据 (身后访问) ---
      if (request.method === "GET") {
        const key = url.searchParams.get("key");

        if (!key) {
          return new Response(JSON.stringify({ error: "Missing key parameter" }), { status: 400, headers });
        }

        // 从 ESA KV 读取
        const data = await env.ETERNAL_VAULT_KV.get(key);

        if (data === null) {
          return new Response(JSON.stringify({ found: false, message: "Not found" }), { status: 200, headers });
        }

        return new Response(JSON.stringify({ found: true, data: data }), { status: 200, headers });
      }

      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500, headers });
    }
  }
};