const PLUS_EX_ORIGIN = "https://www.plus-ex.com";
const SKBP_FEATURED_CARD_HTML = `
<div class="experience__item ux active visible" data-a11yway-featured-card="skbp">
  <div class="experience__badge">
    <div class="n-badge center">
      <div class="n-badge-wrap">
        <div class="n-badge-item   ">2 awards</div>
      </div>
    </div>
  </div>
  <a class="item__link" href="/experience#skbp">
    <div class="item__frame">
      <div class="item__dimd" style="background-color: rgb(52, 94, 220); animation: 360ms cubic-bezier(0.215, 0.61, 0.355, 1) 50ms 1 normal both running slideOutRight;"></div>
      <div class="item__visual">
        <div class="image-box">
          <img data-src="/source/iframe/thumbnail/img_thumb_135.jpg" src="/source/iframe/thumbnail/img_thumb_135.jpg" alt="skbp eXperience - Plus X" draggable="false">
        </div>
        <div class="video-box">
          <video playsinline="" width="200" height="323">
            <source src="https://player.vimeo.com/progressive_redirect/playback/940644917/rendition/720p/file.mp4?loc=external&amp;signature=f32cd60cf25a81c016f1c67ebb1747dd9d24ec37efdf63dc19f1bab46bfc6eae">
          </video>
        </div>
      </div>
    </div>
  </a>
</div>`;

const SCRIPT_JSON_ESCAPES: Record<string, string> = {
  "&": "\\u0026",
  "<": "\\u003C",
  ">": "\\u003E",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

function toScriptJson(value: string): string {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => SCRIPT_JSON_ESCAPES[character] ?? character);
}

function createSkbpFeaturedCardScript(): string {
  return `<script id="a11yway-featured-skbp-card">
(() => {
  const featuredCardHtml = ${toScriptJson(SKBP_FEATURED_CARD_HTML)};
  let frameId = 0;

  const syncFeaturedCardState = (card) => {
    const selectedCategory = document.querySelector(".experience__category__name.selected")?.textContent?.trim();
    const shouldShow = selectedCategory !== "BX";
    card.classList.toggle("active", shouldShow);
    card.classList.toggle("visible", shouldShow);
  };

  const bindFeaturedCardLink = (card) => {
    const link = card.querySelector("a.item__link");
    if (!(link instanceof HTMLAnchorElement) || card.dataset.a11ywayLocalLink === "true") {
      return;
    }
    card.dataset.a11ywayLocalLink = "true";
    link.dataset.a11ywayLocalLink = "true";
    card.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.parent.history.pushState(null, "", "/a11yway/skbp");
      window.parent.postMessage({
        type: "a11yway:experience-route",
        pathname: "/experience",
        hash: "#skbp",
        navigationType: "push",
      }, window.location.origin);
      window.location.assign(window.location.origin + "/experience#skbp");
    }, true);
  };

  const syncFeaturedCard = () => {
    frameId = 0;
    const list = document.querySelector(".experience__list");
    const heading = document.querySelector(".header__center__header-name");
    if (heading !== null && heading.textContent !== "143 eXperience") {
      heading.textContent = "143 eXperience";
    }
    if (list === null) {
      scheduleSync();
      return;
    }

    const template = document.createElement("template");
    template.innerHTML = featuredCardHtml.trim();
    const nextCard = template.content.firstElementChild;
    if (!(nextCard instanceof HTMLElement)) {
      return;
    }

    const currentCard = list.querySelector("[data-a11yway-featured-card='skbp']");
    const card = currentCard instanceof HTMLElement ? currentCard : nextCard;
    syncFeaturedCardState(card);
    bindFeaturedCardLink(card);
    if (list.firstElementChild !== card) {
      list.insertBefore(card, list.firstElementChild);
    }
  };

  function scheduleSync() {
    if (frameId !== 0) {
      return;
    }
    frameId = window.requestAnimationFrame(syncFeaturedCard);
  }

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
  scheduleSync();
})();
</script>`;
}

