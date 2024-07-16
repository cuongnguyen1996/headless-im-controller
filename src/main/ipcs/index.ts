import { ipcMain } from 'electron';
import {
  GET_CHANNELS,
  ADD_CHANNEL,
  DELETE_CHANNEL,
  SHOW_CHANNEL_WINDOW,
  SEND_TEXT_MESSAGE,
} from '@shared/constants/ipcs';
import { Application } from '../app';

export const registerIPCs = (app: Application) => {
  ipcMain.handle(GET_CHANNELS, async () => {
    return await app.getChannelManager().getChannels();
  });

  ipcMain.handle(ADD_CHANNEL, async (...args) => {
    const channelData = args[1];
    return await app.getChannelManager().addChannel(channelData);
  });
  ipcMain.handle(DELETE_CHANNEL, async (...args) => {
    return await app.getChannelManager().deleteChannel(args[1]);
  });
  ipcMain.handle(SHOW_CHANNEL_WINDOW, async (...args) => {
    return await app.getChannelManager().showChannelWindow(args[1]);
  });
  ipcMain.handle(SEND_TEXT_MESSAGE, async (...args) => {
    const [_, payload] = args;
    const { channel, receiver, text } = payload;
    const controller = app.getChannelManager().getChannelController(channel.sessionId);
    if (!controller) {
      console.warn('not found controller for', channel);
    }
    await controller.sendTextMessage(receiver, text);
  });
};
