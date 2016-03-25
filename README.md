# Black Mamba
A hilarious multiplayer guessing game. Built with Ionic for iOS and Android.

For an overview of how this game is played, please see [the rules](rules.md).


## Team

  - __Product Owner__: Benjamin Baum
  - __Scrum Master__: Tom Coughlin
  - __Development Team Members__: Noel Felix, Daniel Ramos

## Table of Contents

1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)



## Requirements

- Node 0.12.x or >= 4.3
- Postgresql >= 9.4.6
- Ionic >= 1.7.14

>**Important:** Before you can get started with Cordova Android or iOS dev, you must set up your workstation in accordance with the Cordova [Android](http://cordova.apache.org/docs/en/3.4.0/guide_platforms_android_index.md.html#Android%20Platform%20Guide) and [iOS](http://cordova.apache.org/docs/en/3.4.0/guide_platforms_ios_index.md.html#iOS%20Platform%20Guide) platform guides.

## Development

### Installing Dependencies


From within the root directory:

```sh
$ npm install -g cordova ionic
$ cordova platform rm ios
$ cordova platform add ios@4.1.0
$ ionic browser add crosswalk@12.41.296.5
$ npm install
```

### Database

Create your database: 

```sh
# CREATE DATABASE thesis;
```

By default, Black Mamba will connect to the `thesis` database on `localhost`. An alternate database url can be set via `process.env.DATABASE_URL`.

Upon booting the server for the first time, your schema will be created and all migrations will be run.

### Booting the Server
##### Development: 
From the root:

`$ npm start` (from the root)

##### Production: 

`$ node server/server.js`

### Configuring the Client
The client can be set up to connect to different servers, and this configuration is managed by `gulp`. To connect to `localhost`, run `gulp dev`. Follow the model in `appsettings.js` (in the root directory) and `gulpfile.js` to add your own urls/corresponding gulp tasks to connect to another server.

All `api` calls to the black mamba server from the client must use `Config.api` as the base url.

>**Important:** `npm start` automatically runs `gulp dev`. This can be changed in `package.json`, or you can simply run your custom `gulp` task after kicking off `npm start`. 


### Launching the Client
From `client/`: 
##### Desktop Browser: 
`$ ionic serve -lab`

##### iOS Simulator
`$ ionic build ios; ionic emulate ios`

##### Android Emulator
`$ ionic build android; ionic emulate android`

##### iOS Device
Xcode

##### Android Device

`$ ionic build android; ionic run android`

### Adding New Dependencies
Server and database dependencies should be installed with `npm` from the root. Client-side dependencies should be installed with `npm` or `bower` from the `client` directory.

### Roadmap

View the project roadmap [here](https://github.com/purple-cobras/thesis/issues)

## Testing
`$ npm test`

Tests will be run by `CircleCI` upon submission of a Pull Request.


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
