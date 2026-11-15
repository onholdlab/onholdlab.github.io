import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('all privacy locales disclose both stores without claiming a uniform migration cutoff', () => {
  const html = readFileSync(new URL('../privacy/index.html',import.meta.url),'utf8');
  const messages = ['zh-Hant','en'].map(lang=>JSON.parse(readFileSync(new URL(`../i18n/${lang}.json`,import.meta.url),'utf8'))['privacy.feedback.purpose']);
  for(const lang of ['ja','ko','es','de','fr']) {
    const article=html.match(new RegExp(`<article id="${lang}"[\\s\\S]*?<\\/article>`))[0];
    messages.push(article.match(/<li>[^<]*Supabase[^<]*<\/li>/)[0]);
  }
  for(const message of messages) {
    assert.match(message,/Cloudflare/);
    assert.match(message,/Supabase/);
    assert.doesNotMatch(message,/2026/, 'different deployed versions switched at different times');
  }
});
