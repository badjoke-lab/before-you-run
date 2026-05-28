# Tripwire MVP仕様書 v0.1

Status: Draft  
Project title: Tripwire（仮）  
Document type: Public-safe MVP specification  
Target release: v0.1  
Last updated: 2026-05-28

---

## 1. 目的

Tripwire（仮）は、初心者・個人開発者・AIコーディング利用者が、日々の開発作業で避けるべき危険行動を確認できる情報サイトである。

本サイトは、セキュリティ専門家向けの脆弱性DBや攻撃解説サイトではない。主目的は、公開情報をもとに、初心者にも分かる形で「何をしてはいけないか」「何を確認すべきか」「安全な代替行動は何か」を整理することである。

---

## 2. MVPの基本方針

v0.1では、以下を満たす最小公開版を作る。

```text
- 危険行動カードを一覧できる
- カード詳細で安全な説明を読める
- カテゴリ・危険度・対象者で絞り込める
- キーワード検索できる
- 各カードにソースURLを表示する
- 情報源の種別や信頼度を見分けられる
- AIコーディング支援ツールに渡せる安全ルールをコピーできる
- チェックリスト、危険コマンド早見表、応急処置ガイドを読める
- 英語rootと日本語 /ja/ を用意する
- モバイルでも読みやすい
```

---

## 3. 対象ユーザー

主な対象ユーザーは以下。

```text
- 初心者個人開発者
- AIコーディング利用者
- GitHub / npm / pip / VS Code / Cursor を使う開発者
- 副業・MVP・個人ツール開発者
- Web3や暗号資産周辺の開発環境に触る個人開発者
```

対象外、またはv0.1では扱わないもの。

```text
- 企業SOC向けの詳細分析
- 高度なマルウェア解析
- 国家系攻撃グループ分析
- Active Directory / Windows Server の深掘り
- 全CVE一覧
- 攻撃手順の再現
- exploitコードやweaponized payloadの掲載
```

---

## 4. v0.1で提供するユーザー価値

ユーザーはv0.1で以下ができる。

```text
- 最新または重要な危険行動カードを見る
- 自分に関係するカテゴリだけを絞り込む
- npm、Cursor、.env、GitHub token などの語句で検索する
- カード詳細で「危険な行動」「避けること」「やってしまった場合」を確認する
- 元ソースURLから根拠を確認する
- AIに貼る安全確認プロンプトをコピーする
- AGENTS.md向けの安全ルールをコピーする
- Cursor Rule向けの安全ルールをコピーする
- チェックリストをコピーする
- 応急処置ガイドを見る
```

---

## 5. v0.1の対象カテゴリ

v0.1ではカテゴリを絞る。カテゴリが増えすぎると初期UIと運用が複雑になるため、以下6カテゴリをMVPカテゴリとする。

```text
1. Unknown Repos
2. Malicious Packages
3. Secrets & Tokens
4. AI Coding Agents
5. Dangerous Commands
6. Scams & Fake Jobs
```

日本語表示は以下。

```text
1. 未知のリポジトリ
2. 悪性パッケージ
3. secrets / token / .env
4. AIコーディング
5. 危険コマンド
6. 偽案件・詐欺
```

将来、カード数が増えた場合は以下を独立カテゴリ化できる。

```text
- VS Code / Cursor extensions
- GitHub Actions / CI secrets
- Web3 wallets / seed phrase
- ClickFix / fake CAPTCHA
- Phishing / fake login
```

---

## 6. 危険度ラベル

v0.1では危険度を細かくしすぎない。

```text
High
Medium
Watch
```

定義は以下。

```text
High:
今すぐ避けるべき危険行動。認証情報、APIキー、ウォレット、アカウント、端末環境に直接影響する可能性がある。

Medium:
状況によって危険。実行前の確認、設定見直し、隔離環境での検証が必要。

Watch:
今すぐ重大とは限らないが、注意しておくべき行動・兆候・話題。
```

---

## 7. 情報源とソース表示

### 7.1 ソースURL必須

危険行動カードには原則としてソースURLを必ず付ける。

```text
- ソースURLなしのカードは原則公開しない
- SNS投稿だけの場合はSignal扱いにする
- 可能な限り公式情報、一次情報、調査会社記事、信頼できるニュース記事を優先する
```

