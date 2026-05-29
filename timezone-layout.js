(function () {
  const moveTimezoneControl = () => {
    const target = document.querySelector("[data-timezone-controls]");
    const select = document.querySelector("[data-card-timezone]");
    if (!target || !select) return;

    const label = select.closest("label");
    if (!label || label.parentElement === target) return;

    label.classList.add("timezone-control");
    target.append(label);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", moveTimezoneControl);
  } else {
    moveTimezoneControl();
  }
})();
