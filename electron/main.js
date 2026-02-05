const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // For simplicity in this migration, though contextIsolation: true is recommended for security
    }
  });

  // Load the Angular app
  // In development, we might want to load the serve URL, but for a build we load the file
  // Check if we are in dev mode (passed via args or env)
  const args = process.argv.slice(1);
  const serve = args.some(val => val === '--serve');

  if (serve) {
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, '../dist/tracker-web/browser/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  // Open the DevTools.
  // win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
