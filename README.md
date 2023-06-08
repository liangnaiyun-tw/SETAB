# SETAB

## Chrome Requirements
To access the API provided by Chrome in the Dev channel, you must have the Chrome Dev version installed to use this application.

## Environment Configuration
Currently, the application need to install by user on their computers.
It is necessary to install **Node.js** with a version of `18.16.0` or higher.

## Upload to Chrome Extension
1. Clone the repository on your local machine.
2. Run the command `npm install –legacy-peer-deps`.
3. Run the command `npm run build`, it should create a `build` folder in the project's root directory.
4. Open Chrome and navigate to extension management page.
5. In the page, enable **Developer Mode**.
6. Select **Load upacked** button, and choose the `build` folder.
7. Open the SETAB extension on another page, and you will see a page displayed.
