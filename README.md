# onholdlab.github.io

onholdlab 等候空間的首頁，放在 GitHub Pages。

| 檔案 | 內容 |
|---|---|
| `index.html` | 整個首頁：窗口與鈴、打廣告舞台、最新資訊列表、提問與回饋表單、線條展示框。樣式和程式都在這一頁裡。 |
| `js/feedback.js` | 所有作品共用的玩家回饋，寫進 Supabase 的 `feedback` 表。其他遊戲也可以載入 `https://onholdlab.github.io/js/feedback.js`，用 `OHLFeedback.send({source, kind, message, contact})` 送出。 |

## 新增作品

在 `index.html` 裡找 `const NEWS=[`，在最前面加一筆：`['名稱','一句話介紹','遊戲或工具','網址']`。越前面越新。

## 回饋

送出的內容在 Supabase 後台的 Table Editor → `feedback` 表查看。`feedback.js` 裡的金鑰是 publishable 公開金鑰，只能新增、不能讀，放在網頁裡沒有問題；不要換成 service_role 或 secret 金鑰。

免費的 Supabase 專案一週沒有任何請求會被暫停，要到後台手動恢復。

`DESIGN.md` 是舊版等候室頁面的設計紀錄，目前首頁不再使用。
