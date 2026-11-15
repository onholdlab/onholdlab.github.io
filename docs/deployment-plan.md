# 發布與後端維護方案（2026-11-16）

## 現在的修正

- `scripts/package-site.mjs` 以逐檔 `{path, sha256}` 清單建立全新公開輸出。清單必須先經人工審查；雜湊驗證只能防止檔案在審查後變動，不能判斷照片是否私人。
- `js/feedback.js` 使用 Worker `/feedback`，超長留言拒絕送出，不默默截斷。合併原始碼後仍須更新 Cloudflare 的發布輸出；`onholdlab.com/js/feedback.js` 在本次檢查時仍是 Supabase 舊版。
- 清單、備份、測試結果、原始碼與附件放在公開輸出之外。只能把產生的輸出目錄交給 Wrangler，不能上傳 repo 根目錄或日常工作資料夾。
- 新版部署不會移除舊部署中的檔案。使用者須在 Workers & Pages → onholdlab → Deployments 檢查並刪除含私人檔案的舊部署，包括其預覽網址；本修正不刪除任何部署。

## 兩種自動發布方案

| 方案 | 優點 | 成本與限制 |
|---|---|---|
| 中央 repo 的 GitHub Actions 組合各遊戲，Direct Upload 到現有 Pages 專案（推薦） | 保留現有專案與網域；能測完整路徑站點；同一打包工具可在本機重建 | 需設定限縮權限的 Cloudflare token、跨 repo 更新觸發與發布並行鎖；GitHub 停權會停止後續自動更新 |
| 新建 Cloudflare Pages Git integration 專案，由中央 repo 建置 | 建置與預覽由 Pages 管理，少一部分 CI 發布設定 | 現有 Direct Upload 專案不能直接切 Git integration；須新專案與網域切換；其他遊戲 repo 更新仍需中央清單更新／觸發，並不會自動組合所有 repo |

官方文件：[Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)、[Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)。兩者的已部署靜態資產都由 Cloudflare 提供；只要正式頁面的執行資源不依賴 GitHub，GitHub 停權本身不會撤下現有 Cloudflare 發布。後續建置仍可能停擺，需另存原始碼與完整發布包；也須盤點 github.io／raw.githubusercontent.com 的圖片、字型與程式引用。

## 推薦落地順序（尚未啟用任何 workflow 或帳號設定）

1. 先保留當前完整站點作為可回復的發布包，修正回饋程式。驗證 `/js/feedback.js`、排行榜讀取、許願計數讀取與每款遊戲入口；經授權後才部署。
2. 在中央 repo 維護 `site-sources.json`：每個路徑、來源 repo、完整 commit SHA、公開檔案清單；不以 Pages 開關或 topic 自動決定上線。現有 `works.json` 已是人工清單，沿用其順序、網址與語言限制。
3. 每款遊戲合併到 main 後，由具限縮權限的 GitHub App／token 觸發中央更新 PR，只更新該遊戲 SHA。中央 CI 檢查 commit 屬於允許 repo 的 main、抓取鎖定版本、依白名單組合到 `<遊戲>/`，測試路徑、靜態資源與 API CORS；禁止缺少遊戲時發布不完整站點。長期可在全套檢查通過後自動核准這類版本更新，啟用方式由使用者決定。
4. 中央 main 更新後以 `concurrency` 排隊發布，單一 production writer；受保護的 environment 保存 Cloudflare 部署憑證，PR／fork 測試不取得憑證。先保存完整 artifact、來源 SHA 與雜湊，再部署產物目錄。
5. 每次成功發布額外備份到 GitHub 之外的儲存位置，保留本機重建與直接上傳步驟。備份不放在公開站點內。失敗不影響上一個成功發布。
6. 逐款確認 onholdlab.com 路徑能玩之後，再送 github.io 轉址 PR；保留 query/hash，改 canonical 與絕對 og:image。避免先轉址到尚未部署的路徑。

## Supabase 與 D1

建議暫留 8 棒接力在 Supabase。現有前端呼叫 `relay_state`、`relay_submit`、`relay_vote`、`relay_open`，移到 D1 必須重寫 PostgreSQL RPC、驗證多玩家搶位、投票與揭曉交易的一致性，不能只搬資料表。每日排程不是不中斷保證：現有 Worker 忽略 HTTP 失敗，也沒有告警；宜另規劃健康監測與回復程序。

Supabase Free：500 MB DB、5 GB egress，閒置一週可能暫停；D1 Free：每天 500 萬 rows read、10 萬 rows written、總儲存 5 GB。數值取自 [Supabase 定價](https://supabase.com/pricing) 與 [D1 定價](https://developers.cloudflare.com/d1/platform/pricing/)。D1 查詢成本按掃描列計，不等於 HTTP 次數；若日後遷移，須估算輪詢頻率與索引，不因資料目前少就假設免費額度永遠足夠。

## 掃描流量

交接的 41,320 次／30 天不能單獨證明 DDoS；27,970 次也未提供峰值。建議先在 Security → Security rules 建立針對 `/.git/`、`/.work/`、`/.codex-remote-attachments/` 的 Block 規則並觀察 Security events。不要整國封鎖，也不要僅因單一月總數就對全站設低門檻。

Free 方案有一條 rate limiting rule，可用 Path、Verified Bot 條件、依 IP 計數；若有持續高峰，再針對明確被濫用路徑設定，從實際峰值與正常同 NAT 流量決定門檻。[官方限制](https://developers.cloudflare.com/waf/rate-limiting-rules/)。onholdlab.com 的 zone 規則不涵蓋獨立 `ohl-api.onholdlab.workers.dev`；API 防濫用需另外設計，不能宣稱網站 WAF 已保護它。CORS 也不是驗證機制，沒有 Origin 的腳本請求仍可使用 API。
