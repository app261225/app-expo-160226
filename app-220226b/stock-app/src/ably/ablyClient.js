import * as Ably from 'ably';

const ablyClient = new Ably.Realtime({
  key: process.env.EXPO_PUBLIC_ABLY_KEY,
  clientId: `client-${Date.now()}`,
});

export default ablyClient;