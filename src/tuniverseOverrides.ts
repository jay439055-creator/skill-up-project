const PLUS_EX_ORIGIN = "https://www.plus-ex.com";
const TUNIVERSE_OVERVIEW_BADGE = "Overview";
const TUNIVERSE_OVERVIEW_TITLE = "Spatial design,<br /> explored through immersive<br /> VR user experience.";
const TUNIVERSE_OVERVIEW_DESCRIPTION = [
  "VR 기반 사용자 테스트를 통해 기존 설계 단계에서는 쉽게 드러나지 않았던 접근성 문제와 실제 이동 과정에서의 불편 요소를 발견합니다.",
  "이를 바탕으로 사용자의 동선, 이동 방식, 신체적 조건 등 다양한 경험적 데이터를 공간 설계에 반영하고,",
  "보다 포용적이고 현실적인 공간 설계 프로세스를 제안합니다.",
] as const;

const TUNIVERSE_LOCAL_STYLE = `
<style id="a11yway-local-crop">
.con1,.con2{display:none!important;}
.con3 .badge{text-transform:none!important;}
.con3 .txt-title{max-width:min(760px,calc(100vw - 48px))!important;text-wrap:balance!important;word-break:keep-all!important;}
.con3 .sub{line-height:1.7!important;max-width:1120px!important;word-break:keep-all!important;}
.con3 .sub span{display:block!important;}
.con3 .graph-wrap,.t-universe > .con3 ~ *{display:none!important;}
@media (max-width:900px){
  .con3 .txt-title{max-width:calc(100vw - 192px)!important;}
  .con3 .sub{max-width:calc(100vw - 192px)!important;}
}
@media (max-width:520px){
  .con3{box-sizing:border-box!important;padding-left:24px!important;padding-right:24px!important;}
  .con3 .txt-title{font-size:28px!important;line-height:1.18!important;max-width:calc(100vw - 48px)!important;}
  .con3 .sub{font-size:12px!important;max-width:calc(100vw - 48px)!important;}
}
</style>`;

function createTuniverseOverviewScript(): string {
  return `<script id="a11yway-overview-content">
(() => {
  const overview = document.querySelector(".con3");
  if (overview === null) {
    return;
  }

  const badge = overview.querySelector(".badge");
  const title = overview.querySelector(".txt-title");
  const description = overview.querySelector(".sub");
  const graph = overview.querySelector(".graph-wrap");

  if (badge !== null) {
    badge.textContent = ${JSON.stringify(TUNIVERSE_OVERVIEW_BADGE)};
  }
  if (title !== null) {
    title.innerHTML = ${JSON.stringify(TUNIVERSE_OVERVIEW_TITLE)};
  }
  if (description !== null) {
    description.innerHTML = ${JSON.stringify(TUNIVERSE_OVERVIEW_DESCRIPTION.map((line) => `<span>${line}</span>`).join(""))};
  }
  if (graph !== null) {
    graph.innerHTML = "";
    graph.setAttribute("aria-hidden", "true");
  }
})();
</script>`;
}

export function absolutizeTuniverseHtml(html: string, sourceUrl: string): string {
  const baseHref = new URL(".", sourceUrl).toString();
  const overviewContentScript = createTuniverseOverviewScript();

  return html
    .replace(/<head([^>]*)>/i, `<head$1><base href="${baseHref}" />${TUNIVERSE_LOCAL_STYLE}`)
    .replace(/<\/body>/i, `${overviewContentScript}</body>`)
    .replaceAll('src="/', `src="${PLUS_EX_ORIGIN}/`)
    .replaceAll('href="/', `href="${PLUS_EX_ORIGIN}/`)
    .replaceAll("url('/", `url('${PLUS_EX_ORIGIN}/`)
    .replaceAll('url("/', `url("${PLUS_EX_ORIGIN}/`);
}
