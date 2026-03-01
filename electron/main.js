const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../build/icon.icns'),
    webPreferences: {
<<<<<<< HEAD
      nodeIntegration: false, // Recommended for security
      contextIsolation: true,  // Recommended for security
=======
      nodeIntegration: false,
      contextIsolation: true,
>>>>>>> b82d79693998326a1f86243c2b05dba7a4112994
      webSecurity: true
    }
  });

  // Load the Angular app
  const args = process.argv.slice(1);
  const serve = args.some(val => val === '--serve');

  if (serve) {
    win.loadURL('http://localhost:4200');
<<<<<<< HEAD
    // Open DevTools in dev mode
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/tracker-web/browser/index.html'));
  }

  // Handle load failures
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

=======
    win.webContents.openDevTools();
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, '../dist/tracker-web/browser/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

>>>>>>> b82d79693998326a1f86243c2b05dba7a4112994
  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', () => {
  createWindow();

<<<<<<< HEAD
  // Register a shortcut to toggle DevTools (Cmd+Option+I on Mac, Ctrl+Shift+I on Win/Linux)
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (win) win.webContents.toggleDevTools();
=======
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (win) {
      win.webContents.toggleDevTools();
    }
>>>>>>> b82d79693998326a1f86243c2b05dba7a4112994
  });
});

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
