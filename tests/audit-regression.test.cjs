const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const storageKey = 'pho-bang-hieu-state-v1';
let server, browser, baseURL;

before(async () => {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.ttf': 'font/ttf', '.png': 'image/png', '.svg': 'image/svg+xml' };
  server = http.createServer((req, res) => {
    const requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const filename = path.resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
    if (!filename.startsWith(root + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
      res.writeHead(404).end(); return;
    }
    res.setHeader('Content-Type', types[path.extname(filename)] || 'application/octet-stream');
    fs.createReadStream(filename).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseURL = `http://127.0.0.1:${server.address().port}`;
  const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ executablePath, headless: true });
});

after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function withPage(run, viewport = { width: 1440, height: 1000 }) {
  const context = await browser.newContext({ viewport, acceptDownloads: true });
  // Core workflows must work with the committed fonts, without external CDNs.
  await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(baseURL);
    await page.locator('.sign').first().waitFor();
    await page.evaluate(async () => {
      await Promise.all([window.SG85.init(), window.UTM.init()]);
      await document.fonts.ready;
    });
    await settle(page);
    await run(page);
    assert.deepEqual(errors, [], 'No application exceptions');
  } finally {
    await context.close();
  }
}

async function tool(page, action) {
  const button = page.locator(`[data-act="${action}"]`);
  if (!await button.isVisible()) await page.locator('[data-act="more"]').click();
  await button.click();
  await settle(page);
}

async function state(page) {
  await page.waitForTimeout(220);
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
}

function leaves(node) {
  return node.sign ? [node] : node.children.flatMap(leaves);
}

function signAt(data, id) {
  return leaves(data.tree).find(node => node.id === id).sign;
}

test('all tools remain reachable across phone, tablet, landscape, and desktop in both eras', { timeout: 60000 }, async () => {
  await withPage(async page => {
    for (const era of ['sg85', 'nay']) {
      if (era === 'nay') await tool(page, 'theme');
      for (const [width, height] of [[320,568], [390,844], [620,900], [621,900], [667,375], [768,1024], [844,390], [1024,900], [1280,900], [1440,1000]]) {
        await page.setViewportSize({ width, height });
        await settle(page);
        const geometry = await page.evaluate(() => ({
          width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          wallBottom: document.querySelector('#wall').getBoundingClientRect().bottom,
          dockTop: document.querySelector('#dock').getBoundingClientRect().top,
          buttons: [...document.querySelectorAll('.dock-actions button')].map(el => ({
            act: el.dataset.act, label: el.querySelector('span').textContent,
            ...el.getBoundingClientRect().toJSON()
          }))
        }));
        assert.ok(geometry.scrollWidth <= width, `${era}/${width}: no page overflow`);
        for (const action of ['shuffle', 'theme', 'add', 'relayout', 'undo', 'redo', 'adjust', 'export', 'more']) {
          assert.ok(geometry.buttons.some(button => button.act === action), `${action} is directly on the toolbar`);
        }
        assert.ok(geometry.wallBottom <= geometry.dockTop - 6, `${era}/${width}: dock does not cover signs`);
        for (const button of geometry.buttons) {
          assert.ok(button.width >= 44 && button.height >= 44, `${era}/${width}/${button.act}: comfortable target`);
          assert.ok(button.left >= 0 && button.right <= width && button.top >= 0 && button.bottom <= height, `${era}/${width}/${button.act}: visible`);
          assert.ok(button.label.trim(), 'Visible text labels');
        }
        await page.locator('[data-act="more"]').click();
        for (const button of await page.locator('#moreTools button:not(:disabled)').all()) {
          await button.scrollIntoViewIfNeeded();
          await button.click({ trial: true });
        }
        await page.locator('[data-act="about"]').click();
        const close = await page.locator('.about-close').boundingBox();
        assert.ok(close.width >= 44 && close.height >= 44);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#moreTools').isVisible(), false);
        await page.waitForFunction(() => document.activeElement === document.querySelector('[data-act="more"]'), null, { timeout: 1000 });
        assert.equal(await page.locator('[data-act="more"]').evaluate(el => el === document.activeElement), true, 'About returns focus to a visible control');
      }
    }
  });
});

