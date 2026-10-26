# onholdlab.github.io

onholdlab 等候空間的首頁，放在 GitHub Pages。

| 檔案 | 內容 |
|---|---|
| `index.html` | 整個首頁：窗口與鈴、打廣告舞台、最新資訊列表、提問與回饋表單、線條展示框。樣式和程式都在這一頁裡。 |
| `js/feedback.js` | 所有作品共用的玩家回饋，寫進 Supabase 的 `feedback` 表。其他遊戲也可以載入 `https://onholdlab.github.io/js/feedback.js`，用 `OHLFeedback.send({source, kind, message, contact})` 送出。 |

## 新增作品（自動）

開了 GitHub Pages 的公開 repo 都會自動出現在「最新資訊」，越新的越前面。GitHub Action（`.github/workflows/works.yml`）每 6 小時更新一次 `works.json`；想馬上更新，到 repo 的 Actions →「更新作品清單」→ Run workflow。

- **類型**：在 repo 頁面右側 About 加 topic。`game` → 遊戲，`tool` → 工具，都沒有 → 作品。
- **名稱與介紹**：repo 的 description 寫成 `中文名稱｜一句話介紹`。沒有 `｜` 的話，名稱用 repo 名。
- **連結**：預設是 `https://onholdlab.github.io/<repo>/`；repo 的 Website 欄位有填網址就用那個。
- 不想出現在首頁：關掉那個 repo 的 Pages，或把 repo 封存（archive）。

`works.json` 讀不到時，首頁會改用 `index.html` 裡 `const NEWS=[` 的備用清單。

## 回饋

送出的內容在 Supabase 後台的 Table Editor → `feedback` 表查看。`feedback.js` 裡的金鑰是 publishable 公開金鑰，只能新增、不能讀，放在網頁裡沒有問題；不要換成 service_role 或 secret 金鑰。

免費的 Supabase 專案一週沒有任何請求會被暫停，要到後台手動恢復。

`DESIGN.md` 是舊版等候室頁面的設計紀錄，目前首頁不再使用。
