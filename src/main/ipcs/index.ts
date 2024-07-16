import { ipcMain } from 'electron';
import {
  GET_CHANNELS,
  ADD_CHANNEL,
  DELETE_CHANNEL,
  SHOW_CHANNEL_WINDOW,
  SEND_TEXT_MESSAGE,
} from '@shared/constants/ipcs';
import { Application } from '../app';

export const registerIPCs = (dooApp: Application) => {
  ipcMain.handle(GET_CHANNELS, async () => {
    return await dooApp.getChannelManager().getChannels();
  });

  ipcMain.handle(ADD_CHANNEL, async (...args) => {
    const channelData = args[1];
    return await dooApp.getChannelManager().addChannel(channelData);
  });
  ipcMain.handle(DELETE_CHANNEL, async (...args) => {
    return await dooApp.getChannelManager().deleteChannel(args[1]);
  });
  ipcMain.handle(SHOW_CHANNEL_WINDOW, async (...args) => {
    return await dooApp.getChannelManager().showChannelWindow(args[1]);
  });
  ipcMain.handle(SEND_TEXT_MESSAGE, async (...args) => {
    const [_, payload] = args;
    const { channel, receiver, text } = payload;
    const controller = dooApp.getChannelManager().getChannelController(channel.agent_session_id);
    if (!controller) {
      console.warn('not found controller for', channel);
    }
    await controller.sendTextMessage(receiver, text);
  });
};
