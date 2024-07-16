/**
 * Provide a way to control electron BrowserWindow by puppeteer
 */

import { App, BrowserWindow } from 'electron';
import getPort from 'get-port';
import retry from 'async-retry';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import { randomString } from '@shared/utils/random';

export class PuppeteerElectron {
  private browser?: Browser;
  private windowPageMap = new Map<string, { window: BrowserWindow; page: Page }>();
  private _isReady = false;
  constructor(private readonly app: App) {}

  async beforeAppReady(): Promise<void> {
    if (this.app.isReady()) {
      throw new Error('Must be called at startup before the electron app is ready.');
    }

    const actualPort = await getPort({ host: '127.0.0.1', port: 9219 });
    this.app.commandLine.appendSwitch('remote-debugging-port', `${actualPort}`);
    this.app.commandLine.appendSwitch('remote-debugging-address', '127.0.0.1');
  }

  isReady() {
    return this._isReady;
  }

  async afterAppReady(): Promise<void> {
    if (!this.app.isReady()) {
      throw new Error('Please connect after the app is ready.');
    }
    if (!puppeteer) {
      throw new Error("The parameter 'puppeteer' was not passed in.");
    }

    const port = this.app.commandLine.getSwitchValue('remote-debugging-port');
    if (!port) {
      throw new Error('Please call initialize before calling connect.');
    }

    const debuggerUrl = await retry(() => this.getAppDebuggerUrl(port));

    this.browser = await puppeteer.connect({
      browserWSEndpoint: debuggerUrl,
      defaultViewport: null,
    });
    this._isReady = true;
  }

  getBrowser() {
    if (!this.browser) {
      throw new Error('Please call connect before calling getBrowser.');
    }
    return this.browser;
  }

  async newWindowPage(
    url: string,
    identifier?: string,
    options?: {
      show?: boolean;
      hideOnClose?: boolean;
    }
  ) {
    const { show, hideOnClose } = options || {};
    if (!identifier) identifier = randomString(30);
    const window = new BrowserWindow({
      show: !!show,
      webPreferences: {
        partition: `persist:${identifier}`,
      },
    });
    if (hideOnClose) {
      window.on('close', (e) => {
        console.log('close', e);
        e.preventDefault();
        window.hide();
      });
    }
    await window.loadURL(url);
    await window.webContents.executeJavaScript(`window.hicWindowId = '${identifier}'`);
    const page = await this.getPage(identifier);
    this.windowPageMap.set(identifier, { window, page });
    return { window, page, identifier };
  }

  async closeWindow(identifier: string) {}

  async hideWindow(identifier: string) {
    const { window } = this.windowPageMap.get(identifier) || {};
    if (window) window.hide();
  }

  async showWindow(identifier: string) {
    const { window } = this.windowPageMap.get(identifier) || {};
    if (window) window.show();
  }

  getWindowPage(identifier: string) {
    return this.windowPageMap.get(identifier) || undefined;
  }

  private async getPage(identifier: string) {
    const browser = this.getBrowser();
    const pages = await browser.pages();
    for (const page of pages) {
      if ((await page.evaluate('window.hicWindowId')) === identifier) return page;
    }
    return null;
  }

  private async getAppDebuggerUrl(port: string): Promise<string> {
    const response = await fetch(`http://127.0.0.1:${port}/json/version?t=${Math.random()}`);
    const debugEndpoints = await response.json();
    return debugEndpoints.webSocketDebuggerUrl;
  }
}
