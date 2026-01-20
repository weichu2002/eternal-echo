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
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" // 禁止缓存
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    
    try {
      // --- POST: 写入操作 ---
      if (request.method === "POST") {
        const body = await request.json();
        
        // 模式 A: 只有 key/value -> 简单覆盖 (用于部署 Legacy 数据)
        // 注意：Legacy 数据仍然保留 1 年 TTL，避免死数据堆积，或者根据需求也可移除
        if (body.key && body.value !== undefined && !body.action) {
          await env.ETERNAL_VAULT_KV.put(body.key, body.value); // 移除 TTL，实现永久存储
          return new Response(JSON.stringify({ success: true, mode: "overwrite" }), { status: 200, headers });
        }

        // 模式 B: action='append_interaction' -> 分离存储日志和贡品
        if (body.action === 'append_interaction' && body.key && body.payload) {
          
          let targetStorageKey = "";
          let newData = body.payload.data;
          let list = [];

          // 确定存储键名 (Logs 和 Tributes 分开存储)
          if (body.payload.type === 'log') {
            targetStorageKey = body.key + "_LOGS";
          } else if (body.payload.type === 'tribute') {
            targetStorageKey = body.key + "_TRIBUTES";
          } else {
             return new Response(JSON.stringify({ error: "Unknown payload type" }), { status: 400, headers });
          }
          
          // 1. 读取现有列表
          const existingDataStr = await env.ETERNAL_VAULT_KV.get(targetStorageKey);
          if (existingDataStr) {
            try {
              list = JSON.parse(existingDataStr);
              if (!Array.isArray(list)) list = [];
            } catch (e) {
              list = [];
            }
          }

          // 2. 追加并限制长度
          // Tributes 保留更多 (2000)，Logs 保留最近 2000 条
          const limit = 2000;
          if (list.length >= limit) list.shift();
          
          // 简单的去重检查 (防止极短时间内的重复提交)
          const isDuplicate = list.some(item => item.id && item.id === newData.id);
          if (!isDuplicate) {
            list.push(newData);
          }

          // 3. 写回 KV
          // 关键修改：移除 expirationTtl 选项，默认为永久保存（取决于套餐限制，通常是无限期）
          await env.ETERNAL_VAULT_KV.put(targetStorageKey, JSON.stringify(list));
          
          return new Response(JSON.stringify({ success: true, mode: "append", type: body.payload.type }), { status: 200, headers });
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

        // 获取互动数据：同时拉取 Logs 和 Tributes
        if (type === 'interactions') {
          const [logsStr, tributesStr] = await Promise.all([
            env.ETERNAL_VAULT_KV.get(key + "_LOGS"),
            env.ETERNAL_VAULT_KV.get(key + "_TRIBUTES")
          ]);

          let logs = [];
          let tributes = [];

          try { if (logsStr) logs = JSON.parse(logsStr); } catch(e) {}
          try { if (tributesStr) tributes = JSON.parse(tributesStr); } catch(e) {}

          return new Response(JSON.stringify({ 
            found: true, 
            data: { logs, tributes } 
          }), { status: 200, headers });
        }

        // 获取主数据 (Legacy Data)
        const data = await env.ETERNAL_VAULT_KV.get(key);

        if (data === null) {
          return new Response(JSON.stringify({ found: false, message: "Not found" }), { status: 200, headers });
        }

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