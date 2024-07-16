import { KVStorage } from '@shared/storages/kvStorage';
import { ClientKvStorage, ElectronKvStorage } from './modules/storages/kvStorage';
import { ClientEvents } from './modules/events';
import ChannelManager from './modules/channels/manager';
import { App as ElectronApp } from 'electron';
import { PuppeteerElectron } from './pie';

import { makeAppSetup } from './factories';
import { MainWindow } from './windows';
import { registerIPCs } from './ipcs';

export type ApplicationOptions = {};

export class Application {
  private events: ClientEvents;
  private kvStorage: KVStorage;
  private clientKvStorage: ClientKvStorage;
  private channelManager: ChannelManager;
  private puppeteerElectron: PuppeteerElectron;
  private _isReady = false;
  constructor(private readonly eApp: ElectronApp, private readonly options: ApplicationOptions) {
    this.kvStorage = new ElectronKvStorage();
    this.clientKvStorage = new ClientKvStorage(this.kvStorage);
    this.events = new ClientEvents();
    this.puppeteerElectron = new PuppeteerElectron(this.eApp);
    this.channelManager = new ChannelManager(this.puppeteerElectron);
  }

  async init() {
    await this.puppeteerElectron.beforeAppReady();
    await this.initElectronApp();
    await this.puppeteerElectron.afterAppReady();
    await this.channelManager.init();
    this._isReady = true;
    this.events.onClientReady.emit();
  }

  async initElectronApp() {
    await this.eApp.whenReady();
    registerIPCs(this);
    await makeAppSetup(MainWindow);
  }

  getChannelManager() {
    if (!this._isReady) {
      throw new Error('Application not ready');
    }
    return this.channelManager;
  }

  getPuppeteerElectron() {
    if (!this._isReady) {
      throw new Error('Application not ready');
    }
    return this.puppeteerElectron;
  }
}

export default Application;
