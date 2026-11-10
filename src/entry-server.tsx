import { renderToString } from "react-dom/server";
import { App } from "./App";
import { getPage } from "./lib/site";
export function render(path: string) {
  return { html: renderToString(<App path={path} />), meta: getPage(path) };
}

export { App };
