# ReadWorks Community Edition (CE)

![header image](https://cdn.readworks.app/social/og-image.jpg?2)


> This is the ReadWorks repository for developers. If you're looking to [download](https://readworks.app) and use the
> app, please visit our website www.readworks.app for signed builds available for most operating systems.



[ReadWorks](https://readworks.app) (Community Edition) is an evolution of a project originally founded by Bernhard
Behrendt and Dominik Kloke.

The project was created to assist professionals in the legal tech field by streamlining research processes, especially
when dealing with large volumes of unstructured documents, such as scans and PDFs.

As the software grew, much of the feedback highlighted its value across various other fields and professions requiring
intensive reading and analysis, including science, journalism, and other research-driven areas.

Inspired by this broader potential, we decided to release a Community Edition (CE) of ReadWorks, which incorporates its
basic working principles, opening it to a wider audience, including students and tech enthusiasts.

This edition uses Poppler and XPDF as its rendering engines, providing robust PDF processing capabilities.
ReadWorks enables users to extract meaningful insights from their documents and folders while offering a visually
engaging
approach to research.

We’re excited to hear from the community about potential directions for future development, especially as offline AI
capabilities begin to make their way into the product 🥳.

## Prerequisites

### Linux

### macOS

The Electron app requires the `poppler` dependency for processing PDF files. Poppler is a PDF rendering library that
provides various utilities for working with PDF documents. On macOS, you can easily install it using Homebrew, a popular
package manager for macOS.

If you encounter an error indicating that `poppler` is missing, you can resolve the issue by installing it via Homebrew.

### Steps to Install:

1. If you don't have Homebrew installed, you can learn how to install it by visiting
   the [Homebrew website](https://brew.sh/).

2. Once Homebrew is installed, run the following command in your terminal to install `poppler`:
   ```bash
   brew install poppler
   ```

### Windows

For the app to run properly on Windows, it requires the `MSVCP140.DLL` file, which is part of the Microsoft
Visual C++ 2015 Redistributable package. It's mostly preinstalled but in case of fatal startup errors it's mostly
related to a missing installation. This dynamic link library (DLL) is necessary for certain runtime components
that the app depends on to function correctly, including essential standard C++ libraries.

If you encounter an error indicating that `MSVCP140.DLL` is missing, you can resolve the issue by installing the
required redistributable package. The easiest way to install it is by downloading
the [Microsoft Visual C++ 2015 Redistributable Update 3](https://www.microsoft.com/de-de/download/details.aspx?id=53840)
package directly from Microsoft's official website.

### Steps to Install:

1. Go to the [download page](https://www.microsoft.com/de-de/download/details.aspx?id=53840).
2. Choose the version of the package that matches your system architecture (x86 for 32-bit or x64 for 64-bit).
3. Download and run the installer.
4. Restart your system (if needed).

Once the installation is complete, the `MSVCP140.DLL` file will be available, and the app should run without further
issues.

## Start Development

To prepare all necessary files for development, we recommend running a complete end-to-end build process. This ensures
that all required artifacts are correctly placed. If any prerequisites are missing, the build will fail, providing an
output log to help you diagnose and resolve the issue.

During the build process, the following steps will be executed:

- Install dependencies
- Build
- Prepare the app (post-build step)
- Create the Electron app

### Run the Build

To achieve this, simply run the following command depending on your operating system:

- **For Mac**:

```bash 
npm run make:clean && npm run compile:mac
```

- **For Windows**:

```bash
npm run make:clean && npm run compile:windows
```

### Backend

The ReadWorks backend is an express application. For more detailed information, refer to its
respective [README.md](https://github.com/read-works/readworks/blob/main/backend/README.md) file.

> **Note:** You must setup an `./backend/.env` file to enable backend development on your local machine. You can use
`env.example.env` and modify it so that it suits your development environment.

Once everything is prepared, you can start backend development by running the following commands in your terminal:

```bash
cd backend
npm run develop
```






