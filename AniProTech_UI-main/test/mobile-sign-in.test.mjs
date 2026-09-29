import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../public/mobile-sign-in.js", import.meta.url), "utf8");

function load(hash) {
  const elements = Object.fromEntries(["status", "open-app", "copy-link"].map((id) => [id, {
    hidden: true,
    textContent: "",
    addEventListener(event, handler) { this[event] = handler; },
  }]));
  const copied = [];
  const history = [];
  vm.runInNewContext(source, {
    URLSearchParams,
    encodeURIComponent,
    document: { getElementById: (id) => elements[id] },
    navigator: { clipboard: { writeText: async (value) => { copied.push(value); } } },
    window: {
      location: { hash, pathname: "/mobile-sign-in.html" },
      history: { replaceState: (...args) => history.push(args) },
    },
  });
  return { elements, copied, history };
}

test("a valid emailed fragment becomes a user-clicked native app link", async () => {
  const token = "A".repeat(80);
  const { elements, copied, history } = load(`#token=${token}`);
  assert.equal(elements["open-app"].href, `aniprotech://login?token=${token}`);
  assert.equal(elements["open-app"].hidden, false);
  assert.equal(elements["copy-link"].hidden, false);
  assert.equal(history[0][2], "/mobile-sign-in.html");
  await elements["copy-link"].click();
  assert.equal(copied[0], elements["open-app"].href);
});

test("missing or malformed fragments never expose an app-open button", () => {
  for (const hash of ["", "#token=bad", "#token=https://example.test"]) {
    const { elements } = load(hash);
    assert.equal(elements["open-app"].hidden, true);
    assert.match(elements.status.textContent, /incomplete/i);
  }
});
