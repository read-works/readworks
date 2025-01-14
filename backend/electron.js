const path = require('path');
const rimraf = require('rimraf');
const process = require('process');
const {
  existsSync,
  mkdirSync,
  writeFileSync,
  appendFileSync,
  readFileSync,
  unlinkSync,
} = require('fs');
const {
  BrowserWindow,
  app,
  shell,
  screen,
  dialog,
  ipcMain,
  nativeTheme,
  Menu,
  utilityProcess,
} = require('electron');
const translatedMenu = require('./_electron/menu.i18n.js');
const translatedNotifications = require('./_electron/notifications.i18n.js');
const PERFORM_FACTORY_RESET = 1;
process.env.DOWNLOAD_FOLDER = app.getPath('downloads');
process.env.READWORKS_DATA_DIR = app.getPath('userData');
process.env.READWORKS_USER_DIR = app.getPath('home');

let countryCode = app.getLocaleCountryCode();

if (
  !translatedMenu.I18nMenu[countryCode] ||
  !translatedNotifications.I18nNotifications[countryCode]
) {
  countryCode = 'EN';
}
let backendChildProcess, transformerProcess;
const i18nMenuLocalized = translatedMenu.I18nMenu[countryCode];
const I18nNotificationsLocalized = translatedNotifications.I18nNotifications[countryCode];

const { autoUpdater } = require('electron-updater');

const { getSettings } = require('./controller/SettingsController');
const { appVersion } = require('./controller/MigrationController');
const { getNextTransformationTask } = require('./helpers/announce-transformation');
const pidFile = path.join(process.env.READWORKS_DATA_DIR, '.pid');
const projectsFile = path.join(process.env.READWORKS_DATA_DIR, 'projects.json');
const logSwitch = path.join(process.env.READWORKS_DATA_DIR, '.trace');
const logFile = path.join(process.env.READWORKS_DATA_DIR, 'session.log');
const documentsFolder = app.getPath('documents');
const ENGINE_URL = 'http://localhost:1234';
if (!existsSync(documentsFolder + '/readworks')) {
  mkdirSync(documentsFolder + '/readworks');
}

if (existsSync(logFile) && !existsSync(logSwitch)) {
  unlinkSync(logFile);
}

const appLogger = (data, type = '') => {
  if (!existsSync(logSwitch)) return;

  if (!['string', 'number'].includes(typeof data)) {
    data = JSON.stringify(data, null, '\t');
  }

  appendFileSync(
    logFile,
    new Date().toISOString() + ' ' + (type.length ? type + ' ' : 'application ') + data + '\n',
    {
      encoding: 'utf-8',
    },
  );
};

const runTransformers = () => {
  const taskName = getNextTransformationTask();

  if (taskName && existsSync(path.join(__dirname, 'transformers', `${taskName}.js`))) {
    transformerProcess = utilityProcess.fork(
      path.join(__dirname, 'transformers', `${taskName}.js`),
    );

    transformerProcess.on('message', (message) => {
      if (message.event === 'logEntryTransformer') {
        appLogger(message.payload.data, message.payload.event);
      }

      if (message.event === 'statusUpdateTransformer') {
        backendChildProcess.postMessage({
          message: 'statusUpdateTransformer',
          payload: message.payload,
        });
      }
    });

    transformerProcess.once('exit', () => {
      appLogger('Check for further transformation jobs');
      runTransformers();
    });
  } else {
    if (process.env.READWORKS_PROJECT_FILE) {
      writeFileSync(process.env.READWORKS_PROJECT_FILE, appVersion, 'utf-8');

      // percent completed 1 (100% complete) means the user can restart the app finally
      backendChildProcess.postMessage({
        message: 'statusUpdateTransformer',
        payload: { percentCompleted: 1 },
      });
      setTimeout(() => {
        exit('migrationFinishedRestart', true);
      }, 10000);
    }
  }
};

appLogger('start app');

