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
    if (!env.ETERNAL_VAULT_KV) {
      return new Response(JSON.stringify({ 
        error: "Server Configuration Error: KV 'ETERNAL_VAULT_KV' not bound. Please check esa.jsonc." 
      }), { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const url = new URL(request.url);
    const headers = { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Allow CORS for demo purposes
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    
    try {
      // --- POST: 写入操作 ---
      if (request.method === "POST") {
        const body = await request.json();
        
        // 模式 A: 只有 key/value -> 简单覆盖 (用于部署 Legacy 数据)
        if (body.key && body.value !== undefined && !body.action) {
          await env.ETERNAL_VAULT_KV.put(body.key, body.value, {
            expirationTtl: body.expirationTTL || 31536000, 
          });
          return new Response(JSON.stringify({ success: true, mode: "overwrite" }), { status: 200, headers });
        }

        // 模式 B: action='append_interaction' -> 读取并追加 (用于访客互动)
        if (body.action === 'append_interaction' && body.key && body.payload) {
          const interactionKey = body.key + "_INTERACTIONS";
          
          // 1. 读取现有数据
          const existingDataStr = await env.ETERNAL_VAULT_KV.get(interactionKey);
          let interactionData = { logs: [], tributes: [] };
          
          if (existingDataStr) {
            try {
              interactionData = JSON.parse(existingDataStr);
            } catch (e) {
              console.error("Failed to parse existing interactions", e);
            }
          }

          // 2. 根据类型追加
          if (body.payload.type === 'log') {
             // 限制日志长度，防止无限增长，保留最近 1000 条
             if (interactionData.logs.length > 1000) interactionData.logs.shift();
             interactionData.logs.push(body.payload.data);
          } else if (body.payload.type === 'tribute') {
             if (interactionData.tributes.length > 500) interactionData.tributes.shift();
             interactionData.tributes.push(body.payload.data);
          }

          // 3. 写回 KV
          await env.ETERNAL_VAULT_KV.put(interactionKey, JSON.stringify(interactionData));
          
          return new Response(JSON.stringify({ success: true, mode: "append", data: interactionData }), { status: 200, headers });
        }

        return new Response(JSON.stringify({ error: "Invalid POST body" }), { status: 400, headers });
      }

      // --- GET: 读取数据 ---
      if (request.method === "GET") {
        const key = url.searchParams.get("key");
        const type = url.searchParams.get("type"); // 'data' (default) or 'interactions'

        if (!key) {
          return new Response(JSON.stringify({ error: "Missing key parameter" }), { status: 400, headers });
        }

        let targetKey = key;
        if (type === 'interactions') {
          targetKey = key + "_INTERACTIONS";
        }

        const data = await env.ETERNAL_VAULT_KV.get(targetKey);

        if (data === null) {
          // 如果是互动数据没找到，返回空结构而不是 404，方便前端处理
          if (type === 'interactions') {
             return new Response(JSON.stringify({ found: true, data: { logs: [], tributes: [] } }), { status: 200, headers });
          }
          return new Response(JSON.stringify({ found: false, message: "Not found" }), { status: 200, headers });
        }

        // 如果读取的是主数据，它是 JSON 字符串 (encrypted packet)，直接返回字符串让前端解析
        // 如果读取的是互动数据，它也是 JSON 字符串
        let parsedData = data;
        try {
          parsedData = JSON.parse(data);
        } catch(e) {
          // keep as string
        }

        return new Response(JSON.stringify({ found: true, data: parsedData }), { status: 200, headers });
      }

      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500, headers });
    }
  }
};