### 7.2 ソース種別

カード上では情報源の種別を以下のように扱う。

```text
Primary:
公式発表、CVE/JVN/GitHub Advisory、OSV、OpenSSF、JPCERT/CCなど

Reference:
調査会社記事、ニュース記事、技術解説、セキュリティブログなど

Signal:
X投稿、SNS投稿、HNコメント、個人投稿、スクショなど
```

Signalだけを根拠に強い断定カードを出さない。Signalは発見・確認用の補助情報として扱う。

### 7.3 カード上の表示

一覧カードでは以下を表示する。

```text
- Source publisher
- Source type
- Updated date
```

カード詳細では以下を表示する。

```text
- 元記事タイトル
- publisher
- URL
- published_at
- checked_at
- source_type
```

---

## 8. 表示する情報 / 表示しない情報

### 8.1 表示するもの

```text
- リスクカテゴリ
- 初心者向けの安全な説明
- 避けるべき行動
- 安全な代替案
- source links
- confidence / freshness / severity labels
- public-safe summaries
- 応急処置の初動
- AIに安全確認させるためのプロンプト
```

### 8.2 表示しないもの

```text
- exploit手順
- 攻撃手順
- 認証情報窃取方法
- 回避手順
- weaponized payload
- 未確認情報の断定
- 特定個人や組織への根拠不十分な非難
- 内部戦略
```

---

## 9. 安全な表現ルール

v0.1では、危険情報を扱う際に以下を守る。

```text
- 攻撃方法の再現性を高めない
- 実行可能な攻撃手順を書かない
- コードやコマンドは「やるな」「確認せよ」の文脈で最小限にする
- 未確認情報は断定しない
- SNS由来情報はSignal扱いにする
- 初心者向けに、まず避ける行動を明確にする
- 恐怖を煽るより、具体的な安全行動を示す
```

---

## 10. URL構造

v0.1では以下のURL構造を想定する。

```text
/
  English root / 最新カード一覧

/ja/
  日本語トップ

/cards/
  全カード一覧

/cards/[id]/
  カード詳細

/categories/
  カテゴリ一覧

/checklists/
  チェックリスト

/commands/
  危険コマンド早見表

/after-incident/
  やってしまった場合

/sources/
  情報源とTier説明

/ai-rules/
  AI向け出力
```

`/weekly/` はv0.1では必須にしない。カード数が増えてから追加する。

---

## 11. 言語方針

MVPでは、英語rootと日本語 `/ja/` を用意する。

```text
/
  English root

/ja/
  Japanese version
```

基本方針は以下。

```text
- rootは英語
- /ja/ は日本語
- 同じカードIDで英語本文と日本語本文を持つ
- 初期は英日だけ対応する
- 他言語はv0.1では扱わない
```

将来候補。

```text
/ko/
/zh-hant/
/es/
/pt-br/
```

---

## 12. UI方針

初期UIは、読みやすさと信頼性を優先する。

```text
- 白背景・黒テキスト中心
- 装飾を増やしすぎない
- AIっぽい派手な見た目にしない
- 読みやすさ優先
- 初期からモバイル対応
- 後からページやデータを増やせる構成
```

避けること。

```text
- generic scaffold のまま出す
- どのプロジェクトでも同じに見えるAI生成風UI
- モバイル後回し
- PCだけでしか読めない密度
- 過度なグラデーションや装飾
- 重要情報をカード装飾だけでごまかす
```

優先すること。

```text
- 何のサイトか開いてすぐ分かる
- 主要導線が見える
- 注意書きが見える
- 情報の境界が分かる
- 公開していない情報を期待させない
- モバイルでも破綻しない
- 後からページやデータを増やせる
```

---

## 13. レスポンシブ方針

v0.1からモバイル対応を必須とする。

```text
- 360px幅で読める
- カード一覧が縦に自然に並ぶ
- フィルタUIはモバイルで折りたためる
- カード詳細は本文を読みやすくする
- ソースURLは折り返しまたは短縮表示する
- コピー操作はモバイルでも押しやすくする
```

---

## 14. ページ別仕様

### 14.1 トップページ `/`

表示内容。

