import { Page } from 'puppeteer-core';

export interface ChannelController {
  login(): Promise<any>;
  sendTextMessage(receiver: any, text: string): Promise<any>;
}

export abstract class PuppeteerChannelController implements ChannelController {
  constructor(protected readonly page: Page) {}
  login(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  sendTextMessage(receiver: any, text: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
