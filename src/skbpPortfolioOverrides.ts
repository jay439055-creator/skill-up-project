const PLUS_EX_ORIGIN = "https://www.plus-ex.com";

function createSkbpCloseScript(): string {
  return `<script id="a11yway-skbp-close-guard">
(() => {
  const listUrl = window.parent.location.origin + "/experience";
  const returnToList = (event) => {
    if (event !== undefined) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    window.parent.parent.history.pushState(null, "", "/a11yway#skbp");
    window.parent.parent.postMessage({
      type: "a11yway:experience-route",
      pathname: "/experience",
      hash: "",
      navigationType: "push",
    }, window.parent.location.origin);
    window.parent.location.href = listUrl;
  };

  const bindCloseButton = () => {
    const closeButton = document.querySelector(".exper_close");
    if (closeButton !== null) {
      closeButton.addEventListener("click", returnToList, true);
    }
  };

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest(".exper_close") !== null) {
      returnToList(event);
    }
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindCloseButton, { once: true });
  } else {
    bindCloseButton();
  }
})();
</script>`;
}

export function absolutizeSkbpPortfolioHtml(html: string, sourceUrl: string): string {
  const baseHref = new URL(".", sourceUrl).toString();
  const closeScript = createSkbpCloseScript();

  return html
    .replace(/<head([^>]*)>/i, `<head$1><base href="${baseHref}" />`)
    .replace(/<\/body>/i, `${closeScript}</body>`)
    .replaceAll('src="/', `src="${PLUS_EX_ORIGIN}/`)
    .replaceAll('href="/', `href="${PLUS_EX_ORIGIN}/`)
    .replaceAll("url('/", `url('${PLUS_EX_ORIGIN}/`)
    .replaceAll('url("/', `url("${PLUS_EX_ORIGIN}/`);
}