test('each range adjustment undoes independently of the preceding text edit', { timeout: 60000 }, async t => {
  for (const [id, field] of [['adjTracking','tracking'], ['adjKerningFine','kerningFine'], ['adjWordSpacing','wordSpacing'], ['adjLineHeight','lineSpacing'], ['adjGap','gap']]) {
    await t.test(id, async () => withPage(async page => {
      const first = page.locator('.sign').first();
      const nodeId = await first.getAttribute('data-id');
      const original = signAt(await state(page), nodeId).text.name;
      await first.locator('.name').fill('Tiệm Vui Vẻ');
      await first.locator('.name').press('Enter');
      const edited = signAt(await state(page), nodeId).text.name;
      await page.locator('[data-act="adjust"]').click();
      const range = page.locator('#' + id);
      const before = Number(await range.inputValue());
      await range.focus();
      await range.press('ArrowRight');
      const changed = Number(await range.inputValue());
      assert.notEqual(changed, before);
      await range.press('Control+z');
      let sign = signAt(await state(page), nodeId);
      assert.equal(sign.adjust[field], before, 'First Undo restores the adjustment');
      assert.equal(sign.text.name, edited, 'First Undo keeps the text edit');
      // An unchanged input must not clear the Redo stack or add a no-op Undo.
      await range.dispatchEvent('input');
      await range.dispatchEvent('change');
      await range.press('Control+z');
      sign = signAt(await state(page), nodeId);
      assert.equal(sign.text.name, original, 'Second Undo restores only the preceding edit');
      await range.press('Control+Shift+z');
      sign = signAt(await state(page), nodeId);
      assert.equal(sign.text.name, edited);
      assert.equal(sign.adjust[field], before);
      await range.press('Control+Shift+z');
      assert.equal(signAt(await state(page), nodeId).adjust[field], changed);
    }));
  }
});

