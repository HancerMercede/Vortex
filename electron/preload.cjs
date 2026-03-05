const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  httpRequest: (options) => ipcRenderer.invoke('http-request', options),
});