```text
- サイト概要
- 最新または重要カード一覧
- カテゴリ導線
- 検索ボックス
- 危険度フィルタ
- Source policyへの導線
- 日本語版へのリンク
```

### 14.2 日本語トップ `/ja/`

表示内容はrootと同等。ただし本文は日本語。

```text
- サイト概要
- 最新または重要カード一覧
- カテゴリ導線
- 検索ボックス
- 危険度フィルタ
- Source policyへの導線
- 英語版へのリンク
```

### 14.3 カード一覧 `/cards/`

表示内容。

```text
- 全カード一覧
- 検索
- カテゴリフィルタ
- 危険度フィルタ
- 対象者フィルタ
- source type表示
- updated_at表示
```

### 14.4 カード詳細 `/cards/[id]/`

表示内容。

```text
- タイトル
- 危険度
- カテゴリ
- 対象者
- 危険な行動
- なぜ危ないか
- 今すぐ避けること
- やってしまった場合
- 確認すべき場所
- 元ソースURL
- AI / Agent Safety セクション
- 関連カード
```

### 14.5 カテゴリ一覧 `/categories/`

表示内容。

```text
- MVPカテゴリ6種
- 各カテゴリの説明
- 各カテゴリのカード数
- カテゴリ別カード一覧への導線
```

### 14.6 チェックリスト `/checklists/`

v0.1では固定コンテンツとして最小限のチェックリストを表示する。

初期候補。

```text
- Unknown repository checklist
- npm / package install checklist
- Secrets exposure checklist
- AI coding safety checklist
```

### 14.7 危険コマンド早見表 `/commands/`

危険になりやすいコマンド例と、なぜ注意が必要かを安全な範囲で説明する。

表示方針。

```text
- コマンドを実行可能な攻撃手順として説明しない
- 危険性と確認観点を説明する
- safer alternativeを示す
```

### 14.8 応急処置 `/after-incident/`

v0.1の初期ガイド。

```text
- 怪しいrepoを開いてしまった
- npm installしてしまった
- .envを公開してしまった
- APIキーを貼ってしまった
- ウォレット秘密鍵を入力してしまった
```

### 14.9 情報源 `/sources/`

表示内容。

```text
- Source type: Primary / Reference / Signal
- Source tierの説明
- SNS情報の扱い
- ソースURL必須方針
- 未確認情報を断定しない方針
```

### 14.10 AI向け出力 `/ai-rules/`

表示内容。

```text
- AI向け出力の説明
- Copy AI Review Prompt
- Copy AGENTS.md Rule
- Copy Cursor Rule
- Copy Checklist
- カード単体 / カテゴリ別 / 全体版の違い
```

v0.1では、カードデータからブラウザ側で動的生成する。

---

## 15. データ構造

v0.1では `data/threats.json` を中心にする。

### 15.1 threat card schema

```json
{
  "id": "unknown-repo-cursor-open",
  "title": "Do not open unknown repositories in Cursor before review",
  "title_ja": "知らないGitHub repoをCursorで開く前に注意",
  "severity": "high",
  "categories": ["unknown-repos", "ai-coding-agents", "secrets-tokens"],
  "audience": ["beginner", "indie-dev", "ai-coding"],
  "dangerous_actions": [],
  "dangerous_actions_ja": [],
  "why_it_matters": "",
  "why_it_matters_ja": "",
  "avoid_now": [],
  "avoid_now_ja": [],
  "if_you_already_did": [],
  "if_you_already_did_ja": [],
  "check_first": [],
  "check_first_ja": [],
  "sources": [],
  "signals": [],
  "ai_output": {},
  "published_at": "2026-05-28",
  "updated_at": "2026-05-28"
}
```

### 15.2 source object

```json
{
  "title": "source title",
  "url": "https://example.com",
  "publisher": "Socket",
  "source_tier": "tier1",
  "source_type": "primary",
  "published_at": "2026-05-28",
  "checked_at": "2026-05-28"
}
```

### 15.3 signal object

```json
{
  "platform": "X",
  "url": "https://x.com/...",
  "status": "reference-only",
  "note": "Used as discovery signal, not sole basis."
}
```

---

## 16. `ai_output` schema

AI向け出力を自動生成するため、各カードに `ai_output` を持たせる。

