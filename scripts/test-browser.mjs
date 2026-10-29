import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const root = path.resolve('dist');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.woff':'font/woff', '.txt':'text/plain' };
let server;
if (!process.env.BASE_URL) {
  server = http.createServer(async (req,res) => {
    try {
      const requested = path.resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname));
      if (!requested.startsWith(root + path.sep) && requested !== root) {res.writeHead(403).end();return;}
      let file=requested;
      if (!(await stat(file).catch(()=>null))?.isFile()) file=path.join(root,'index.html');
      res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream'});
      res.end(await readFile(file));
    } catch {res.writeHead(500).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
}
const base = process.env.BASE_URL || `http://127.0.0.1:${server.address().port}`;
const chrome = process.env.CHROME_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/google-chrome','/usr/bin/chromium'].find(existsSync);
if (!chrome) throw new Error('Set CHROME_PATH to an installed Chrome or Chromium executable.');
const browser=await puppeteer.launch({executablePath:chrome,headless:true});
const page=await browser.newPage();
const errors=[]; const apiRequests=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))apiRequests.push(r.url());});
async function clickText(text,selector='button') {
  const found=await page.evaluate((text,selector)=>{const el=[...document.querySelectorAll(selector)].find(e=>e.textContent.trim()===text && e.getBoundingClientRect().height>0); if(!el)return false;el.click();return true;},text,selector);
  assert.ok(found,`Visible control: ${text}`);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function bodyIncludes(text) {await page.waitForFunction(text=>document.body.innerText.includes(text),{},text);}
try {
  await page.setViewport({width:1440,height:900});
  await page.goto(base,{waitUntil:'networkidle0'});
  await page.evaluate(()=>document.fonts.ready);
  assert.match(await page.title(),/Yanagaman/);
  assert.equal(await page.$eval('meta[name="robots"]',el=>el.content),'noindex, nofollow');
  assert.equal(await page.$eval('.hero-image img',el=>el.complete && el.naturalWidth>0),true);
  assert.equal((await page.$$('.ride-card')).length,3);
  await page.evaluate(()=>{const el=document.querySelector('.search-form input[type="date"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'2099-01-02');el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.click('.search-button'); await bodyIncludes('No sample rides match');
  await clickText('Colombo to Galle','.route-shortcut');
  assert.equal(await page.$eval('.search-form select',el=>el.value),'Colombo');
  assert.equal((await page.$$('.ride-card')).length,1);
  await clickText('View ride'); await page.select('.booking-controls select','2'); await clickText('Try demo booking');
  await bodyIncludes('No real seat was reserved'); await bodyIncludes('2 seats / LKR 1,700');
  await page.reload({waitUntil:'networkidle0'}); await bodyIncludes('2 seats / LKR 1,700');
  await clickText('Cancel demo booking'); await bodyIncludes('Your next journey starts here.');
  await clickText('Offer a ride'); await bodyIncludes('Room for one more?'); await clickText('Add demo ride');
  await bodyIncludes('Demo offer added.'); await page.reload({waitUntil:'networkidle0'}); await bodyIncludes('3 sample seats');
  await clickText('Reset demo'); await clickText('Reset now'); await bodyIncludes('Fresh sample rides are ready.');
  assert.equal((await page.$$('.ride-card')).length,3);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement!==document.body),true);
  await mkdir('.hallmark/verified',{recursive:true});
  for(const width of [320,375,768,1280,1440,1920]) {
    await page.setViewport({width,height:width<600?844:900});
    await page.evaluate(()=>window.scrollTo(0,0));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No overflow at ${width}`);
    assert.equal(await page.evaluate(()=>[...document.images].every(i=>i.complete && i.naturalWidth>0)),true);
    await page.screenshot({path:`.hallmark/verified/preview-${width}.png`,fullPage:width===375||width===1440});
  }
  await page.setViewport({width:375,height:844}); await page.evaluate(()=>window.scrollTo(0,0));
  await clickText('Menu'); assert.equal(await page.$eval('.menu-toggle',e=>e.getAttribute('aria-expanded')),'true');
  await clickText('My trips'); await bodyIncludes('Your next journey starts here.');
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  assert.equal(await page.$eval('.primary',e=>getComputedStyle(e).transitionDuration),'0s');
  await page.screenshot({path:'.hallmark/verified/trips-mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'No browser runtime errors'); assert.deepEqual(apiRequests,[],'No old API requests');
  console.log('PASS: search, date filtering, shortcuts, booking, refresh, cancellation, offer, reset, mobile navigation, image loading, overflow, reduced motion, and no API requests.');
} finally {await browser.close(); if(server)await new Promise(resolve=>server.close(resolve));}
