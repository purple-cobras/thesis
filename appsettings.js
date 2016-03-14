Config = {
  // @if NODE_ENV == 'DEVELOPMENT'
  api: 'http://localhost:8080',
  debug: true
  // @endif
  // @if NODE_ENV == 'TEST'
  api: 'http://black-mamba.herokuapp.com',
  // @endif
  // @if NODE_ENV == 'PRODUCTION'
  api: '',
  // @endif
  // @if NODE_ENV == 'ANDROID'
  api: 'http://192.168.56.1:8080',
  debug: true
  // @endif
}