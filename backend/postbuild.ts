import {copySync} from 'fs-extra';
import * as os from 'os';
import {readFileSync, writeFileSync} from "fs";

const copyClient = () => {
    copySync(__dirname + '/public', __dirname + '/dist/public');
};

const copyLangData = () => {
    copySync(__dirname + '/extlib/lang-data/', __dirname + '/dist/lang-data');
};

const copyLwmData = () => {
    copySync(__dirname + '/extlib/lwm/', __dirname + '/dist/lwm');
};

const copyPoppler = () => {
    const platform = os.platform();

    if (platform === 'darwin') {
        let binPathForArch = '';

        if ((process.env.TARGET_ARCH || '').includes('arm64')) {
            binPathForArch = 'arm';
        }

        if ((process.env.TARGET_ARCH || '').includes('x64')) {
            binPathForArch = 'x64';
        }

        copySync(`${__dirname}/extlib/poppler/darwin/${binPathForArch}`, `${__dirname}/dist/poppler`);
    } else if (platform == 'win32') {
        copySync(`${__dirname}/extlib/poppler/win32/Library/bin/`, `${__dirname}/dist/poppler/bin`);
    } else {
        console.log(`Poppler wasn't copied for ${platform}. Native installation required`);
    }
};

const copyEnv = () => {
    let envFile: string = '';

    const platform = os.platform();

    switch (platform) {
        case 'darwin':
            envFile = 'env.production.mac.env';
            break;
        case 'win32':
            envFile = 'env.production.windows.env';
            break;
        case 'linux':
            envFile = 'env.production.linux.env';
            break;
    }

    copySync(__dirname + '/' + envFile, __dirname + '/dist/.env');
};

const copyFilesForDarwinImage = () => {
    copySync(__dirname + '/icon.png', __dirname + '/dist/icon.png');
    copySync(__dirname + '/dmg-background.tiff', __dirname + '/dist/dmg-background.tiff');
    copySync(__dirname + '/rwx.icns', __dirname + '/dist/rwx.icns');
    copySync(
        __dirname + '/entitlements.mac.inherit.plist',
        __dirname + '/dist/entitlements.mac.inherit.plist',
    );
};

const copyFilesForWindowsInstaller = () => {
    copySync(__dirname + '/installerIcon.ico', __dirname + '/dist/installerIcon.ico');
    copySync(__dirname + '/rwx.ico', __dirname + '/dist/rwx.ico');
};

const createProdDependencies = () => {
    const packageDefinition = JSON.parse(readFileSync(__dirname + '/package.json', 'utf-8'));

    const devDependencies = {
        electron: packageDefinition['devDependencies']['electron'],
        'electron-builder': packageDefinition['devDependencies']['electron-builder'],
        'electron-packager': packageDefinition['devDependencies']['electron-packager'],
    };

    delete packageDefinition['devDependencies'];
    delete packageDefinition['scripts']['build'];
    delete packageDefinition['scripts']['develop'];
    delete packageDefinition['scripts']['test'];
    delete packageDefinition['scripts']['clean:soft'];
    delete packageDefinition['scripts']['clean:deps'];
    delete packageDefinition['scripts']['clean'];
    delete packageDefinition['scripts']['postbuild'];

    packageDefinition['main'] = 'main.js';
    packageDefinition['devDependencies'] = devDependencies;
    packageDefinition['scripts']['start'] = 'electron .';

    packageDefinition['build']['mac']['target']['arch'] = [process.env.TARGET_ARCH || 'arm64'];

    writeFileSync(
        __dirname + '/dist/package.json',
        JSON.stringify(packageDefinition, null, '\t'),
        'utf-8',
    );
};

const setVersion = () => {
    const packageDefinition = JSON.parse(readFileSync(__dirname + '/dist/package.json', 'utf-8'));
    // ESBUILD STUFF
    const migrationControllerFile = __dirname + '/dist/server.js';
    // OLD WAY
    //const migrationControllerFile = __dirname + '/dist/controller/MigrationController.js';
    const migrationControllerFileContent = readFileSync(migrationControllerFile, 'utf-8');
    writeFileSync(
        migrationControllerFile,
        migrationControllerFileContent.replace('MAJOR.MINOR.HOTFIX', packageDefinition.version),
    );

    // ESBUILD STUFF
    const electronFile = __dirname + '/dist/main.js';
    const electronFileContent = readFileSync(electronFile, 'utf-8');
    writeFileSync(
        electronFile,
        electronFileContent.replace('MAJOR.MINOR.HOTFIX', packageDefinition.version),
    );
};

(() => {
    copyClient();
    copyPoppler();
    copyLangData();
    copyLwmData();
    copyEnv();
    copyFilesForWindowsInstaller();
    copyFilesForDarwinImage();
    createProdDependencies();
    setVersion();
})();
