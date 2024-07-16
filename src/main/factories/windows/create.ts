import { BrowserWindow } from 'electron';
import { WindowProps } from '@shared/types';
import { createFileRoute, createURLRoute } from 'electron-router-dom';
import { join } from 'path';
import { ENVIRONMENT } from '@shared/constants';

export function createWindow({ id, ...settings }: WindowProps) {
  const window = new BrowserWindow(settings);

  const devServerURL = createURLRoute(process.env['ELECTRON_RENDERER_URL']!, id);

  const fileRoute = createFileRoute(join(__dirname, '../renderer/index.html'), id);

  ENVIRONMENT.IS_LOCAL ? window.loadURL(devServerURL) : window.loadFile(...fileRoute);

  window.on('closed', window.destroy);
  return window;
}