```json
"ai_output": {
  "risk_summary": "",
  "do_not": [],
  "check_first": [],
  "safe_actions": [],
  "ask_user_before": [],
  "agent_instruction": "",
  "checklist": []
}
```

用途。

```text
- Copy AI Review Prompt
- Copy AGENTS.md Rule
- Copy Cursor Rule
- Copy Checklist
- カテゴリ別Safety Pack
- 全体版AI Safety Rules
```

---

## 17. AI向け出力の生成仕様

AI向け出力は手作業で個別ファイルを作らない。  
`data/threats.json` のカードデータと `ai_output` から自動生成する。

### 17.1 MVPで提供する出力

```text
1. Copy AI Review Prompt
2. Copy AGENTS.md Rule
3. Copy Cursor Rule
4. Copy Checklist
```

### 17.2 生成方式

v0.1ではブラウザ側で動的生成する。

```text
data/threats.json を読み込む
↓
ユーザーがボタンを押す
↓
app.js がMarkdown文字列を生成
↓
クリップボードにコピー、または.mdとしてダウンロード
```

### 17.3 後回しにするもの

```text
- generated/*.md の事前生成
- SECURITY_AI_RULES.md 一括DL
- CLAUDE.md生成
- カテゴリ別Safety Packのファイル出力
```

---

## 18. 検索・フィルタ仕様

v0.1ではクライアント側検索でよい。

検索対象。

```text
- title
- title_ja
- categories
- audience
- dangerous_actions
- avoid_now
- why_it_matters
- sources.publisher
```

フィルタ。

```text
- category
- severity
- audience
- source_type
```

検索結果がない場合は、空状態メッセージを表示する。

```text
No matching cards found.
Try another keyword or remove filters.
```

日本語では以下。

```text
該当するカードがありません。
キーワードを変えるか、フィルタを外してください。
```

---

## 19. データ検証仕様

`validate-data.mjs` で最低限以下を検証する。

```text
- id重複なし
- title必須
- title_ja必須
- severity必須
- category必須
- sources URL必須
- updated_at必須
- dangerous_actionsが空でない
- avoid_nowが空でない
- ai_outputが空でない
- source_typeが primary / reference / signal のいずれか
- severityが high / medium / watch のいずれか
```

検証エラーがある場合は、GitHub Actionsで失敗させる。

---

## 20. 初期コンテンツ範囲

v0.1公開時点の目標。

```text
- 危険行動カード: 20〜30件
- チェックリスト: 3〜5本
- 危険コマンド早見表: 初期版
- 応急処置ガイド: 5本
- 用語ミニ辞典: 10〜20語
```

初期カード候補。

```text
- Unknown repoをVS Code / Cursorで開くな
- npm installを即実行するな
- postinstall / prepare scriptを確認しろ
- curl | bash を実行するな
- Win+R / PowerShellに貼れと言われたら止まれ
- .envをGitHubに上げるな
- APIキーをAIチャットに貼るな
- GitHub tokenを最小権限にしろ
- GitHub Actions secretsを外部PRで雑に扱うな
- 偽求人・技術テストrepoに注意
- 偽MVPレビュー依頼に注意
- VS Code拡張を安易に入れるな
- npx unknown-packageを実行するな
- ウォレットseed phraseを入力するな
- 秘密鍵があるPCで怪しいコードを動かすな
```

---

## 21. 技術構成

v0.1では無料運営しやすい静的構成にする。

```text
GitHub public repo
Cloudflare Pages
GitHub Actions
静的HTML / CSS / JS
JSONデータ駆動
DBなし
Cloudflare Workersなし
有料APIなし
```

初期構成。

```text
/
  index.html
  styles.css
  app.js

/data/
  threats.json
  sources.json
  source-tiers.json
  glossary.json
  checklists.json

/scripts/
  validate-data.mjs

/ja/
  index.html
```

候補収集scriptはv0.2以降で追加する。

---

## 22. CSS構成方針

CSSは後から拡張しやすいように分ける。

推奨構成。

```text
styles/theme.css
styles/base.css
styles/layout.css
styles/components.css
styles/utilities.css
```

役割。

