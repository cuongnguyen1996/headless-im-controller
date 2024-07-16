import { FSDB } from 'file-system-db';
import { app } from 'electron';
import { join } from 'path';
import { PuppeteerElectron } from '@main/pie';
import { ChannelController } from './controllers/base';
import { FBProfileController } from './controllers/facebook';
import { Page } from 'puppeteer-core';
import { ChannelType } from '@shared/constants';
import { randomString } from 'shared/utils/random';
import { Channel } from '@shared/types';

class ChannelManager {
  private db: FSDB;
  private channelControlllerMap = new Map<string, ChannelController>();
  constructor(private readonly pie: PuppeteerElectron) {}

  async init() {
    const appPath = app.getAppPath();
    const dbPath = join(appPath, 'out', 'data', 'channels.json');
    this.db = new FSDB(dbPath, true);
    this.loadChannelWindowPages();
  }

  async getChannels() {
    return this.db.getAll().map((e) => e.value);
  }

  async getChannel(id: number) {
    return this.db.get(id.toString());
  }

  async addChannel(channelType: ChannelType) {
    let channelObj = undefined;
    switch (channelType) {
      case ChannelType.FB_PROFILE:
        channelObj = await this.addFbProfileChannel();
        break;
      default:
        throw new Error('invalid channel type');
    }
    if (!channelObj) {
      throw new Error('invalid channel type');
    }
    this.saveChannel(channelObj);
  }

  async deleteChannel(id: number) {
    this.db.delete(id.toString());
  }

  private async openAddChannelWindownPage(url: string) {
    const { window, page, identifier } = await this.pie.newWindowPage(url, undefined, {
      show: true,
      hideOnClose: true,
    });
    return { window, page, sessionId: identifier };
  }

  private async addFbProfileChannel(): Promise<Channel> {
    const id = randomString(20);
    const { sessionId, window, page } = await this.openAddChannelWindownPage(FBProfileController.LOGIN_URL);
    const controller = new FBProfileController(page);
    const { uid } = await controller.login();
    this.channelControlllerMap.set(sessionId, controller);
    window.hide();
    return {
      id: id,
      fbuid: uid,
      name: uid,
      channelType: ChannelType.FB_PROFILE,
      sessionId,
    };
  }

  async showChannelWindow(sessionId: string) {
    const { window } = this.pie.getWindowPage(sessionId) || {};
    if (window) window.show();
  }

  private async loadChannelWindowPage(channel: any) {
    if (this.channelControlllerMap.has(channel.sessionId)) {
      return;
    }
    const initialUrl = this.getChannelWindowPageInitialUrl(channel);
    const { page } = await this.pie.newWindowPage(initialUrl, channel.sessionId, {
      show: false,
      hideOnClose: true,
    });
    const controller = this.createChannelController(channel, page);
    this.channelControlllerMap.set(channel.agent_session_id, controller);
    console.log('loadChannelWindowPage', channel);
  }

  private createChannelController(channel: Channel, page: Page) {
    if (channel.channelType == ChannelType.FB_PROFILE) {
      return new FBProfileController(page);
    }
  }

  private getChannelWindowPageInitialUrl(channel: Channel) {
    if (channel.channelType == ChannelType.FB_PROFILE) {
      return FBProfileController.LOGIN_URL;
    }
  }

  private async loadChannelWindowPages() {
    const channels = await this.getChannels();
    for (const channel of channels) {
      await this.loadChannelWindowPage(channel);
    }
  }

  private saveChannel(channel: any) {
    this.db.set(channel.id.toString(), channel);
  }

  getChannelController(sessionId: string) {
    return this.channelControlllerMap.get(sessionId);
  }
}

export default ChannelManager;
