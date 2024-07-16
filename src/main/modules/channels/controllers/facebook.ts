import { sleep } from '@shared/utils/time';
import { PuppeteerChannelController } from './base';

export class FBProfileController extends PuppeteerChannelController {
  static LOGIN_URL = 'https://www.messenger.com/';
  async login(): Promise<any> {
    await this.page.waitForFunction(
      `document.querySelectorAll('script').values().some(t => t.innerText.includes("accountId")) == true`,
      { timeout: 0 }
    );
    const cookies = await this.page.cookies();
    const cuser = cookies.find((cookie) => cookie.name === 'c_user');
    return {
      uid: cuser.value,
    };
  }

  async sendTextMessage(receiver: any, text: string): Promise<any> {
    if (!this.page.url().includes(receiver)) {
      await this.page.click(`a[href="/t/${receiver}/"`);
      await sleep(2000);
    }
    try {
      await this.page.click('div[aria-label="Message"]');
    } catch (e) {
      console.warn('not found message button', e);
      await this.page.click('div[aria-label="Tin nhắn"]');
    }
    await this.page.keyboard.type(text, { delay: 100 });
    try {
      await this.page.click('div[aria-label="Press enter to send"]');
    } catch (e) {
      console.warn('not found send button', e);
      await this.page.click('div[aria-label="Nhấn Enter để gửi"]');
    }
  }
}
