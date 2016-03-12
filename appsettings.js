Config = {
  // @if NODE_ENV == 'DEVELOPMENT'
  api: 'http://localhost:8080',
  debug: true
  // @endif
  // @if NODE_ENV == 'TEST'
  api: 'http://black-mamba.herokuapp.com',
  // @endif
  // @if NODE_ENV == 'PRODUCTION'
  api: ''
  // @endif
}