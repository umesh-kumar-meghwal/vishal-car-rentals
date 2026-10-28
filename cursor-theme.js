
(() => {
  if (window.__premiumCursorLoaded) return;
  window.__premiumCursorLoaded = true;

  const css = `
    @media (pointer: fine) {
      html, body, a, button, input, select, textarea,
      [role="button"] {
        cursor: none !important;
      }

      #premium-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 28px;
        height: 28px;
        border: 2px solid #a855f7;
        border-radius: 50%;
        pointer-events: none;
        z-index: 2147483647;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 12px #9333ea,
                    0 0 28px rgba(147, 51, 234, .35);
        transition: width .2s ease, height .2s ease,
                    border-color .2s ease,
                    box-shadow .2s ease;
        will-change: left, top;
      }

      #premium-cursor::after {
        content: "";
        position: absolute;
        width: 5px;
        height: 5px;
        left: 50%;
        top: 50%;
        border-radius: 50%;
        background: #facc15;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 10px #facc15;
      }

      #premium-cursor.cursor-hover {
        width: 44px;
        height: 44px;
        border-color: #d8b4fe;
        box-shadow: 0 0 18px #a855f7,
                    0 0 36px rgba(168, 85, 247, .5);
      }

      #premium-cursor.cursor-click {
        width: 22px;
        height: 22px;
      }
    }

    @media (pointer: coarse), (prefers-reduced-motion: reduce) {
      #premium-cursor { display: none !important; }
    }
  `;

  const style = document.createElement("style");
  style.id = "premium-cursor-styles";
  style.textContent = css;
  document.head.appendChild(style);

  function initCursor() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (document.getElementById("premium-cursor")) return;

    const cursor = document.createElement("div");
    cursor.id = "premium-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);

    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    }, { passive: true });

    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest(
        "a, button, input, select, textarea, [role='button'], .cursor-hover"
      );
      cursor.classList.toggle("cursor-hover", !!target);
    });

    document.addEventListener("mousedown", () =>
      cursor.classList.add("cursor-click")
    );

    document.addEventListener("mouseup", () =>
      cursor.classList.remove("cursor-click")
    );

    document.addEventListener("mouseleave", () => {
      cursor.style.display = "none";
    });

    document.addEventListener("mouseenter", () => {
      cursor.style.display = "block";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCursor, { once: true });
  } else {
    initCursor();
  }
})();
