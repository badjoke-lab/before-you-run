(function () {
  const root = document.documentElement;
  root.classList.add("js-loaded");

  const year = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(year);
  });

  const cardList = document.querySelector("[data-card-list]");
  const emptyState = document.querySelector("[data-card-empty]");
  const detailPanel = document.querySelector("[data-card-detail]");
  const controls = document.querySelector("[data-card-controls]");

  if (!cardList || !emptyState || !detailPanel || !controls) return;

  const isJapanese = (root.lang || "").toLowerCase().startsWith("ja");

  const labels = isJapanese
    ? {
        all: "すべて", categoryAll: "すべてのカテゴリ", audienceAll: "すべての対象", sourceAll: "すべてのソース種別",
        severity: "重要度", categories: "カテゴリ", audience: "対象読者", source: "出典", summary: "概要",
        dangerousActions: "危険な行動", avoidNow: "今すぐ避けること", firstResponse: "すでに実行してしまった場合",
        checkFirst: "先に確認", sources: "出典一覧", updated: "更新日", noSource: "未設定",
        noCards: "カードデータを読み込めませんでした。", noData: "表示できるカードがまだありません。",
        noMatch: "該当するカードがありません。キーワードを変えるか、フィルタを外してください。",
        resultCount: (shown, total) => `${total}件中${shown}件を表示`, details: "詳細を見る", related: "関連カード", shared: "共通カテゴリ",
        aiSafety: "AI / エージェント安全ルール", aiUnavailable: "このカードのAI向け安全出力は未設定です。",
        copyReview: "AI確認プロンプトをコピー", copyAgents: "AGENTS.mdルールをコピー", copyCursor: "Cursor Ruleをコピー", copyChecklist: "チェックリストをコピー",
        copied: "コピーしました。", copyFailed: "コピーに失敗しました。手動で選択してコピーしてください。",
        copyHeaders: { review: "# AI安全確認", risk: "## リスク概要", doNot: "## しないこと", checkFirst: "## 先に確認", safeActions: "## 安全な対応", askFirst: "## 事前に確認", instruction: "## 指示" }
      }
    : {
        all: "All", categoryAll: "All categories", audienceAll: "All audiences", sourceAll: "All source types",
        severity: "Severity", categories: "Categories", audience: "Audience", source: "Source", summary: "Summary",
        dangerousActions: "Dangerous actions", avoidNow: "Avoid now", firstResponse: "If you already did this",
        checkFirst: "Check first", sources: "Sources", updated: "Updated", noSource: "Not set",
        noCards: "Card data is not available yet.", noData: "No cards are available yet.",
        noMatch: "No matching cards found. Try another keyword or remove filters.",
        resultCount: (shown, total) => `Showing ${shown} of ${total} cards`, details: "View details", related: "Related cards", shared: "Shared categories",
        aiSafety: "AI / Agent Safety", aiUnavailable: "AI safety output is not available for this card.",
        copyReview: "Copy AI Review Prompt", copyAgents: "Copy AGENTS.md Rule", copyCursor: "Copy Cursor Rule", copyChecklist: "Copy Checklist",
        copied: "Copied.", copyFailed: "Copy failed. Select and copy the text manually.",
        copyHeaders: { review: "# AI Safety Review", risk: "## Risk summary", doNot: "## Do not", checkFirst: "## Check first", safeActions: "## Safe actions", askFirst: "## Ask the user before", instruction: "## Instruction" }
      };

  const els = { search: controls.querySelector("[data-card-search]"), category: controls.querySelector("[data-card-category]"), severity: controls.querySelector("[data-card-severity]"), audience: controls.querySelector("[data-card-audience]"), sourceType: controls.querySelector("[data-card-source-type]"), reset: controls.querySelector("[data-card-reset]"), count: document.querySelector("[data-card-count]") };
  const state = { cards: [], filtered: [] };

  const dataPath = (path) => new URL(isJapanese ? `../${path}` : path, window.location.href);
  const textFor = (card, key) => (isJapanese ? card[`${key}_ja`] || card[key] : card[key]) || "";
  const listFor = (card, key) => (Array.isArray(card[key]) ? card[key] : []).map((x) => String(x));
  const normalize = (value) => String(value || "").toLowerCase();

  const createOption = (value, label) => Object.assign(document.createElement("option"), { value, textContent: label });
  const setOptions = (select, options, firstLabel) => { if (!select) return; select.textContent = ""; select.append(createOption("all", firstLabel)); options.forEach((opt) => select.append(createOption(opt.value, opt.label))); };

  const formatBullets = (items, prefix = "- ") => items.map((v) => `${prefix}${v}`).join("\n");
  const aiDataFor = (card) => (isJapanese ? card.ai_output_ja || card.ai_output : card.ai_output);

  const buildCopyText = (type, card, ai) => {
    const title = textFor(card, "title");
    if (type === "review") {
      return [
        labels.copyHeaders.review,
        isJapanese ? "\nこのタスクの実行前に確認してください。" : "\nReview this task before taking action.",
        `\n${labels.copyHeaders.risk}\n\n${ai.risk_summary || ""}`,
        `\n${labels.copyHeaders.doNot}\n\n${formatBullets(ai.do_not || [])}`,
        `\n${labels.copyHeaders.checkFirst}\n\n${formatBullets(ai.check_first || [])}`,
        `\n${labels.copyHeaders.safeActions}\n\n${formatBullets(ai.safe_actions || [])}`,
        `\n${labels.copyHeaders.askFirst}\n\n${formatBullets(ai.ask_user_before || [])}`,
        `\n${labels.copyHeaders.instruction}\n\n${ai.agent_instruction || ""}`
      ].join("\n").trim();
    }
    if (type === "agents") {
      return isJapanese
        ? `## 安全ルール: ${title}\n\nリスク概要:\n${ai.risk_summary || ""}\n\nルール:\n${formatBullets((ai.do_not || []).map((x) => `しない: ${x}`))}\n${formatBullets((ai.check_first || []).map((x) => `確認: ${x}`))}\n${formatBullets((ai.ask_user_before || []).map((x) => `事前確認: ${x}`))}\n\nエージェント指示:\n${ai.agent_instruction || ""}`
        : `## Safety rule: ${title}\n\nRisk summary:\n${ai.risk_summary || ""}\n\nRules:\n${formatBullets((ai.do_not || []).map((x) => `Do not ${x}`))}\n${formatBullets((ai.check_first || []).map((x) => `Check ${x}`))}\n${formatBullets((ai.ask_user_before || []).map((x) => `Ask the user before ${x}`))}\n\nAgent instruction:\n${ai.agent_instruction || ""}`;
    }
    if (type === "cursor") {
      const top = isJapanese ? `# Cursor safety rule: ${title}\n\nこのプロジェクトで作業するとき:` : `# Cursor safety rule: ${title}\n\nWhen working on this project:`;
      const lines = [...(ai.do_not || []), ...(ai.check_first || []), ...(ai.safe_actions || [])].slice(0, 6);
      const end = isJapanese
        ? "\n\n危険なコマンドを実行する前に、実行内容を説明してユーザー確認を取ってください。"
        : "\n\nBefore executing risky commands, explain what will run and ask for user confirmation.";
      return `${top}\n\n${formatBullets(lines)}${end}`;
    }
    return `${isJapanese ? "# チェックリスト" : "# Checklist"}: ${title}\n\n${formatBullets(ai.checklist || [], "- [ ] ")}`;
  };

  const appendListSection = (container, titleText, items) => {
    if (!items || items.length === 0) return;
    const section = document.createElement("section"); section.className = "detail-section flow";
    section.append(Object.assign(document.createElement("h4"), { textContent: titleText }));
    const list = document.createElement("ul"); list.className = "detail-list";
    items.forEach((entry) => list.append(Object.assign(document.createElement("li"), { textContent: entry })));
    section.append(list); container.append(section);
  };

  const addAiPanel = (card) => {
    const ai = aiDataFor(card);
    const panel = document.createElement("section"); panel.className = "detail-section flow ai-output-panel";
    panel.append(Object.assign(document.createElement("h4"), { textContent: labels.aiSafety }));
    if (!ai) { panel.append(Object.assign(document.createElement("p"), { className: "copy-status", textContent: labels.aiUnavailable })); detailPanel.append(panel); return; }
    const actions = document.createElement("div"); actions.className = "copy-actions";
    const status = document.createElement("p"); status.className = "copy-status";
    const fallback = document.createElement("textarea"); fallback.className = "copy-fallback"; fallback.readOnly = true; fallback.hidden = true;

    const addBtn = (type, label) => {
      const btn = document.createElement("button"); btn.type = "button"; btn.textContent = label;
      btn.addEventListener("click", async () => {
        const text = buildCopyText(type, card, ai);
        fallback.hidden = true; fallback.value = "";
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text); status.textContent = labels.copied;
          } else throw new Error("clipboard unavailable");
        } catch (_err) {
          status.textContent = labels.copyFailed;
          fallback.hidden = false; fallback.value = text; fallback.focus(); fallback.select();
        }
      });
      actions.append(btn);
    };

    addBtn("review", labels.copyReview); addBtn("agents", labels.copyAgents); addBtn("cursor", labels.copyCursor); addBtn("checklist", labels.copyChecklist);
    panel.append(actions, status, fallback); detailPanel.append(panel);
  };

  const renderDetail = (card) => {
    detailPanel.hidden = false; detailPanel.textContent = ""; detailPanel.classList.add("detail-panel");
    const head = document.createElement("div"); head.className = "section-heading";
    const titleWrap = document.createElement("div");
    titleWrap.append(Object.assign(document.createElement("h3"), { textContent: textFor(card, "title") }), Object.assign(document.createElement("p"), { textContent: textFor(card, "summary") }));
    head.append(titleWrap, Object.assign(document.createElement("p"), { className: "result-count", textContent: `${labels.updated}: ${card.updated_at || labels.noSource}` }));
    detailPanel.append(head);
    appendListSection(detailPanel, labels.categories, listFor(card, "categories"));
    appendListSection(detailPanel, labels.audience, listFor(card, "audience"));
    appendListSection(detailPanel, labels.dangerousActions, listFor(card, isJapanese ? "dangerous_actions_ja" : "dangerous_actions"));
    appendListSection(detailPanel, labels.avoidNow, listFor(card, isJapanese ? "avoid_now_ja" : "avoid_now"));
    appendListSection(detailPanel, labels.firstResponse, listFor(card, isJapanese ? "if_you_already_did_ja" : "if_you_already_did"));
    appendListSection(detailPanel, labels.checkFirst, listFor(card, isJapanese ? "check_first_ja" : "check_first"));
    appendListSection(detailPanel, labels.sources, (card.sources || []).map((s) => `${s.publisher || labels.noSource} (${s.source_type || labels.noSource})`));
    addAiPanel(card);
  };

  const applyFilters = () => {
    const query = normalize(els.search && els.search.value).trim(); const category = normalize(els.category && els.category.value); const severity = normalize(els.severity && els.severity.value); const audience = normalize(els.audience && els.audience.value); const sourceType = normalize(els.sourceType && els.sourceType.value);
    const getSearchBlob = (card) => [card.title, card.title_ja, card.summary, card.summary_ja, ...(card.categories || []), ...(card.audience || []), ...(card.dangerous_actions || []), ...(card.dangerous_actions_ja || []), ...(card.avoid_now || []), ...(card.avoid_now_ja || []), ...((card.sources || []).flatMap((s) => [s.publisher, s.source_type]))].filter(Boolean).join(" ").toLowerCase();
    state.filtered = state.cards.filter((card) => {
      const categoryValues = listFor(card, "categories").map(normalize); const audienceValues = listFor(card, "audience").map(normalize); const sourceValues = (card.sources || []).map((s) => normalize(s.source_type));
      if (query && !getSearchBlob(card).includes(query)) return false;
      if (category !== "all" && !categoryValues.includes(category)) return false;
      if (severity !== "all" && normalize(card.severity) !== severity) return false;
      if (audience !== "all" && !audienceValues.includes(audience)) return false;
      if (sourceType !== "all" && !sourceValues.includes(sourceType)) return false;
      return true;
    });
  };

  const renderList = () => {
    cardList.textContent = ""; const total = state.cards.length; const shown = state.filtered.length; if (els.count) els.count.textContent = labels.resultCount(shown, total);
    if (shown === 0) { emptyState.hidden = false; emptyState.textContent = labels.noMatch; detailPanel.hidden = true; detailPanel.textContent = ""; return; }
    emptyState.hidden = true;
    state.filtered.forEach((card) => {
      const item = Object.assign(document.createElement("article"), { className: "threat-card flow" });
      item.append(Object.assign(document.createElement("h3"), { className: "threat-card__title", textContent: textFor(card, "title") }));
      const meta = Object.assign(document.createElement("div"), { className: "threat-card__meta" });
      meta.append(Object.assign(document.createElement("span"), { className: "label label--severity", textContent: `${labels.severity}: ${card.severity || labels.noSource}` }), Object.assign(document.createElement("span"), { className: "label", textContent: `${labels.categories}: ${listFor(card, "categories").join(", ") || labels.noSource}` }));
      item.append(meta, Object.assign(document.createElement("p"), { className: "threat-card__summary", textContent: textFor(card, "summary") }));
      const button = Object.assign(document.createElement("button"), { type: "button", textContent: labels.details }); button.dataset.cardOpen = card.id; item.append(button);
      cardList.append(item);
    });
  };

  const openCardById = (id) => { const match = state.cards.find((card) => card.id === id); if (match) renderDetail(match); };

  Promise.all([fetch(dataPath("data/threats.json")).then((r) => (r.ok ? r.json() : Promise.reject())), fetch(dataPath("data/categories.json")).then((r) => (r.ok ? r.json() : []))])
    .then(([cards, categories]) => {
      if (!Array.isArray(cards) || cards.length === 0) { emptyState.hidden = false; emptyState.textContent = labels.noData; return; }
      state.cards = cards;
      const catMap = new Map((Array.isArray(categories) ? categories : []).map((c) => [c.id, isJapanese ? c.name_ja || c.name : c.name]));
      const categoryIds = Array.from(new Set(cards.flatMap((card) => listFor(card, "categories")))).sort();
      const audiences = Array.from(new Set(cards.flatMap((card) => listFor(card, "audience")))).sort();
      setOptions(els.category, categoryIds.map((id) => ({ value: id, label: catMap.get(id) ? `${catMap.get(id)} (${id})` : id })), labels.categoryAll);
      setOptions(els.severity, ["high", "medium", "watch"].map((value) => ({ value, label: value })), labels.all);
      setOptions(els.audience, audiences.map((value) => ({ value, label: value })), labels.audienceAll);
      setOptions(els.sourceType, ["primary", "reference", "signal"].map((value) => ({ value, label: value })), labels.sourceAll);
      applyFilters(); renderList(); if (window.location.hash) openCardById(window.location.hash.replace("#", ""));
    })
    .catch(() => { emptyState.hidden = false; emptyState.textContent = labels.noCards; });

  controls.addEventListener("input", () => { applyFilters(); renderList(); });
  controls.addEventListener("change", () => { applyFilters(); renderList(); });
  els.reset.addEventListener("click", () => { if (els.search) els.search.value = ""; [els.category, els.severity, els.audience, els.sourceType].forEach((s) => { if (s) s.value = "all"; }); applyFilters(); renderList(); });
  cardList.addEventListener("click", (event) => { const target = event.target; if (!(target instanceof HTMLElement)) return; const id = target.dataset.cardOpen; if (!id) return; window.location.hash = id; openCardById(id); });
  window.addEventListener("hashchange", () => { const id = window.location.hash.replace("#", ""); if (id) openCardById(id); });
})();
