import { ChannelType } from '@shared/constants';

export type Channel = {
  id: string;
  name: string;
  sessionId: string;
  channelType: ChannelType;
  [key: string]: any;
};
