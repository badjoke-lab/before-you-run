(function () {
  const root = document.documentElement;
  root.classList.add("js-loaded");

  const year = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(year);
  });

  const cardList = document.querySelector("[data-card-list]");
  const emptyState = document.querySelector("[data-card-empty]");

  if (!cardList || !emptyState) {
    return;
  }

  const isJapanese = (root.lang || "").toLowerCase().startsWith("ja");

  const labels = isJapanese
    ? {
        severity: "重要度",
        categories: "カテゴリ",
        source: "出典",
        updated: "更新日",
        noSource: "未設定",
        noCards: "カードデータを読み込めませんでした。",
        noData: "表示できるカードがまだありません。"
      }
    : {
        severity: "Severity",
        categories: "Categories",
        source: "Source",
        updated: "Updated",
        noSource: "Not set",
        noCards: "Card data is not available yet.",
        noData: "No cards are available yet."
      };

  const setEmptyState = (message) => {
    cardList.textContent = "";
    emptyState.hidden = false;
    emptyState.textContent = message;
  };

  const renderCards = (cards) => {
    cardList.textContent = "";

    cards.forEach((card) => {
      const item = document.createElement("article");
      item.className = "threat-card flow";

      const title = document.createElement("h3");
      title.className = "threat-card__title";
      title.textContent = isJapanese ? card.title_ja || card.title : card.title;

      const meta = document.createElement("div");
      meta.className = "threat-card__meta";

      const severity = document.createElement("span");
      severity.className = "label label--severity";
      severity.textContent = `${labels.severity}: ${card.severity || labels.noSource}`;

      const categories = document.createElement("span");
      categories.className = "label";
      categories.textContent = `${labels.categories}: ${(card.categories || []).join(", ") || labels.noSource}`;

      const source = (card.sources || [])[0] || {};
      const sourceLabel = document.createElement("span");
      sourceLabel.className = "label label--source";
      const publisher = source.publisher || labels.noSource;
      const sourceType = source.source_type || labels.noSource;
      sourceLabel.textContent = `${labels.source}: ${publisher} (${sourceType})`;

      const updated = document.createElement("span");
      updated.className = "label";
      updated.textContent = `${labels.updated}: ${card.updated_at || labels.noSource}`;

      meta.append(severity, categories, sourceLabel, updated);

      const summary = document.createElement("p");
      summary.className = "threat-card__summary";
      summary.textContent = isJapanese ? card.summary_ja || card.summary : card.summary;

      item.append(title, meta, summary);
      cardList.append(item);
    });
  };

  const dataUrl = new URL(isJapanese ? "../data/threats.json" : "data/threats.json", window.location.href);

  fetch(dataUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch card data.");
      }
      return response.json();
    })
    .then((cards) => {
      if (!Array.isArray(cards) || cards.length === 0) {
        setEmptyState(labels.noData);
        return;
      }

      emptyState.hidden = true;
      renderCards(cards);
    })
    .catch(() => {
      setEmptyState(labels.noCards);
    });
})();
