/* 所有作品資料。用 <script> 載入（不是 fetch），所以直接雙擊 index.html 也看得到。
   等號右邊必須維持合法 JSON：雙引號、沒有結尾逗號、沒有註解。欄位說明見 README.md。 */
window.PROJECTS = [
  {
    "id": "tool-twins",
    "title": { "zh": "工具雙胞胎", "en": "Tool Twins" },
    "tagline": {
      "zh": "檢查你的 skills 和 MCP 工具會不會互相搶觸發，標出相似的名稱與描述，估算 token 用量。資料不會上傳。",
      "en": "Check whether your skills and MCP tools compete for the same requests. It flags pairs with similar names or descriptions and estimates token use. Nothing is uploaded."
    },
    "tags": ["dev", "mcp", "skills"],
    "thumbnail": null,
    "url": "https://onholdlab.github.io/tool-twins/",
    "type": "tool",
    "icon": "👯",
    "section": "live",
    "repo": "https://github.com/onholdlab/tool-twins"
  },
  {
    "id": "ai-support-survival",
    "title": { "zh": "AI 客服求生記", "en": "AI Support Survival" },
    "tagline": { "zh": "", "en": "" },
    "tags": [],
    "thumbnail": null,
    "url": "https://claude.ai/artifact/FvQ4e5jATzvNj8H45w3LYu",
    "type": "game",
    "icon": "☎️",
    "section": "demo",
    "repo": null
  },
     {
    "id": "dodge-dog",
    "title": { "zh": "閃身犬", "en": "Dodge Dog" },
    "tagline": { "zh": "一隻會閃身步的狗，被圍攻時反而變強", "en": "A dodging dog that grows stronger under pressure." },
    "tags": [],
    "thumbnail": null,
    "url": "https://onholdlab.github.io/dodge-dog/",
    "type": "game",
    "icon": "🐶",
    "section": "new",
    "repo": null
  },
  {
    "id": "clapping-cat",
    "title": { "zh": "拍手貓", "en": "Clapping Cat" },
    "tagline": { "zh": "說「放颱風假」，牠就拍手", "en": "Say the magic words, and the cat claps." },
    "tags": [],
    "thumbnail": null,
    "url": "https://onholdlab.github.io/clapping-cat/",
    "type": "game",
    "icon": "🐱",
    "section": "new",
    "repo": null
  },
  {
    "id": "crossroad-survival",
    "title": { "zh": "十字路口求生", "en": "Crossroad Survival" },
    "tagline": { "zh": "十字路口，所有路人都想撞你。", "en": "Everyone at the crossing is out to bump into you." },
    "tags": [],
    "thumbnail": null,
    "url": "https://onholdlab.github.io/crossroadhit/",
    "type": "game",
    "icon": "🚦",
    "section": "new",
    "repo": null
  }
];
