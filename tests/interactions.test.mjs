import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { readFile } from "node:fs/promises";

// Exercise the actual React components in a DOM, without replacing the browser QA requirement.
test("Toolbox filter, saving, keyboard navigation, and theme work together", async () => {
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
  win.matchMedia = (query) => ({
    matches: query.includes("max-width: 47.99rem"),
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
  // The test runs on the content the site was built with, not the live database.
  globalThis.fetch = () => Promise.reject(new Error("offline"));
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
  const key = async (target, init) =>
    React.act(async () => {
      target.dispatchEvent(new win.KeyboardEvent("keydown", { bubbles: true, ...init }));
      await new Promise((r) => setTimeout(r, 20));
    });
  const type = async (input, value) =>
    React.act(async () => {
      Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value").set.call(input, value);
      input.dispatchEvent(new win.Event("input", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 30));
    });
  try {
    await render("/toolbox/");
    const total = document.querySelectorAll("[data-entry]").length;
    assert.ok(total > 0, "the curated links are listed");
    assert.deepEqual(hydrationErrors, [], "static HTML hydrates without mismatches");

    // The mobile menu overlays the page, locks scrolling, and closes with Escape.
    const menu = document.querySelector(".menu-button");
    await click(menu);
    assert.equal(menu.getAttribute("aria-expanded"), "true");
    assert.ok(document.querySelector(".site-nav").hasAttribute("data-open"));
    assert.equal(document.body.style.overflow, "hidden");
    assert.ok(document.getElementById("main").hasAttribute("inert"));
    await key(document, { key: "Escape" });
    assert.equal(menu.getAttribute("aria-expanded"), "false");
    assert.equal(document.body.style.overflow, "");
    assert.ok(!document.getElementById("main").hasAttribute("inert"));

    const save = document.querySelector(".entry .save");
    await click(save);
    assert.equal(save.getAttribute("aria-pressed"), "true");
    assert.equal(JSON.parse(localStorage.getItem("leo-toolbox-favorites-v1")).length, 1);

    const category = [...document.querySelectorAll(".cats button")].find((b) =>
      b.textContent.startsWith("Typography"),
    );
    await click(category);
    assert.equal(category.getAttribute("aria-pressed"), "true");
    assert.ok(location.search.includes("Typography"));
    const groups = [...document.querySelectorAll(".group .label")];
    assert.equal(groups.length, 1);
    assert.ok(groups[0].textContent.startsWith("Typography"));

    const input = document.getElementById("filter");
    await type(input, "no-match-xyz-8675309");
    assert.ok(document.querySelector(".empty"), "an empty result explains itself");
    await click([...document.querySelectorAll("button")].find((b) => b.textContent === "Clear filters"));
    assert.equal(document.querySelectorAll("[data-entry]").length, total);

    await key(document.body, { key: "/" });
    assert.equal(document.activeElement, input, "/ focuses the filter");
    await key(input, { key: "ArrowDown" });
    const first = document.querySelector("[data-entry]");
    assert.equal(document.activeElement, first, "arrow keys move into the list");
    await key(first, { key: "j" });
    assert.equal(document.activeElement, document.querySelectorAll("[data-entry]")[1]);
    await key(document.activeElement, { key: "s" });
    assert.equal(JSON.parse(localStorage.getItem("leo-toolbox-favorites-v1")).length, 2, "S saves the highlighted link");

    await click(document.querySelector(".theme-toggle"));
    assert.equal(document.documentElement.dataset.theme, "dark");
    assert.equal(localStorage.getItem("leo-appearance"), "dark");
  } finally {
    await React.act(async () => root.unmount());
    win.close();
  }
});
