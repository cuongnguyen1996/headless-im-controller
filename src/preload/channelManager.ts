import { contextBridge, ipcRenderer } from 'electron';
import {
  ADD_CHANNEL,
  DELETE_CHANNEL,
  GET_CHANNELS,
  SHOW_CHANNEL_WINDOW,
  SEND_TEXT_MESSAGE,
} from '@shared/constants/ipcs';
import { ChannelType } from 'shared/constants';

contextBridge.exposeInMainWorld('channelManagerAPI', {
  getChannels: () => ipcRenderer.invoke(GET_CHANNELS),
  addChannel: (channelType: ChannelType) => ipcRenderer.invoke(ADD_CHANNEL, channelType),
  deleteChannel: (id: number) => ipcRenderer.invoke(DELETE_CHANNEL, id),
  showChannelWindow: (id: number) => ipcRenderer.invoke(SHOW_CHANNEL_WINDOW, id),
  sendTextMessage: (payload: { channel: any; receiver: any; text: string }) =>
    ipcRenderer.invoke(SEND_TEXT_MESSAGE, payload),
});