const initializeProjectsFile = (force = false) => {
  if (!existsSync(projectsFile) || force) {
    let defaultProject = documentsFolder + '/readworks/default-project';
    let defaultProjectRwxFile = documentsFolder + '/readworks/default-project/default-project.rwx';

    if (!existsSync(defaultProject)) {
      mkdirSync(defaultProject);
    }

    if (!existsSync(defaultProjectRwxFile)) {
      writeFileSync(defaultProjectRwxFile, appVersion, 'utf-8');
    }

    writeFileSync(projectsFile, JSON.stringify([defaultProjectRwxFile]));
  }
};

const loadMostRecentProject = () => {
  let projects = JSON.parse(readFileSync(projectsFile, 'utf-8'));

  if (projects instanceof Array) {
    let writeUpdate = false;
    projects = projects.filter((project) => {
      const exists = existsSync(project);

      if (!exists) {
        writeUpdate = true;
      }

      return exists;
    });

    //TODO fix path problem with '.' as READWORKS_PROJECT
    process.env.READWORKS_PROJECT = path.dirname(projects[0]);
    if (
      process.platform === 'win32' &&
      process.argv.length >= 2 &&
      process.env.READWORKS_PROJECT !== process.argv[1] &&
      process.argv[1].length &&
      process.argv[1].length > 1
    ) {
      updateProjectsFile(process.argv[1]);
      return;
    }
    if (writeUpdate) {
      console.log('write project update due to missing pathes');
      writeFileSync(projectsFile, JSON.stringify(projects), 'utf-8');
    }

    process.env.READWORKS_PROJECT_FILE = projects[0];
  } else {
    console.log('unknown case. exiting');
  }
};

let haltingRoutine = {
  handler: undefined,
  restartRequested: false,
};

const exit = (source = '', relaunch = false) => {
  appLogger(source + ' requested an app exit ' + (relaunch ? 'with ' : 'without ') + 'relaunch');

  if (haltingRoutine.handler) {
    appLogger('destroy previously created halting routine');
    clearTimeout(haltingRoutine.handler);
  }

  if (!haltingRoutine.restartRequested && relaunch) {
    haltingRoutine.restartRequested = true;
  }

  if (!relaunch && haltingRoutine.restartRequested) {
    appLogger('anyway a restart was requested earlier already');
  }

  appLogger('halting routine applied');
  haltingRoutine.handler = setTimeout(() => {
    if (existsSync(pidFile)) {
      appLogger('halting engine');
      try {
        process.kill(readFileSync(pidFile, 'utf-8'));
      } catch (error) {
        appLogger(
          'engine process does not exist (' + error.message + ') ' + readFileSync(pidFile, 'utf-8'),
        );
      }
      unlinkSync(pidFile);
    }

    appLogger('and goodbye');

    if (haltingRoutine.restartRequested) {
      app.relaunch();
    }

    app.exit();
  }, 5);
};

const updateProjectsFile = (path) => {
  if (path === '.') {
    return;
  }
  const recentProjects = JSON.parse(readFileSync(projectsFile, 'utf-8'));
  const pathIndex = recentProjects.indexOf(path);

  if (pathIndex === 0) {
    return;
  } else if (pathIndex === -1) {
    recentProjects.unshift(path);
  } else if (pathIndex !== 0) {
    recentProjects.splice(pathIndex, 1);
    recentProjects.unshift(path);
  }

  writeFileSync(projectsFile, JSON.stringify(recentProjects), 'utf-8');

  exit('updateProjectsFile', true);
};

initializeProjectsFile();

try {
  loadMostRecentProject();
} catch (e) {
  initializeProjectsFile(true);
  loadMostRecentProject();
}

let firstWindowRef;
let secondWindowRef;
const companyUrl = 'https://readworks.app/';

const localizeCompanyUrl = (locale, addPath) => {
  return `${companyUrl}/${locale}/${addPath}`;
};