```text
theme.css      色・余白・フォントなどの変数
base.css       body / a / focus など基本要素
layout.css     header / footer / main / grid など大枠
components.css card / hero / nav など部品
utilities.css  visually-hidden / flow など補助
```

単一 `styles.css` で開始してもよいが、PRの早い段階で分割する。

---

## 23. ライセンス方針

本プロジェクトは、open code + curated content 型とする。

```text
コード：MIT License
カード本文・翻訳・チェックリスト・応急処置ガイド・AI向けルール文：CC BY-NC 4.0
```

repoに置く予定のファイル。

```text
LICENSE
CONTENT-LICENSE.md
NOTICE.md
README.md
```

READMEには、コードとコンテンツのライセンスが異なることを明記する。

---

## 24. 免責・制限

v0.1では以下を明記する。

```text
このサイトは一般的な安全情報を提供するものであり、完全な防御や診断を保証しません。
攻撃手順の実行を推奨しません。
未知のコードは隔離環境で扱ってください。
重大な被害が疑われる場合は、各サービスの公式サポートや専門家に相談してください。
```

既知の制限。

```text
- v0.1では自動収集は本格実装しない
- v0.1のカードは初期手動整備が中心
- Signal情報は正式カード化の主根拠にしない
- AI向け出力は補助であり、安全を保証しない
- カード数は初期段階では限定的
```

---

## 25. v0.1の完成条件

v0.1は以下を満たしたら完成とする。

```text
- 英語rootが表示できる
- 日本語 /ja/ が表示できる
- data/threats.json からカード一覧を表示できる
- カード詳細を表示できる
- 検索・フィルタが動く
- ソースURLを表示できる
- source_typeを表示できる
- AI向けCopy機能が動く
- チェックリストページがある
- 危険コマンド早見表がある
- 応急処置ガイドがある
- sourcesページがある
- ライセンスとNOTICEがある
- validate-data.mjs が通る
- モバイルで読める
- 初期カード20〜30件が入っている
```

---

## 26. v0.1ではやらないこと

```text
- 本格的なRSS/API自動収集
- OSV / GitHub Advisory / OpenSSF連携
- Bluesky / Mastodon収集
- X自動収集
- 週次まとめ自動生成
- ニュースレター
- スポンサー枠
- generated/*.md の事前生成
- DB導入
- ログイン機能
- ユーザー投稿機能
```

---

## 27. 初期PR想定

```text
PR-00: MVP仕様固定
PR-01: 静的サイト土台
PR-02: data/threats.json とカード一覧
PR-03: カード詳細・検索・フィルタ
PR-04: ai_output とAI向けCopy
PR-05: checklists / commands / after-incident / sources
PR-06: LICENSE / CONTENT-LICENSE / NOTICE / validate-data
PR-07: 初期カード増強・v0.1公開調整
```

---

## 28. マージ後報告ルール

PRをマージするたびに、以下を報告する。

```text
1. マージ完了
2. v0.1完成までの全体スケジュール
3. 現在地
4. 次のPR
```

---

## 29. v0.1以降の拡張予定

v0.2以降で以下を追加する。

```text
v0.2:
RSS / ニュース候補収集、candidate digest生成

v0.3:
OSV、GitHub Advisory、OpenSSF連携

v0.4:
Google Alerts、HN、Bluesky、Mastodon、X検索リンク生成

v0.5:
カテゴリ別AI Safety Pack、全体版AI Rules生成

v0.6:
カード100件規模、応急処置・チェックリスト・辞典の拡充

v0.7:
週次・月次まとめ

v0.8:
RSS、llms.txt、SEO、公開強化

v1.0:
危険行動カード、候補収集、AI向け出力、週次運用が揃った完成版
```

---

## 30. まとめ

Tripwire v0.1は、危険行動カードを中心にした、初心者・個人開発者向けの最小公開版である。

v0.1の価値は、以下にある。

```text
- 危険な開発行動を初心者向けに整理する
- ソースURL付きで根拠を確認できる
- 攻撃手順ではなく、安全行動を表示する
- AIコーディング環境に貼れる安全ルールを生成する
- 英語rootと日本語/jaで読める
```

v0.1では速報性や大規模自動収集ではなく、カード形式、UI、情報境界、AI向け出力、初期コンテンツの成立を優先する。
