// /js/utils/lupa.js
(function () {
  const init = () => {
    const header = document.querySelector(".header-total");
    if (!header) return false;

    const root   = header.querySelector("#search-inline");
    const toggle = header.querySelector("#search-toggle");
    const box    = header.querySelector("#search-box");
    const input  = header.querySelector("#search-input");

    if (!root || !toggle || !box || !input) return false;

    let open = false;

    const openSearch = () => {
      if (open) return;
      open = true;
      root.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      setTimeout(() => input.focus(), 20);
    };

    const closeSearch = () => {
      if (!open) return;
      open = false;
      root.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      input.blur();
    };

    // 👇 SOLO dentro del header
    header.addEventListener("click", (e) => {
      if (toggle.contains(e.target)) {
        open ? closeSearch() : openSearch();
        e.stopPropagation();
        return;
      }

      if (box.contains(e.target)) {
        e.stopPropagation();
        return;
      }

      closeSearch();
    });

    // ESC global (esto sí está bien)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSearch();
    });

    return true;
  };

  // esperar a que el header exista (sin loops infinitos)
  const wait = setInterval(() => {
    if (init()) clearInterval(wait);
  }, 50);
})();