const detectCurrentAppLocale = () => {
  // protocol://server/language/   (language is always at pos 3 of split aray
  let urlData = firstWindowRef.webContents.getURL().split('/');
  return urlData && urlData[3] && urlData[3].length === 2 ? urlData[3] : 'en';
};

const openAppWindow = async (is2ndWindow = false) => {
  // determine whether there is already an app running
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    appLogger('the app running does not have the single instance lock');
    setTimeout(() => {
      appLogger('delay passed restarting application');
      app.relaunch();
      app.exit();
    }, 1000);
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
      appLogger('starting a second instance closing this one');
      //app.exit();
      if (firstWindowRef) {
        appLogger('destroy first window ref');
        firstWindowRef.webContents.destroy();
      }
      if (secondWindowRef) {
        appLogger('destroy second window ref');
        secondWindowRef.webContents.destroy();
      }
      appLogger('calling app quit ()');
      app.quit();
    });

    if (!is2ndWindow && firstWindowRef) {
      firstWindowRef.show();
      return;
    }

    let startupSetting;
    try {
      startupSetting = await getSettings();
    } catch (e) {
      console.log('Failed to load');
      console.log(e);
    }

    const display = screen.getPrimaryDisplay();

    if (typeof startupSetting.darkMode === 'boolean') {
      nativeTheme.themeSource = startupSetting.darkMode ? 'dark' : 'light';
    } else {
      nativeTheme.themeSource = 'system';
    }

    const projectName = process.env.READWORKS_PROJECT.split('/')
      .filter((prt) => {
        return prt.length;
      })
      .pop();

    const win = new BrowserWindow({
      width: Math.round(display.workAreaSize.width / (!is2ndWindow ? 1.17 : 1.25)),
      height: Math.round(display.workAreaSize.height / (!is2ndWindow ? 1.25 : 1.5)),
      //titleBarStyle: !is2ndWindow ? 'hiddenInset' : undefined,
      frame: true,

      backgroundColor: nativeTheme.themeSource === 'light' ? '#ffffff' : '#111826',
      acceptFirstMouse: true,
      title: 'readworks [' + projectName + ']',
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        enableRemoteModule: true,
        devTools: !app.isPackaged,
        //nodeIntegrationInWorker:true,
        //  preload: path.join(__dirname, "scripts/preload.js"),
      },
    });

    if (is2ndWindow) {
      const oldXYWH = [];
      oldXYWH[0] = firstWindowRef.getPosition()[0];
      oldXYWH[1] = firstWindowRef.getPosition()[1];
      oldXYWH[2] = firstWindowRef.getSize()[0];
      oldXYWH[3] = firstWindowRef.getSize()[1];
      const sidebarWidth = 56;
      firstWindowRef.setSize(
        display.workAreaSize.width / 2 + sidebarWidth,
        display.workAreaSize.height,
      );
      firstWindowRef.setPosition(0, 0);

      secondWindowRef = win;
      secondWindowRef.setSize(
        display.workAreaSize.width / 2 - sidebarWidth,
        display.workAreaSize.height,
      );
      secondWindowRef.setPosition(display.workAreaSize.width / 2 + sidebarWidth, 0);
      secondWindowRef;
      try {
        const eventuallyTell2ndWindow = setInterval(() => {
          if (!secondWindowRef || !secondWindowRef.webContents) {
            return;
          }

          secondWindowRef.webContents.send('secondWindow', '');
        }, 100);

        setTimeout(() => {
          clearInterval(eventuallyTell2ndWindow);
        }, 1000 * 60);
      } catch (e) {}

      secondWindowRef.on('close', () => {
        try {
          secondWindowRef = undefined;

          firstWindowRef.setSize(oldXYWH[2], oldXYWH[3]);
          firstWindowRef.setPosition(oldXYWH[0], oldXYWH[1]);
        } catch (e) {
          // maybe the app was exitted
        }
      });
    } else {
      firstWindowRef = win;
      firstWindowRef.setVisibleOnAllWorkspaces(true);
      firstWindowRef.on('close', () => {
        if (secondWindowRef) {
          secondWindowRef.close();
          appLogger('as primary window was closed there annot be a second window anymore');
        }

        if (process.platform === 'darwin') {
          exit('firstWindowRefOnCloseEvent');
        }
      });
    }
    await win.loadURL(!is2ndWindow ? ENGINE_URL : firstWindowRef.webContents.getURL());

    // TODO use this to VOID XSS AND ACCESS TO OTHER DOMAINS THAN READWORKS.APP
    // session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    //   if (!details.url.startsWith(ENGINE_URL)) {
    //     console.info('blacklisted request');
    //     callback({ cancel: true });
    //   } else {
    //     console.info('whitelisted request');
    //     callback({});
    //   }
    // });
  }
};

