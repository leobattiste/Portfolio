import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { readFile } from "node:fs/promises";

// Exercise the actual React components in a DOM, without replacing the browser QA requirement.
test("Toolbox search, favorites persistence, views, command palette, and theme work together", async () => {
  const dom = new JSDOM(
    await readFile(new URL("../dist/toolbox/index.html", import.meta.url), "utf8"),
    { url: "https://portfolio.test/toolbox/", pretendToBeVisual: true },
  );
  const win = dom.window;
  for (const key of Object.getOwnPropertyNames(win))
    if (/^(HTML|SVG|CSS)/.test(key) && !(key in globalThis))
      Object.defineProperty(globalThis, key, {
        value: win[key],
        configurable: true,
        writable: true,
      });
  for (const key of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "HTMLInputElement",
    "HTMLButtonElement",
    "Element",
    "Node",
    "NodeFilter",
    "Event",
    "MouseEvent",
    "KeyboardEvent",
    "CustomEvent",
    "MutationObserver",
    "DocumentFragment",
    "HTMLSelectElement",
    "HTMLTextAreaElement",
    "SVGElement",
  ])
    Object.defineProperty(globalThis, key, {
      value:
        key === "window" ? win : key === "document" ? win.document : win[key],
      configurable: true,
      writable: true,
    });
  globalThis.localStorage = win.localStorage;
  globalThis.location = win.location;
  globalThis.history = win.history;
  globalThis.getComputedStyle = win.getComputedStyle.bind(win);
  globalThis.requestAnimationFrame = win.requestAnimationFrame.bind(win);
  globalThis.cancelAnimationFrame = win.cancelAnimationFrame.bind(win);
  win.matchMedia = () => ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  win.HTMLElement.prototype.scrollIntoView = function () {};
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const React = await import("react"),
    { hydrateRoot } = await import("react-dom/client"),
    { App } = await import("../.build/server/entry-server.mjs");
  let root;
  const hydrationErrors = [];
  const render = async (path) =>
    React.act(async () => {
      if (!root) root = hydrateRoot(document.getElementById("root"), React.createElement(App, { path }), { onRecoverableError: error => hydrationErrors.push(error) });
      else root.render(React.createElement(App, { path }));
      await new Promise((r) => setTimeout(r, 30));
    });
  const click = async (element) => {
    assert.ok(element, "expected interactive element");
    await React.act(async () => {
      element.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
    });
  };
  try {
    await render("/toolbox/");
    assert.equal(document.querySelectorAll(".resource-card").length, 18);
    assert.deepEqual(hydrationErrors, [], "static HTML hydrates without mismatches");
    const save = document.querySelector(".resource-card button[aria-pressed]");
    await click(save);
    assert.equal(save.getAttribute("aria-pressed"), "true");
    const stored = JSON.parse(localStorage.getItem("leo-toolbox-favorites-v1"));
    assert.equal(stored.length, 1);
    await click(document.querySelector('[aria-label="List view"]'));
    assert.ok(document.querySelector(".resource-grid.list-view"));
    const category = [
      ...document.querySelectorAll(".category-pills button"),
    ].find((b) => b.textContent.startsWith("Typography"));
    await click(category);
    assert.equal(category.getAttribute("aria-pressed"), "true");
    assert.ok(location.search.includes("Typography"));
    assert.ok(
      [...document.querySelectorAll(".resource-foot>a:first-child")].every(
        (a) => a.textContent === "Typography",
      ),
    );
    const input = document.getElementById("resource-search");
    await React.act(async () => {
      Object.getOwnPropertyDescriptor(
        win.HTMLInputElement.prototype,
        "value",
      ).set.call(input, "no-match-xyz-8675309");
      input.dispatchEvent(new win.Event("input", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 30));
    });
    assert.ok(
      document.querySelector(".empty-state"),
      "search renders an empty result state",
    );
    await click(
      [...document.querySelectorAll("button")].find((b) =>
        b.textContent.includes("Reset filters"),
      ),
    );
    assert.equal(document.querySelectorAll(".resource-card").length, 18);
    await click(document.querySelector('[aria-label="Switch color theme"]'));
    assert.ok(document.documentElement.classList.contains("dark"));
    await React.act(async () => {
      document.dispatchEvent(
        new win.KeyboardEvent("keydown", {
          key: "k",
          ctrlKey: true,
          bubbles: true,
        }),
      );
      await new Promise((r) => setTimeout(r, 30));
    });
    assert.ok(
      document.querySelector('[role="dialog"]'),
      "Ctrl+K opens the shadcn command dialog",
    );
    assert.ok(document.querySelector("[cmdk-input]"));
    await React.act(async () => {
      document
        .querySelector("[cmdk-input]")
        .dispatchEvent(
          new win.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      await new Promise((r) => setTimeout(r, 30));
    });
    assert.equal(document.querySelector('[role="dialog"]'), null);
  } finally {
    await React.act(async () => root.unmount());
    win.close();
  }
});
