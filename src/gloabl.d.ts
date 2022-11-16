import { IpcRenderer } from 'electron';

declare global {
    interface Window {
        electronAPI: any;
    }
}

export const { ipcRenderer } = window;