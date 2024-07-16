import { app } from 'electron';
import { makeAppWithSingleInstanceLock } from './factories';
import { Application } from './app';

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // On certificate error we disable default behaviour (stop loading the page)
  // and we then say "it is all fine - true" to the callback
  event.preventDefault();
  callback(true);
});
app.commandLine.appendSwitch('ignore-certificate-errors');

makeAppWithSingleInstanceLock(async () => {
  const hicApp = new Application(app, {});
  await hicApp.init();
});
