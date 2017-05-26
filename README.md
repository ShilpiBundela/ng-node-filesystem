### FILESYSTEM APPLICATION

##### System requirements
* Nodejs - __[NodeJs](https://nodejs.org/en/)__
```
node -v -> should be greater than 6.5.0
npm -v -> should be greater than 3.10.10
```

* optional - __[NVM](https://github.com/creationix/nvm)__
```
manage multiple versions of node in the machine
```

* optional - __[Yarn](https://www.npmjs.com/package/yarn)__
```
faster package installs
```


##### Setup
* client
```
cd client
npm install
```

* server
```
cd server
npm install
```

##### Running the application
* client - __THE CLIENT SHOULD START ON PORT 3000__
```
cd client
npm start
```

* server - __THE SERVER SHOULD START ON PORT 9000__
```
cd server
```

```
[without configuring the BASE_PATH | sets the base path to ./]
npm start -> to start release without node watcher
```

```
[with configuring the BASE_PATH]
npm start -- --configure <SET_BASE_PATH> -> to start release without node watcher
```

```
npm run start:dev -> to start with node watcher
```

##### Viewing the running application
[http://localhost:3000](http://localhost:3000)
