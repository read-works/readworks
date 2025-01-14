# ReadWorks CE Server

**License**: LGPL-3.0-or-later

## Description

ReadWorks-CE is the core application for [ReadWorks.app](https://readworks.app).
This repository contains the source code and build scripts for developers working with or contributing to the
application.

## Prerequisites

### macOS

On macOS, the Electron app requires `poppler` to be installed on the host device for PDF processing. You can easily
install `poppler` using [Homebrew](https://brew.sh/), a popular package manager for macOS.

### Steps to Install:

1. If you don’t have Homebrew installed, visit the [Homebrew website](https://brew.sh/) for installation instructions.

2. Once Homebrew is installed, open your terminal and run the following command to install `poppler`:
   ```bash
   brew install poppler

## Start Development

The ReadWorks backend is an express application that need to be configured via environment variables prior to it's first
start. Copy `env.example.env` file to `.env` and start editing it's content.

**env.example.json**

```text
PORT=8080
DB=database.sqlite
POPPLER_DIR=/opt/homebrew/bin
EXPORT_FORMAT=jpg
EXPORT_JPEG_QUALITY=90
SQL_LOGGING=false
```

Once everything is prepared, you can start backend development by running the following commands in your terminal:

```bash
cd backend
npm run develop
```

---

## Scripts

Below is a list of available npm scripts and their purposes:

- **`develop`**: Runs the backend in watch mode using `nodemon`.
- **`build`**: Runs the backend and Electron builds sequentially.
- **`backend`**: Bundles the `server.ts` file for Node.js using `esbuild`.
- **`electron`**: Bundles the `electron.js` file for Node.js using `esbuild`.
- **`postbuild`**: Executes post-build tasks defined in `postbuild.ts`.
- **`clean:soft`**: Removes generated files such as `store`, `import`, `dist`, and SQLite files.
- **`clean:deps`**: Deletes `node_modules`.
- **`clean`**: Runs both `clean:soft` and `clean:deps`.
- **`pack`**: Prepares a packaged build of the application using `electron-builder`.
- **`dist`**: Generates a distributable build of the application using `electron-builder`.

---

## Debugging

### macOS

On macOS, the Readworks working directory is located at:  
`~/Library/Application\ Support/readworks/`.

### Windows

On Windows, the Readworks working directory is located at:  
`%HOMEPATH%\AppData\Roaming\readworks`.

### Logging in Development and Production

In the built app, all `console.log` calls are removed, so they won't appear after development mode. However, to retain
logging functionality, an `appLogger` is provided. It behaves like `console.log` in development mode and can also be
accessed in Electron test or production modes.

To enable logging in the Electron app (both debug and production modes), a flag can be set by creating a file named
`.trace` `touch .trace` in the App data folder. Once this file exists (a restart is not required), all logs written
through `appLogger`will be stored.

The logged output will be written to a file named `session.log`. You can monitor the log in real-time using commands
like:

```bash
tail -f session.log
```

## Authors

- **Bernhard Behrendt** - [Email](mailto:bernhard@readworks.app)
- **Dominik Kloke** - [Email](mailto:dominik@readworks.app)

---

## Homepage

Visit the official homepage: [ReadWorks.app](https://readworks.app)

---

For more information, refer to the source code or contact the authors directly.
