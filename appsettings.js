Config = {
  // @if NODE_ENV == 'DEVELOPMENT'
  api: 'http://localhost:8080',
  debug: true
  // @endif
  // @if NODE_ENV == 'TEST'
  api: 'http://black-mamba.herokuapp.com',
  min_players: 3,
  // @endif
  // @if NODE_ENV == 'PRODUCTION'
  api: 'http://black-mamba.herokuapp.com',
  min_players: 3,
  // @endif
  // @if NODE_ENV == 'ANDROID'
  api: 'http://192.168.56.1:8080',
  debug: true,
  // @endif

  // @if NODE_ENV == 'BEN'
  api: 'http://192.168.1.140:8080'
  // @endif
}
