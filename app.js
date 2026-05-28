(function () {
  const root = document.documentElement;
  root.classList.add("js-loaded");

  const year = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(year);
  });
})();