test('a continuous pointer adjustment is one Undo step', async () => {
  await withPage(async page => {
    const first = page.locator('.sign').first();
    const id = await first.getAttribute('data-id');
    await first.locator('.name').fill('Tiệm Giữ Lại');
    await first.locator('.name').press('Enter');
    const edited = signAt(await state(page), id).text.name;
    await page.locator('[data-act="adjust"]').click();
    const range = page.locator('#adjTracking');
    const box = await range.boundingBox();
    const x = box.x + 12 + (0 - (-30)) / (80 - (-30)) * (box.width - 24);
    await page.mouse.move(x, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(x + 70, box.y + box.height / 2, { steps: 12 });
    await page.mouse.up();
    assert.notEqual(Number(await range.inputValue()), 0);
    await range.press('Control+z');
    const sign = signAt(await state(page), id);
    assert.equal(sign.adjust.tracking, 0);
    assert.equal(sign.text.name, edited);
  });
});

test('relayout preserves every sign, font, adjustment, and count after a narrow resize', async () => {
  await withPage(async page => {
    const first = page.locator('.sign').first();
    await first.locator('.name').fill('Cửa Hàng Ánh Tuyết');
    await first.locator('.name').press('Enter');
    await tool(page, 'fonts');
    const picker = page.locator('#faceName');
    const alternative = await picker.locator('option').evaluateAll(options => options.find(option => !option.selected).value);
    await picker.selectOption(alternative);
    await page.locator('#tabAdjust').click();
    await page.locator('#adjTracking').press('ArrowRight');
    await page.keyboard.press('Escape');
    const before = await state(page);
    const contents = leaves(before.tree).map(node => JSON.stringify(node.sign)).sort();
    await page.setViewportSize({ width: 320, height: 568 });
    await tool(page, 'relayout');
    const after = await state(page);
    assert.deepEqual(leaves(after.tree).map(node => JSON.stringify(node.sign)).sort(), contents);
    await page.keyboard.press('Control+z');
    assert.deepEqual((await state(page)).tree, before.tree, 'Undo restores the original layout');
    await page.keyboard.press('Control+Shift+z');
    await page.reload();
    assert.deepEqual((await state(page)).tree, after.tree, 'Relayout survives reload');
  });
});

test('mobile inspector keeps a live sign preview and keyboard closure restores the wall', async () => {
  await withPage(async page => {
    const before = await state(page);
    const count = await page.locator('.sign').count();
    await page.locator('[data-act="adjust"]').click();
    await settle(page);
    const boxes = await page.evaluate(() => ({
      sign: document.querySelector('.is-selected').getBoundingClientRect().toJSON(),
      drawer: document.querySelector('#drawer').getBoundingClientRect().toJSON(),
      visibleSigns: [...document.querySelectorAll('.sign')].filter(el => el.getBoundingClientRect().height > 0).length
    }));
    assert.equal(boxes.visibleSigns, 1);
    assert.ok(boxes.sign.width >= 340 && boxes.sign.height >= 140, 'Readable focused preview');
    assert.ok(boxes.sign.bottom < boxes.drawer.top, 'Preview stays above the sheet');
    await page.locator('#tabFonts').click();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#tabAdjust').getAttribute('aria-selected'), 'true');
    await page.keyboard.press('Escape');
    await settle(page);
    assert.equal(await page.locator('#drawer').isVisible(), false);
    assert.equal(await page.locator('.sign:visible').count(), count);
    assert.deepEqual((await state(page)).tree, before.tree, 'Preview never changes the stored layout');
    assert.equal(await page.locator('[data-act="adjust"]').evaluate(el => el === document.activeElement), true);
  }, { width: 390, height: 844 });
});

async function downloadImage(page, format, scope) {
  await page.locator('[data-act="export"]').click();
  await page.locator(`#exportDialog input[value="${scope}"]`).check();
  const downloading = page.waitForEvent('download');
  await page.locator(`[data-format="${format}"]`).click();
  const download = await downloading;
  const buffer = await fs.promises.readFile(await download.path());
  assert.ok(buffer.length > 1000);
  return { buffer, filename: download.suggestedFilename() };
}

async function compareOutside(page, a, b, format, bounds) {
  const type = format === 'svg' ? 'image/svg+xml' : 'image/png';
  return page.evaluate(async ({ a, b, bounds }) => {
    async function pixels(url) {
      const img = new Image(); img.src = url; await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
      return { width: canvas.width, height: canvas.height, data: ctx.getImageData(0, 0, canvas.width, canvas.height).data };
    }
    const first = await pixels(a), second = await pixels(b);
    if (first.width !== second.width || first.height !== second.height) throw Error('Image dimensions changed');
    const sx = first.width / bounds.wallWidth, sy = first.height / bounds.wallHeight;
    let changedInside = 0, changedOutside = 0;
    for (let y = 0; y < first.height; y++) for (let x = 0; x < first.width; x++) {
      const i = (y * first.width + x) * 4;
      if (![0,1,2,3].some(c => first.data[i+c] !== second.data[i+c])) continue;
      if (x >= Math.floor(bounds.left*sx)-1 && x <= Math.ceil(bounds.right*sx)+1 &&
          y >= Math.floor(bounds.top*sy)-1 && y <= Math.ceil(bounds.bottom*sy)+1) changedInside++;
      else changedOutside++;
    }
    return { changedInside, changedOutside };
  }, { a: `data:${type};base64,${a.toString('base64')}`, b: `data:${type};base64,${b.toString('base64')}`, bounds });
}

test('PNG and SVG exports clip long adjusted text in both eras and offer explicit scope', { timeout: 60000 }, async () => {
  await withPage(async page => {
    for (const era of ['sg85', 'nay']) {
      if (era === 'nay') await tool(page, 'theme');
      const nodeId = await page.locator('.sign:has(.name.is-hero:not([hidden]))').first().getAttribute('data-id');
      const first = page.locator(`.sign[data-id="${nodeId}"]`);
      await first.locator('.name').fill('Cửa Hàng Nguyễn Thị Ánh Tuyết & <Sài Gòn> Ốc');
      await first.locator('.name').press('Enter');
      await page.locator('[data-act="adjust"]').click();
      await page.locator('#adjTarget').selectOption('name');
      await page.locator('#adjTracking').evaluate(el => {
        el.value = '20'; el.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await page.locator('#adjTracking').dispatchEvent('change');
      await page.keyboard.press('Escape');
      await settle(page);
      const bounds = await first.evaluate(el => {
        const sign = el.getBoundingClientRect(), wall = document.querySelector('#wall').getBoundingClientRect();
        return { left: sign.left-wall.left, top: sign.top-wall.top, right: sign.right-wall.left,
          bottom: sign.bottom-wall.top, wallWidth: wall.width, wallHeight: wall.height };
      });
      const stressPNG = await downloadImage(page, 'png', 'wall');
      const stressSVG = await downloadImage(page, 'svg', 'wall');
      assert.match(stressPNG.filename, /ca-tuong\.png$/);
      const svgCheck = await page.evaluate(svg => {
        const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
        return { error: !!doc.querySelector('parsererror'), texts: doc.querySelectorAll('text').length,
          clipped: [...doc.querySelectorAll('text')].every(el => el.closest('g[clip-path]')),
          clips: doc.querySelectorAll('clipPath').length };
      }, stressSVG.buffer.toString());
      assert.equal(svgCheck.error, false);
      assert.ok(svgCheck.texts > 0 && svgCheck.clipped && svgCheck.clips >= await page.locator('.sign').count());
      await first.locator('.name').fill('');
      await first.locator('.name').press('Enter');
      const cleanPNG = await downloadImage(page, 'png', 'wall');
      const cleanSVG = await downloadImage(page, 'svg', 'wall');
      for (const [format, stress, clean] of [['png',stressPNG,cleanPNG], ['svg',stressSVG,cleanSVG]]) {
        const diff = await compareOutside(page, stress.buffer, clean.buffer, format, bounds);
        assert.ok(diff.changedInside > 0, `${era}/${format}: changed text actually renders`);
        assert.equal(diff.changedOutside, 0, `${era}/${format}: edited text cannot bleed into neighbors`);
      }
      const single = await downloadImage(page, 'png', 'selected');
      assert.doesNotMatch(single.filename, /ca-tuong/);
    }
    await tool(page, 'deselect');
    await page.locator('[data-act="export"]').click();
    assert.equal(await page.locator('#exportDialog input[value="selected"]').isDisabled(), true);
    assert.equal(await page.locator('#exportDialog input[value="wall"]').isChecked(), true);
    await page.keyboard.press('Escape');
  });
});
