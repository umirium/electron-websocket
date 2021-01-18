const config = {
  http_port: '8080',
  socket_port: '3030'
};

console.log(`[SERVER]: WebSocket on: localhost: ${config.socket_port}`); // print websocket ip address
console.log(`[SERVER]: HTTP on: localhost: ${config.http_port}`); // print web server ip address

/**
 * Electron
 */
const { app, BrowserWindow } = require('electron');

let mainWindow;

const createWindow = (url) => {
  console.log(url);
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    acceptFirstMouse: true,
    autoHideMenuBar: true,
    useContentSize: true,
  });

  mainWindow.loadURL(url);
  mainWindow.focus();

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const electron = app;

electron.on('ready', createWindow.bind(this, `http://localhost:${config.http_port}/`));
electron.on('ready', createWindow.bind(this, `http://localhost:${config.http_port}/client`));
// test url
// electron.on('ready', createWindow.bind(this, `http://localhost:3000/vendingMachine/main`));
// electron.on('ready', createWindow.bind(this, `https://google.co.jp`));

// Quit when all windows are closed.
electron.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electron.quit()
  }
})

electron.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * express
 */
const express = require('express');
const bodyParser = require('body-parser');
const expressApp = express();
const httpServer = require('http').Server(expressApp);
httpServer.listen(config.http_port);

expressApp.use(bodyParser.urlencoded({
  extended: false
}));

expressApp.use('/assets', express.static(__dirname + '/www/assets'))

expressApp.get('/', (req, res) => {
  res.sendFile(__dirname + '/www/index.html');
});
expressApp.get('/client', (req, res) => {
  res.sendFile(__dirname + '/www/client.html');
});

/**
 * WebSocket
 */
const webSocketsServerPort = config.socket_port;
const webSocketServer = require('websocket').server;
const http = require('http');
const server = http.createServer();
server.listen(webSocketsServerPort);

const wsServer = new webSocketServer({
  httpServer: server,
});

const clients = {};

const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

wsServer.on('request', (request) => {
  const userID = getUniqueID();
  console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');

  // You can rewrite this part of the code to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      console.log('Received Message: ', message.utf8Data);

      // broadcasting message to all connected clients
      for (key in clients) {
        clients[key].sendUTF(message.utf8Data);
        console.log('sent Message to: ', clients[key]);
      }
    }
  })

  connection.on('close', (reasonCode, description) => {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});
