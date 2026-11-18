// accessibility checks for the shop: what we measured by hand in chapters 6–15, run on every push
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
const AXE = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const URL_ = 'http://localhost:4000/';
let server, browser;
before(async () => {
  server = spawn('node', ['server/server.js'], { stdio: 'ignore' });
  for (let i = 0; i < 50 && !(await fetch(URL_).then(() => true, () => false)); i++) await new Promise((r) => setTimeout(r, 100));
  browser = await chromium.launch();
});
after(async () => { await browser.close(); server.kill(); });
async function open(viewport = { width: 1280, height: 720 }) {
  const p = await browser.newPage({ viewport });
  await p.goto(URL_); await p.waitForSelector('#review-list li');
  return p;
}
async function axe(p) {
  await p.addScriptTag({ content: AXE });
  return p.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })
    .then((r) => r.violations.map((v) => v.id + ' ' + v.nodes[0].target.join(' '))));
}
const small = (p) => p.evaluate(() => [...document.querySelectorAll('button, input, select')]          // the shop's own rule: 44px, like its other buttons
  .filter((e) => e.getClientRects().length && e.getBoundingClientRect().height < 44)
  .map((e) => (e.textContent.trim() || e.type) + ' ' + Math.round(e.getBoundingClientRect().height) + 'px'));

test('axe: no violations, as loaded and with the mini cart open', async () => {
  const p = await open();
  assert.deepEqual(await axe(p), []);
  await p.click('.add'); await p.waitForTimeout(300); await p.click('.cart');
  assert.deepEqual(await axe(p), []);
  await p.close();
});
test('every button and field is at least 44px tall, mini cart included', async () => {
  const p = await open({ width: 390, height: 844 });
  await p.click('.add'); await p.waitForTimeout(300); await p.click('.cart');
  assert.deepEqual(await small(p), []);
  await p.close();
});
test('no Latin text is read with the Arabic voice', async () => {
  const p = await open();
  const wrong = await p.evaluate(() => {
    const out = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) { const t = n.textContent.trim(); if (/[A-Za-z]{2}/.test(t) && !/[؀-ۿ]/.test(t) && n.parentElement.closest('[lang]').lang === 'ar' && !n.parentElement.closest('script')) out.push(t); }
    return out;
  });
  assert.deepEqual(wrong, []);
  await p.close();
});
test('"more reviews" keeps the focus', async () => {
  const p = await open();
  await p.focus('#more-reviews'); await p.keyboard.press('Enter'); await p.waitForFunction(() => document.querySelectorAll('#review-list li').length >= 10);
  assert.equal(await p.evaluate(() => document.activeElement.id), 'more-reviews');
  await p.close();
});
test('at 400% zoom the header covers no focused element', async () => {
  const p = await open({ width: 320, height: 180 });
  for (let i = 0; i < 16; i++) {
    await p.keyboard.press('Tab');
    const covered = await p.evaluate(() => { const e = document.activeElement, top = document.querySelector('.top'); if (top.contains(e) || e === document.body) return false;
      const a = e.getBoundingClientRect(), hit = document.elementFromPoint(a.left + a.width / 2, a.top + a.height / 2); return !!hit && top.contains(hit); });
    assert.equal(covered, false, 'Tab ' + (i + 1));
  }
  await p.close();
});
