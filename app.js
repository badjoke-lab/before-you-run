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

  if (!cardList || !emptyState || !detailPanel || !controls) {
    return;
  }

  const isJapanese = (root.lang || "").toLowerCase().startsWith("ja");

  const labels = isJapanese
    ? {
        all: "すべて",
        categoryAll: "すべてのカテゴリ",
        audienceAll: "すべての対象",
        sourceAll: "すべてのソース種別",
        severity: "重要度",
        categories: "カテゴリ",
        audience: "対象読者",
        source: "出典",
        summary: "概要",
        dangerousActions: "危険な行動",
        avoidNow: "今すぐ避けること",
        firstResponse: "すでに実行してしまった場合",
        checkFirst: "先に確認",
        sources: "出典一覧",
        updated: "更新日",
        noSource: "未設定",
        noCards: "カードデータを読み込めませんでした。",
        noData: "表示できるカードがまだありません。",
        noMatch: "該当するカードがありません。キーワードを変えるか、フィルタを外してください。",
        resultCount: (shown, total) => `${total}件中${shown}件を表示`,
        details: "詳細を見る",
        related: "関連カード",
        shared: "共通カテゴリ"
      }
    : {
        all: "All",
        categoryAll: "All categories",
        audienceAll: "All audiences",
        sourceAll: "All source types",
        severity: "Severity",
        categories: "Categories",
        audience: "Audience",
        source: "Source",
        summary: "Summary",
        dangerousActions: "Dangerous actions",
        avoidNow: "Avoid now",
        firstResponse: "If you already did this",
        checkFirst: "Check first",
        sources: "Sources",
        updated: "Updated",
        noSource: "Not set",
        noCards: "Card data is not available yet.",
        noData: "No cards are available yet.",
        noMatch: "No matching cards found. Try another keyword or remove filters.",
        resultCount: (shown, total) => `Showing ${shown} of ${total} cards`,
        details: "View details",
        related: "Related cards",
        shared: "Shared categories"
      };

  const els = {
    search: controls.querySelector("[data-card-search]"),
    category: controls.querySelector("[data-card-category]"),
    severity: controls.querySelector("[data-card-severity]"),
    audience: controls.querySelector("[data-card-audience]"),
    sourceType: controls.querySelector("[data-card-source-type]"),
    reset: controls.querySelector("[data-card-reset]"),
    count: document.querySelector("[data-card-count]")
  };

  const state = { cards: [], filtered: [], categoriesMeta: [], activeId: "" };

  const dataPath = (path) => new URL(isJapanese ? `../${path}` : path, window.location.href);
  const textFor = (card, key) => (isJapanese ? card[`${key}_ja`] || card[key] : card[key]) || "";
  const listFor = (card, key) => (Array.isArray(card[key]) ? card[key] : []).map((x) => String(x));

  const createOption = (value, label) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  };

  const setOptions = (select, options, firstLabel) => {
    if (!select) return;
    select.textContent = "";
    select.append(createOption("all", firstLabel));
    options.forEach((opt) => select.append(createOption(opt.value, opt.label)));
  };

  const normalize = (value) => String(value || "").toLowerCase();

  const getSearchBlob = (card) => {
    const sourceText = (card.sources || []).flatMap((source) => [source.publisher, source.source_type]);
    return [
      card.title,
      card.title_ja,
      card.summary,
      card.summary_ja,
      ...(card.categories || []),
      ...(card.audience || []),
      ...(card.dangerous_actions || []),
      ...(card.dangerous_actions_ja || []),
      ...(card.avoid_now || []),
      ...(card.avoid_now_ja || []),
      ...sourceText
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  const applyFilters = () => {
    const query = normalize(els.search && els.search.value).trim();
    const category = normalize(els.category && els.category.value);
    const severity = normalize(els.severity && els.severity.value);
    const audience = normalize(els.audience && els.audience.value);
    const sourceType = normalize(els.sourceType && els.sourceType.value);

    state.filtered = state.cards.filter((card) => {
      const categoryValues = listFor(card, "categories").map(normalize);
      const audienceValues = listFor(card, "audience").map(normalize);
      const sourceValues = (card.sources || []).map((source) => normalize(source.source_type));

      if (query && !getSearchBlob(card).includes(query)) return false;
      if (category !== "all" && !categoryValues.includes(category)) return false;
      if (severity !== "all" && normalize(card.severity) !== severity) return false;
      if (audience !== "all" && !audienceValues.includes(audience)) return false;
      if (sourceType !== "all" && !sourceValues.includes(sourceType)) return false;
      return true;
    });
  };

  const renderList = () => {
    cardList.textContent = "";
    const total = state.cards.length;
    const shown = state.filtered.length;

    if (els.count) {
      els.count.textContent = labels.resultCount(shown, total);
    }

    if (shown === 0) {
      emptyState.hidden = false;
      emptyState.textContent = labels.noMatch;
      detailPanel.hidden = true;
      detailPanel.textContent = "";
      return;
    }

    emptyState.hidden = true;

    state.filtered.forEach((card) => {
      const item = document.createElement("article");
      item.className = "threat-card flow";

      const title = document.createElement("h3");
      title.className = "threat-card__title";
      title.textContent = textFor(card, "title");

      const meta = document.createElement("div");
      meta.className = "threat-card__meta";

      const severity = document.createElement("span");
      severity.className = "label label--severity";
      severity.textContent = `${labels.severity}: ${card.severity || labels.noSource}`;

      const categories = document.createElement("span");
      categories.className = "label";
      categories.textContent = `${labels.categories}: ${listFor(card, "categories").join(", ") || labels.noSource}`;

      meta.append(severity, categories);

      const summary = document.createElement("p");
      summary.className = "threat-card__summary";
      summary.textContent = textFor(card, "summary");

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = labels.details;
      button.dataset.cardOpen = card.id;

      item.append(title, meta, summary, button);
      cardList.append(item);
    });
  };

  const appendListSection = (container, titleText, items) => {
    if (!items || items.length === 0) return;
    const section = document.createElement("section");
    section.className = "detail-section flow";
    const title = document.createElement("h4");
    title.textContent = titleText;
    const list = document.createElement("ul");
    list.className = "detail-list";
    items.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = entry;
      list.append(li);
    });
    section.append(title, list);
    container.append(section);
  };

  const renderDetail = (card) => {
    detailPanel.hidden = false;
    detailPanel.textContent = "";
    detailPanel.classList.add("detail-panel");

    const head = document.createElement("div");
    head.className = "section-heading";
    const titleWrap = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = textFor(card, "title");
    const summary = document.createElement("p");
    summary.textContent = textFor(card, "summary");
    titleWrap.append(title, summary);

    const meta = document.createElement("p");
    meta.className = "result-count";
    meta.textContent = `${labels.updated}: ${card.updated_at || labels.noSource}`;

    head.append(titleWrap, meta);
    detailPanel.append(head);

    appendListSection(detailPanel, labels.categories, listFor(card, "categories"));
    appendListSection(detailPanel, labels.audience, listFor(card, "audience"));
    appendListSection(detailPanel, labels.dangerousActions, listFor(card, isJapanese ? "dangerous_actions_ja" : "dangerous_actions"));
    appendListSection(detailPanel, labels.avoidNow, listFor(card, isJapanese ? "avoid_now_ja" : "avoid_now"));

    const ifDid = listFor(card, isJapanese ? "if_you_already_did_ja" : "if_you_already_did");
    appendListSection(detailPanel, labels.firstResponse, ifDid);

    const checkFirst = listFor(card, isJapanese ? "check_first_ja" : "check_first");
    appendListSection(detailPanel, labels.checkFirst, checkFirst);

    const sources = (card.sources || []).map((source) => `${source.publisher || labels.noSource} (${source.source_type || labels.noSource})`);
    appendListSection(detailPanel, labels.sources, sources);

    const related = state.cards
      .filter((candidate) => candidate.id !== card.id)
      .map((candidate) => {
        const shared = listFor(candidate, "categories").filter((cat) => listFor(card, "categories").includes(cat));
        return { candidate, shared };
      })
      .filter((entry) => entry.shared.length > 0)
      .slice(0, 3);

    if (related.length > 0) {
      const section = document.createElement("section");
      section.className = "detail-section flow";
      const heading = document.createElement("h4");
      heading.textContent = labels.related;
      const list = document.createElement("ul");
      list.className = "related-list";

      related.forEach(({ candidate, shared }) => {
        const li = document.createElement("li");
        li.className = "related-card";
        li.textContent = `${textFor(candidate, "title")} · ${labels.severity}: ${candidate.severity} · ${labels.shared}: ${shared.join(", ")}`;
        list.append(li);
      });

      section.append(heading, list);
      detailPanel.append(section);
    }
  };

  const openCardById = (id) => {
    const match = state.cards.find((card) => card.id === id);
    if (!match) return;
    state.activeId = id;
    renderDetail(match);
  };

  const setDefaultFilterOptions = (cards, categoriesMeta) => {
    const categoryMap = new Map(categoriesMeta.map((cat) => [cat.id, isJapanese ? cat.name_ja || cat.name : cat.name]));
    const categoryIds = Array.from(new Set(cards.flatMap((card) => listFor(card, "categories")))).sort();
    const audiences = Array.from(new Set(cards.flatMap((card) => listFor(card, "audience")))).sort();

    setOptions(
      els.category,
      categoryIds.map((id) => ({ value: id, label: categoryMap.get(id) ? `${categoryMap.get(id)} (${id})` : id })),
      labels.categoryAll
    );
    setOptions(els.severity, ["high", "medium", "watch"].map((value) => ({ value, label: value })), labels.all);
    setOptions(els.audience, audiences.map((value) => ({ value, label: value })), labels.audienceAll);
    setOptions(els.sourceType, ["primary", "reference", "signal"].map((value) => ({ value, label: value })), labels.sourceAll);
  };

  Promise.all([
    fetch(dataPath("data/threats.json")).then((response) => (response.ok ? response.json() : Promise.reject())),
    fetch(dataPath("data/categories.json")).then((response) => (response.ok ? response.json() : []))
  ])
    .then(([cards, categories]) => {
      if (!Array.isArray(cards) || cards.length === 0) {
        emptyState.hidden = false;
        emptyState.textContent = labels.noData;
        return;
      }

      state.cards = cards;
      state.categoriesMeta = Array.isArray(categories) ? categories : [];
      setDefaultFilterOptions(cards, state.categoriesMeta);

      applyFilters();
      renderList();

      if (window.location.hash) {
        openCardById(window.location.hash.replace("#", ""));
      }
    })
    .catch(() => {
      emptyState.hidden = false;
      emptyState.textContent = labels.noCards;
    });

  controls.addEventListener("input", () => {
    applyFilters();
    renderList();
  });

  controls.addEventListener("change", () => {
    applyFilters();
    renderList();
  });

  els.reset.addEventListener("click", () => {
    if (els.search) els.search.value = "";
    [els.category, els.severity, els.audience, els.sourceType].forEach((select) => {
      if (select) select.value = "all";
    });
    applyFilters();
    renderList();
  });

  cardList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.dataset.cardOpen;
    if (!id) return;
    window.location.hash = id;
    openCardById(id);
  });

  window.addEventListener("hashchange", () => {
    const id = window.location.hash.replace("#", "");
    if (id) {
      openCardById(id);
    }
  });
})();
