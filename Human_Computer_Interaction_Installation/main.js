const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let controlWindow;
let displayWindow;

function createWindows() {
  // Create the control window
  controlWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    frame: false,
    fullscreen: false,
    resizable: true,
    movable: true,
    title: 'Thames Control'
  });

  // Create the display window (can be fullscreen/kiosk)
  displayWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    frame: false,
    fullscreen: false,
    resizable: true,
    movable: true,
    title: 'Thames Display'
  });

  // Load your HTML files
  controlWindow.loadFile('control.html');
  displayWindow.loadFile('display.html');

  // Open DevTools in development (remove for production)
  if (process.env.NODE_ENV === 'development') {
    controlWindow.webContents.openDevTools();
    displayWindow.webContents.openDevTools();
  }

  // Handle window closed
  controlWindow.on('closed', () => {
    controlWindow = null;
  });

  displayWindow.on('closed', () => {
    displayWindow = null;
  });

  // Prevent navigation away from the app
  const preventNavigation = (e, url) => {
    if (!url.startsWith('file://')) {
      e.preventDefault();
    }
  };

  controlWindow.webContents.on('will-navigate', preventNavigation);
  displayWindow.webContents.on('will-navigate', preventNavigation);

  // Prevent new windows from opening
  controlWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  displayWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

// Function to register exit shortcuts - MUST be called after app.whenReady()
function registerExitShortcuts() {
  // Single Escape key to exit fullscreen
  const escapeRegistered = globalShortcut.register('Escape', () => {
    console.log('Escape pressed - exiting application');
    app.quit();
  });

  // Ctrl+Q for Windows
  const ctrlQRegistered = globalShortcut.register('Control+Q', () => {
    console.log('Ctrl+Q pressed - exiting application');
    app.quit();
  });

  // Ctrl+Shift+Q for more security (harder to press accidentally)
  const ctrlShiftQRegistered = globalShortcut.register('Control+Shift+Q', () => {
    console.log('Admin quit shortcut pressed - exiting application');
    app.quit();
  });

  // F11 to toggle fullscreen for current focused window
  const f11Registered = globalShortcut.register('F11', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
      console.log('F11 pressed - toggled fullscreen');
    }
  });

  // Log registration status
  console.log('Exit shortcuts registered:');
  console.log('  Escape:', escapeRegistered);
  console.log('  Control+Q:', ctrlQRegistered);
  console.log('  Control+Shift+Q:', ctrlShiftQRegistered);
  console.log('  F11 (fullscreen toggle):', f11Registered);
}

// Electron app lifecycle
app.whenReady().then(() => {
  createWindows();
  // Register shortcuts AFTER windows are created
  registerExitShortcuts();
});

app.on('window-all-closed', () => {
  // Unregister shortcuts before quitting
  globalShortcut.unregisterAll();
  
  // On macOS, apps typically stay open until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create windows when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindows();
  }
});

// Disable hardware acceleration if needed (for older systems)
// app.disableHardwareAcceleration();

// For exhibition/kiosk: prevent app from being suspended
app.commandLine.appendSwitch('disable-renderer-backgrounding');