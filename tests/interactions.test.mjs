import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { readFile } from "node:fs/promises";

// Exercise the actual React components in a DOM, without replacing the browser QA requirement.
test("Home, menu, theme and the Aspect ratio experiment work together", async () => {
  const dom = new JSDOM(
    await readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
    { url: "https://portfolio.test/", pretendToBeVisual: true },
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
    await render("/");
    assert.equal(document.querySelectorAll(".home-screen").length, 4, "an intro and three full screens");
    assert.ok(!document.querySelector('a[href="/toolbox/"]'), "no Toolbox");
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

    await click(document.querySelector(".theme-toggle"));
    assert.equal(document.documentElement.dataset.theme, "dark");
    assert.equal(localStorage.getItem("leo-appearance"), "dark");
    const buttonNamed = (name) => [...document.querySelectorAll("button")].find(b => b.textContent.trim() === name);
    await render("/playground/aspect-ratio/");
    const frame = () => document.querySelector(".ratio-frame");
    await click(buttonNamed("Standard"));
    assert.equal(document.querySelector("[data-ratio]").textContent, "1.33 : 1");
    assert.equal(frame().style.getPropertyValue("--letter"), "0%", "4:3 uses side bars, not top and bottom");
    assert.ok(parseFloat(frame().style.getPropertyValue("--pillar")) > 12);
    await key(frame(), { key: "End" });
    assert.equal(document.querySelector("[data-ratio]").textContent, "2.76 : 1");
    assert.equal(document.querySelector(".ratio-readout span").textContent, "Ultra Panavision");
  } finally {
    await React.act(async () => root.unmount());
    win.close();
  }
});