function createExperienceHistoryScript(): string {
  return `<script id="a11yway-experience-history-guard">
(() => {
  const remoteOrigin = ${toScriptJson(PLUS_EX_ORIGIN)};
  const remoteSkbpPortfolioSrc = remoteOrigin + "/source/iframe/portfolio/skbp.html";
  const localSkbpPortfolioSrc = window.location.origin + "/source/iframe/portfolio/skbp.html";
  const notifyTopRoute = (navigationType, routeHash = window.location.hash) => {
    if (window.parent === window) {
      return;
    }

    const normalizedRouteHash = routeHash === "" || routeHash.startsWith("#") ? routeHash : "#" + routeHash;
    const routePart = normalizedRouteHash.startsWith("#") ? normalizedRouteHash.slice(1) : normalizedRouteHash;
    const routeSlug = (() => {
      try {
        return decodeURIComponent(routePart);
      } catch {
        return routePart;
      }
    })();
    const topRoute = routeSlug === "" ? "/a11yway#skbp" : "/a11yway/" + encodeURIComponent(routeSlug);
    const currentTopRoute = window.parent.location.pathname + window.parent.location.hash;
    if (currentTopRoute !== topRoute) {
      if (navigationType === "replace") {
        window.parent.history.replaceState(null, "", topRoute);
      } else {
        window.parent.history.pushState(null, "", topRoute);
      }
    }

    window.parent.postMessage({
      type: "a11yway:experience-route",
      pathname: window.location.pathname,
      hash: normalizedRouteHash,
      navigationType,
    }, window.location.origin);
  };
  const scheduleTopRouteNotification = (navigationType) => {
    window.requestAnimationFrame(() => notifyTopRoute(navigationType));
  };
  const bindExperienceLinks = () => {
    for (const link of document.querySelectorAll("a.item__link[href*='/experience#']")) {
      if (!(link instanceof HTMLAnchorElement) || link.dataset.a11ywayRouteBound === "true") {
        continue;
      }

      const routeHash = new URL(link.href).hash;
      if (routeHash === "") {
        continue;
      }

      link.dataset.a11ywayRouteBound = "true";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        notifyTopRoute("push", routeHash);
        window.location.assign(window.location.origin + "/experience" + routeHash);
      }, true);
    }
  };
  const bindExperienceReturnButtons = () => {
    for (const button of document.querySelectorAll("button.button__arrow.bottom")) {
      if (!(button instanceof HTMLButtonElement) || button.dataset.a11ywayReturnBound === "true") {
        continue;
      }

      button.dataset.a11ywayReturnBound = "true";
      button.addEventListener("click", (event) => {
        if (window.location.hash === "") {
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        notifyTopRoute("push", "");
        window.location.assign(window.location.origin + "/experience");
      }, true);
    }
  };
  const mapRemoteUrl = (url) => {
    if (typeof url === "string" && url.startsWith(remoteOrigin)) {
      return url.slice(remoteOrigin.length) || "/";
    }
    if (url instanceof URL && url.origin === remoteOrigin) {
      return url.pathname + url.search + url.hash;
    }
    return url;
  };
  for (const methodName of ["pushState", "replaceState"]) {
    const original = history[methodName].bind(history);
    history[methodName] = (state, title, url) => {
      const result = original(state, title, url === undefined ? undefined : mapRemoteUrl(url));
      scheduleTopRouteNotification(methodName === "pushState" ? "push" : "replace");
      return result;
    };
  }
  window.addEventListener("hashchange", () => scheduleTopRouteNotification("push"));
  window.addEventListener("popstate", () => scheduleTopRouteNotification("replace"));

  const localizeSkbpPortfolioFrames = () => {
    for (const frame of document.querySelectorAll("iframe")) {
      const declaredSrc = frame.getAttribute("src") ?? "";
      const isSkbpPortfolioFrame =
        declaredSrc === "/source/iframe/portfolio/skbp.html" ||
        declaredSrc === remoteSkbpPortfolioSrc ||
        frame.src === remoteSkbpPortfolioSrc;
      if (isSkbpPortfolioFrame && frame.src !== localSkbpPortfolioSrc) {
        frame.src = localSkbpPortfolioSrc;
      }
    }
  };
  const syncExperienceDocument = () => {
    bindExperienceLinks();
    bindExperienceReturnButtons();
    localizeSkbpPortfolioFrames();
  };

  const frameObserver = new MutationObserver(syncExperienceDocument);
  frameObserver.observe(document.documentElement, {
    attributeFilter: ["src"],
    attributes: true,
    childList: true,
    subtree: true,
  });
  syncExperienceDocument();
  scheduleTopRouteNotification("replace");
  window.setTimeout(() => notifyTopRoute("replace"), 250);
})();
</script>`;
}

export function absolutizeExperienceListHtml(html: string, sourceUrl: string): string {
  const baseHref = new URL(".", sourceUrl).toString();
  const historyScript = createExperienceHistoryScript();
  const featuredCardScript = createSkbpFeaturedCardScript();

  return html
    .replace(/<head([^>]*)>/i, `<head$1><base href="${baseHref}" />${historyScript}`)
    .replace(/<\/body>/i, `${featuredCardScript}</body>`)
    .replaceAll('src="/', `src="${PLUS_EX_ORIGIN}/`)
    .replaceAll('href="/', `href="${PLUS_EX_ORIGIN}/`)
    .replaceAll("url('/", `url('${PLUS_EX_ORIGIN}/`)
    .replaceAll('url("/', `url("${PLUS_EX_ORIGIN}/`);
}
