# Eternal Echo - 阿里云 ESA 一体化部署手册 (Pages + Functions)

本手册采用最新的 **Pages + Functions** 一体化模式部署。我们通过 `esa.jsonc` 配置文件来管理前端构建、后端路由和 KV 绑定，无需在控制台手动配置复杂的边缘函数。

---

## 第一步：获取 KV 存储 ID

虽然我们通过文件配置，但您仍然需要先在控制台创建一个 KV 空间并获取其 ID。

1. 登录阿里云 ESA 控制台。
2. 进入 **边缘存储** -> **KV**。
3. 如果没有名为 `ETERNAL_VAULT_KV` 的空间，请点击“创建存储空间”，名称填写 `ETERNAL_VAULT_KV`。
4. 创建成功后，在列表中找到它，复制其 **Namespace ID (存储空间 ID)**。（通常是一串长数字，如 `1234567890123456`）。

## 第二步：配置项目 (esa.jsonc)

1. 打开项目根目录下的 `esa.jsonc` 文件。
2. 找到 `kv_namespaces` 字段。
3. 将 `"id": "REPLACE_WITH_YOUR_KV_NAMESPACE_ID"` 替换为您刚才复制的真实 ID。

**示例：**
```jsonc
"kv_namespaces": [
  {
    "name": "ETERNAL_VAULT_KV",
    "id": "1234567890123456" // <--- 填入您的 ID
  }
]
```

## 第三步：部署到 ESA Pages

1. 将所有文件（包括新生成的 `functions/` 文件夹和更新后的 `esa.jsonc`）提交并推送到 GitHub。
2. 进入阿里云 ESA 控制台 -> **站点管理** -> **Pages**。
3. 点击您的项目（如果还没创建，参考旧版手册创建）。
4. 在项目的 **“部署详情”** 或 **“构建配置”** 中，确保没有任何覆盖设置。
5. 点击 **“手动触发部署”** 或等待 Git 推送自动触发。

**平台会自动识别：**
- 前端：运行 `npm run build` 生成 `dist` 目录。
- 后端：识别 `esa.jsonc` 中的配置，将 `functions/api/vault.js` 部署为边缘函数，并自动绑定您填写的 KV ID。

## 第四步：验证

部署完成后，打开您的网站域名。
1. 创建一个遗嘱并保存。
2. 打开浏览器控制台 (F12) -> Network。
3. 观察对 `/api/vault` 的 POST 请求。
   - 如果状态码为 `200`，说明前端已成功调用同域名的边缘函数，且数据已存入 KV。
   - 如果状态码为 `500`，且返回 `KV not bound`，请检查 `esa.jsonc` 中的 ID 是否填写正确。

---

**后续更新：**
- **更新代码**：修改本地代码（无论是前端还是 `functions/` 下的后端），`git push` 后 ESA 会自动重新构建并更新所有内容。
- **更新配置**：如果需要增加新的 KV 或修改路由，直接修改 `esa.jsonc` 并推送即可。
