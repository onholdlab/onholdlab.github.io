# onholdlab.github.io

onholdlab 等候空間：作品集首頁，放在 GitHub Pages。純靜態網站，不需要建置。

## 檔案

| 路徑 | 內容 |
|---|---|
| `index.html` | 頁面結構（含服務鈴場景的 SVG）。文字由 JS 填入。 |
| `css/style.css` | 所有樣式。設計規則見 `DESIGN.md`。 |
| `js/app.js` | 介面文字（中英）、設定（`CONFIG`）、渲染、倒數、服務鈴、視差、訪客小生物。 |
| `data/projects.js` | 所有作品資料。 |
| `assets/covers/` | 作品縮圖。 |
| `games/` | 放在本站的遊戲。 |

## 新增一件作品

在 `data/projects.js` 的陣列加一筆。等號右邊必須是合法 JSON（雙引號、沒有結尾逗號、沒有註解）。

```json
{
  "id": "my-game",
  "title":   { "zh": "中文標題", "en": "English title" },
  "tagline": { "zh": "一句話", "en": "One line" },
  "tags": ["game", "ai"],
  "thumbnail": "assets/covers/my-game.jpg",
  "url": "https://...",
  "type": "game",
  "icon": "🎲",
  "section": "new",
  "repo": null
}
```

| 欄位 | 說明 |
|---|---|
| `id` | 唯一、小寫、用 `-` 連接。 |
| `title` / `tagline` | 中英各一。試玩區方格只顯示 `title`。 |
| `tags` | 最多 3 個。 |
| `thumbnail` | 縮圖路徑，相對於網站根目錄、不以 `/` 開頭；沒有就填 `null`，改顯示 `icon`。**大小寫要和檔名完全一致**：Windows 不分大小寫，GitHub Pages 分。 |
| `url` | 作品網址。 |
| `type` | `game`（直接可玩）或 `tool`（之後會先開介紹卡；目前還沒有這個行為）。 |
| `icon` | 一個 emoji，沒有縮圖時顯示。 |
| `section` | 放在哪一區：`live`（線上公開大卡，只顯示第一筆）、`demo`（試玩區方格）、`new`（新作）、`games`（更早的遊戲）、`tools`（工具與文件）。 |
| `repo` | 原始碼網址，只有 `live` 大卡會顯示「原始碼」按鈕；沒有就填 `null`。 |

`games` 與 `tools` 兩區只在 `js/app.js` 的 `CONFIG.showArchive` 為 `true` 時顯示。

## 本機預覽

直接雙擊 `index.html` 就能看。資料是用 `<script>` 載入，不是 fetch，所以 `file://` 也讀得到。

要用 http 看（例如檢查資源是否都回 200）時：

```
python -m http.server 8000
```

然後開 http://localhost:8000/。注意：在 Windows 上這台伺服器一樣不分大小寫，檔名大小寫錯誤只有上線後才會出現 404。

## 上線

推到 `main` 後由 GitHub Pages 發佈。
