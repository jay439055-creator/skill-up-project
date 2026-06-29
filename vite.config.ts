import ky from "ky";
import react from "@vitejs/plugin-react";
import { defineConfig, type PreviewServer, type ViteDevServer } from "vite";
import { absolutizeExperienceListHtml } from "./src/experienceListOverrides";
import { absolutizeSkbpPortfolioHtml } from "./src/skbpPortfolioOverrides";

const SKBP_REMOTE_EXPERIENCE_URL = "https://www.plus-ex.com/experience";
const SKBP_REMOTE_REFERENCE_URL = "https://www.plus-ex.com/experience";
const SKBP_REMOTE_PORTFOLIO_URL = "https://www.plus-ex.com/source/iframe/portfolio/skbp.html";

type ExperienceProxyResponse = {
  end: (body: string) => void;
  setHeader: (name: string, value: string) => void;
  statusCode: number;
};

function getRequestUrl(request: unknown): string | undefined {
  if (typeof request !== "object" || request === null || !("url" in request)) {
    return undefined;
  }

  return typeof request.url === "string" ? request.url : undefined;
}

function isExperienceProxyResponse(response: unknown): response is ExperienceProxyResponse {
  if (typeof response !== "object" || response === null) {
    return false;
  }

  return "end" in response && "setHeader" in response && "statusCode" in response;
}

function shouldServeExperienceReference(url: string | undefined): boolean {
  return url === "/experience" || url?.startsWith("/experience?") === true;
}

function shouldServeSkbpPortfolioReference(url: string | undefined): boolean {
  return url === "/source/iframe/portfolio/skbp.html" || url?.startsWith("/source/iframe/portfolio/skbp.html?") === true;
}

async function sendExperienceReferenceHtml(response: ExperienceProxyResponse): Promise<void> {
  const remoteHtml = await ky.get(SKBP_REMOTE_EXPERIENCE_URL, { timeout: 15_000 }).text();
  const localHtml = absolutizeExperienceListHtml(remoteHtml, SKBP_REMOTE_REFERENCE_URL);

  response.statusCode = 200;
  response.setHeader("Content-Type", "text/html; charset=UTF-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(localHtml);
}

async function sendSkbpPortfolioReferenceHtml(response: ExperienceProxyResponse): Promise<void> {
  const remoteHtml = await ky.get(SKBP_REMOTE_PORTFOLIO_URL, { timeout: 15_000 }).text();
  const localHtml = absolutizeSkbpPortfolioHtml(remoteHtml, SKBP_REMOTE_PORTFOLIO_URL);

  response.statusCode = 200;
  response.setHeader("Content-Type", "text/html; charset=UTF-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(localHtml);
}

function attachExperienceReferenceProxy(server: ViteDevServer | PreviewServer): void {
  server.middlewares.use((request, response, next) => {
    const requestUrl = getRequestUrl(request);

    if (!shouldServeExperienceReference(requestUrl) && !shouldServeSkbpPortfolioReference(requestUrl)) {
      next();
      return;
    }

    if (!isExperienceProxyResponse(response)) {
      next(new Error("Vite middleware response cannot send HTML."));
      return;
    }

    const htmlResponse = shouldServeSkbpPortfolioReference(requestUrl)
      ? sendSkbpPortfolioReferenceHtml(response)
      : sendExperienceReferenceHtml(response);

    void htmlResponse.catch((error: unknown) => {
      next(error instanceof Error ? error : new Error(String(error)));
    });
  });
}

export default defineConfig({
  plugins: [
    {
      name: "a11yway-skbp-experience-reference",
      configureServer: attachExperienceReferenceProxy,
      configurePreviewServer: attachExperienceReferenceProxy,
    },
    react(),
  ],
});
