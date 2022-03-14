export const Uris = {
  backendRoot : 'http://localhost:3001',
  //backendRoot : '',
  token: {
    get: '/visit/token',
    validate: '/token/validate'
  },
  visits: {
    list: '/visits',
    get: '/visits/{id}',
    token: '/visit/token',
    invite: '/visit/invite',
    patientRoomToken: '/visit/room',
    providerRoomToken: '/visit/provider-room',
    recording: '/visit/recording',
    completeRoom: '/visit/complete-room'
  },
  sms: '/send-sms',

  get: (endpoint: string): string => {
    return `${Uris.backendRoot}${endpoint}`;
  }
};