const template = [
  // macOS typically has the application name as the first menu item
  ...(process.platform === 'darwin'
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about', label: i18nMenuLocalized.macAppSubmenu.about },
            { type: 'separator' },
            //     {role: 'services'},
            { type: 'separator' },
            { role: 'hide', label: i18nMenuLocalized.hide },
            { role: 'hideothers', label: i18nMenuLocalized.macAppSubmenu.hideothers },
            { role: 'unhide', label: i18nMenuLocalized.macAppSubmenu.unhide },
            { type: 'separator' },
            { role: 'quit', label: i18nMenuLocalized.macAppSubmenu.quit },
          ],
        },
      ]
    : []),
  {
    label: i18nMenuLocalized.fileMainMenu,
    submenu: [
      {
        label: i18nMenuLocalized.fileMainSubmenu.newProject,
        click: async () => {
          let propertyForOs = [];

          switch (process.platform) {
            case 'darwin':
              propertyForOs.push('createDirectory');
              break;
            case 'win32':
              propertyForOs.push('promptToCreate');
              break;
          }

          propertyForOs.push('openDirectory');

          let targetFolder = await dialog.showOpenDialog(firstWindowRef, {
            properties: propertyForOs,
          });

          if (!targetFolder.canceled && targetFolder.filePaths.length) {
            const filePath = targetFolder.filePaths.shift();
            const fileName = path.basename(filePath) + '.rwx';
            const fullFilePath = path.join(filePath, fileName);

            if (!existsSync(fullFilePath)) {
              writeFileSync(fullFilePath, appVersion, 'utf-8');
            }

            updateProjectsFile(fullFilePath);
          }
        },
      },
      {
        label: i18nMenuLocalized.fileMainSubmenu.openProject,
        click: async () => {
          let file = await dialog.showOpenDialog(firstWindowRef, {
            properties: ['openFile'],
            filters: [
              {
                name: 'Project File',
                extensions: ['rwx'],
              },
            ],
          });

          const relevantFile = file.filePaths.pop();

          if (!file.canceled && relevantFile.slice(-4) === '.rwx') {
            updateProjectsFile(relevantFile);
          }
        },
      },
    ],
  },
  {
    label: i18nMenuLocalized.editMainMenu,
    submenu: [
      { role: 'undo', label: i18nMenuLocalized.editMainSubmenu.undo },
      { role: 'redo', label: i18nMenuLocalized.editMainSubmenu.redo },
      { type: 'separator' },
      { role: 'cut', label: i18nMenuLocalized.editMainSubmenu.cut },
      { role: 'copy', label: i18nMenuLocalized.editMainSubmenu.copy },
      { role: 'paste', label: i18nMenuLocalized.editMainSubmenu.paste },
      { type: 'separator' },
      {
        label: i18nMenuLocalized.editMainSubmenu.findInCase,
        accelerator: 'CmdOrCtrl+F',
        click: async () => {
          if (firstWindowRef.webContents.isFocused()) {
            firstWindowRef.webContents.send('ctrl-f', '');
          } else if (secondWindowRef.webContents.isFocused()) {
            secondWindowRef.webContents.send('ctrl-f', '');
          }
        },
      },
      { type: 'separator' },
      ...(process.platform === 'darwin'
        ? [
            {
              role: 'pasteAndMatchStyle',
              label: i18nMenuLocalized.editMainSubmenu.macPasteAndMatchStyle,
            },
            { role: 'delete', label: i18nMenuLocalized.editMainSubmenu.macDelete },
            { role: 'selectAll', label: i18nMenuLocalized.editMainSubmenu.macSelectAll },
            { type: 'separator' },
            {
              label: i18nMenuLocalized.editMainSubmenu.macSpeechSubMain,
              submenu: [
                {
                  role: 'startSpeaking',
                  label: i18nMenuLocalized.editMainSubmenu.macSpeechSubmenu.startSpeaking,
                },
                {
                  role: 'stopSpeaking',
                  label: i18nMenuLocalized.editMainSubmenu.macSpeechSubmenu.stopSpeaking,
                },
              ],
            },
          ]
        : [
            { role: 'delete', label: i18nMenuLocalized.editMainSubmenu.winDelete },
            { type: 'separator' },
            { role: 'selectAll', label: i18nMenuLocalized.editMainSubmenu.winSelectAll },
          ]),
    ],
  },
  {
    label: i18nMenuLocalized.viewMainMenu,
    submenu: [
      { role: 'reload', label: i18nMenuLocalized.viewMainSubmenu.reload },
      //{role: 'forceReload'},
      //{ role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom', label: i18nMenuLocalized.viewMainSubmenu.resetZoom },
      { role: 'zoomIn', label: i18nMenuLocalized.viewMainSubmenu.zoomIn },
      { role: 'zoomOut', label: i18nMenuLocalized.viewMainSubmenu.zoomOut },
      { type: 'separator' },
      {
        label: i18nMenuLocalized.viewMainSubmenu.toggleDualScreen,
        accelerator: 'CmdOrCtrl+D',
        click: async () => {
          if (!secondWindowRef) {
            await openAppWindow(true);
          } else {
            secondWindowRef.close();
            secondWindowRef = undefined;
          }
        },
      },
      //{ role: 'togglefullscreen' },
    ],
  },
  {
    label: i18nMenuLocalized.windowMainMenu,
    submenu: [
      { role: 'minimize', label: i18nMenuLocalized.windowMainSubmenu.minimize },
      { role: 'zoom', label: i18nMenuLocalized.windowMainSubmenu.zoom },
      ...(process.platform === 'darwin'
        ? [
            { type: 'separator' },
            { role: 'front', label: i18nMenuLocalized.windowMainSubmenu.macBringToFront },
            { type: 'separator' },
            { role: 'window', label: i18nMenuLocalized.windowMainSubmenu.macWindow },
          ]
        : [{ role: 'close', label: i18nMenuLocalized.windowMainSubmenu.winCloseWindow }]),
    ],
  },
  {
    label: i18nMenuLocalized.helpMainMenu,
    submenu: [
      {
        label: i18nMenuLocalized.helpMainSubmenu.openExternalHelpTopics,
        accelerator: 'CmdOrCtrl+H',
        click: async () => {
          await shell.openExternal(
            localizeCompanyUrl(detectCurrentAppLocale(), 'handbook/001-overview'),
          );
        },
      },
      {
        label: i18nMenuLocalized.helpMainSubmenu.thirdPartyLicenses,
        accelerator: '',
        click: async () => {
          await shell.openExternal('https://cdn.readworks.app/licenses/3rdpartylicenses.txt');
        },
      },
      {
        label: i18nMenuLocalized.helpMainSubmenu.factoryReset,
        accelerator: '',
        click: async () => {
          const selection = await dialog.showMessageBox(undefined, {
            title: I18nNotificationsLocalized.factoryResetNotification.title,
            message: I18nNotificationsLocalized.factoryResetNotification.message,
            detail: I18nNotificationsLocalized.factoryResetNotification.detail,
            type: 'question',
            buttons: [
              I18nNotificationsLocalized.factoryResetNotification.cancel,
              I18nNotificationsLocalized.factoryResetNotification.confirm,
            ],
          });

          if (selection.response === PERFORM_FACTORY_RESET) {
            appLogger(
              'readworks now being reverted into initial state',
              'application:factory-reset',
            );

            //fs.rmSync(process.env.READWORKS_DATA_DIR, { recursive: true, force: true });
            appLogger(process.env.READWORKS_DATA_DIR);
            await rimraf.moveRemove(process.env.READWORKS_DATA_DIR);
            exit('factory reset', true);
          }
        },
      },
    ],
  },
];
const menu = Menu.buildFromTemplate(template);

