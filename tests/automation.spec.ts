import { test, expect, type Page } from '@playwright/test';

function promiseWithResolver<T = void>() {
  let resolve: (value: T) => void;
  let reject: (value: T) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // @ts-ignore
  return { promise, resolve, reject };
}

async function testCase(page: Page, name: string): Promise<string> {
  const { promise, resolve } = promiseWithResolver<string>();

  page.on('console', (msg) => {
    const text = msg.text();
    if (text === 'SUCCESS' || text === 'FAILURE') resolve(text);
  });

  await page.goto(`/tests/test.html?grep=${encodeURI(name)}%20`);

  return promise;
}

test('Texture', async ({ page }) => {
  expect(await testCase(page, 'texture')).toBe('SUCCESS');
});

test('Text', async ({ page }) => {
  expect(await testCase(page, 'text')).toBe('SUCCESS');
});

test('Key handling', async ({ page }) => {
  expect(await testCase(page, 'Key handling')).toBe('SUCCESS');
});

test('Longpress handling', async ({ page }) => {
  expect(await testCase(page, 'Longpress handling')).toBe('SUCCESS');
});

test('Shaders', async ({ page }) => {
  expect(await testCase(page, 'Shaders')).toBe('SUCCESS');
});

test('Event Emitter', async ({ page }) => {
  expect(await testCase(page, 'Event Emitter')).toBe('SUCCESS');
});

test('Template', async ({ page }) => {
  expect(await testCase(page, 'Template')).toBe('SUCCESS');
});

test('Layout sizing', async ({ page }) => {
  expect(await testCase(page, 'layout sizing')).toBe('SUCCESS');
});

test('Layout multilevel', async ({ page }) => {
  expect(await testCase(page, 'layout multilevel')).toBe('SUCCESS');
});

test('Layout misc', async ({ page }) => {
  expect(await testCase(page, 'layout misc')).toBe('SUCCESS');
});

test('Layout autosize', async ({ page }) => {
  expect(await testCase(page, 'layout autosize')).toBe('SUCCESS');
});

test('Layout margins', async ({ page }) => {
  expect(await testCase(page, 'layout margins')).toBe('SUCCESS');
});

test('Layout padding', async ({ page }) => {
  expect(await testCase(page, 'layout padding')).toBe('SUCCESS');
});

test('Layout absolute', async ({ page }) => {
  expect(await testCase(page, 'layout absolute')).toBe('SUCCESS');
});

test('Layout resize recursion', async ({ page }) => {
  expect(await testCase(page, 'layout resize recursion')).toBe('SUCCESS');
});

test('Layout update', async ({ page }) => {
  expect(await testCase(page, 'layout update')).toBe('SUCCESS');
});

test('Layout relative', async ({ page }) => {
  expect(await testCase(page, 'layout relative')).toBe('SUCCESS');
});

test('Layout flexbox comparison wrap', async ({ page }) => {
  expect(await testCase(page, 'layout flexbox comparison wrap')).toBe('SUCCESS');
});

test('Layout flexbox comparison justifyContent', async ({ page }) => {
  expect(await testCase(page, 'layout flexbox comparison justifyContent')).toBe('SUCCESS');
});

test('Layout flexbox comparison alignContent', async ({ page }) => {
  expect(await testCase(page, 'layout flexbox comparison alignContent')).toBe('SUCCESS');
});

test('Layout flexbox comparison alignSelf', async ({ page }) => {
  expect(await testCase(page, 'layout flexbox comparison alignSelf')).toBe('SUCCESS');
});
