declare global {
  interface Window {
    channelManagerAPI: {
      getChannels: () => Promise<any>;
      addChannel: (addChannelToken: string) => Promise<any>;
      deleteChannel: (id: number) => Promise<any>;
      showChannelWindow: (sessionId: string) => Promise<any>;
      sendTextMessage: (payload: { channel: any; receiver: any; text: string }) => Promise<any>;
    };
  }
}
export {};