Menu.setApplicationMenu(menu);

app.on('open-file', (event, path) => {
  appLogger('open-file event was thrown', 'application:event');
  event.preventDefault();
  updateProjectsFile(path);
});

app.on('before-quit', () => {
  if (process.platform === 'darwin') {
    exit('beforeQuit');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    try {
      appLogger('All windows were closed darwin only (window-all-closed)', 'application:event');
      exit('windowAllClosed');
      app.quit();
    } catch (e) {
      appLogger('Do we ever run into this case', 'application:event');
    }
  }
});

app.on('ready', async () => {
  await autoUpdater.checkForUpdatesAndNotify(I18nNotificationsLocalized.downloadNotification);
  ipcMain.emit('autoUpdateReadyToInstall');
  appLogger('Auto Update handling (ready)', 'application:event');
});

if (existsSync(pidFile)) {
  const oldBackendPid = readFileSync(pidFile, 'utf-8');
  if (oldBackendPid.length) {
    appLogger('halting ghost engine ' + oldBackendPid);
    try {
      process.kill(parseInt(oldBackendPid, 10));
    } catch (e) {
      appLogger('ghost engine process does not exist (' + e.message + ') ' + oldBackendPid);
    }
  }
  unlinkSync(pidFile);
}

app.whenReady().then(async () => {
  backendChildProcess = utilityProcess.fork(path.join(__dirname, 'server.js'));

  backendChildProcess.on('message', async (message) => {
    if (!existsSync(pidFile) && backendChildProcess.pid) {
      writeFileSync(pidFile, backendChildProcess.pid.toString(), 'utf-8');
      appLogger('pid written to file');
    }

    if (message.event === 'logEntryBackend') {
      appLogger(message.payload.data, message.payload.event);
    } else if (message.event === 'serviceReady') {
      appLogger('serviceReady now open readworks client');
      await openAppWindow();
    } else if (message.event === 'runTransformers') {
      runTransformers();
    }
  });

  ipcMain.on('shutdown', (event, title) => {
    exit('clientRequestedShutdown');
  });
  ipcMain.on('restartApp', (event, title) => {
    exit('ipcMainRestartApp', true);
  });

  ipcMain.on('showUpdate', async (event, path) => {
    await shell.showItemInFolder(path);
    exit('ipcMainShowUpdate');
  });

  ipcMain.on('externalBrowser', async (event, url) => {
    await shell.openExternal(url);
  });

  ipcMain.on('openProjectInFileExplorer', async (event, caseName) => {
    appLogger(
      'open project folder in file explorer ' + process.env.READWORKS_PROJECT,
      'application:event',
    );
    await shell.openPath(process.env.READWORKS_PROJECT);
  });

  ipcMain.on('toggleDarkMode', (event, title) => {
    // TODO not working well therefore restart
    // https://github.com/electron/electron/issues/34979
    //nativeTheme.themeSource = (nativeTheme.themeSource === 'light') ? 'dark' : 'light';
    exit('ipcMainToggleDarkMode', true);
  });

  app.on('activate', async () => {
    await openAppWindow();
    appLogger(
      'App got activate event so the app window gets opened (activate)',
      'application:event',
    );
  });
});
