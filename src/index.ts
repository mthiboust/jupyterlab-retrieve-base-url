import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { PageConfig } from '@jupyterlab/coreutils';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

import { KernelMessage, Kernel } from '@jupyterlab/services';

import { IConsoleTracker } from '@jupyterlab/console';


import '../style/index.css';


interface DashMessageData {
  type: string;
  port: string;
  url: string;
}

function activate(
  app: JupyterFrontEnd,
  restorer: ILayoutRestorer,
  notebooks: INotebookTracker,
  consoles: IConsoleTracker
) {

  // Watch notebook creation
  notebooks.widgetAdded.connect((sender, nbPanel: NotebookPanel) => {
    // const session = nbPanel.session;
    const sessionContext = nbPanel.sessionContext;
    sessionContext.ready.then(() => {
      const session = sessionContext.session;
      if (session?.kernel) {
        let kernel = session.kernel;
        registerCommTarget(kernel, app);
      }
    })
  });

  // Watch console creation
  consoles.widgetAdded.connect((sender, consolePanel) => {
    const sessionContext = consolePanel.sessionContext;
    sessionContext.ready.then(() => {
      const session = sessionContext.session;
      if (session?.kernel) {
        let kernel = session.kernel;
        registerCommTarget(kernel, app);
      }
    })
  });
}

function registerCommTarget(
  kernel: Kernel.IKernelConnection,
  app: JupyterFrontEnd
) {
  kernel.registerCommTarget(
    'retrieve_base_url',
    (comm: Kernel.IComm, msg: KernelMessage.ICommOpenMsg) => {
      comm.onMsg = (msg: KernelMessage.ICommMsgMsg) => {
        let msgData = (msg.content.data as unknown) as DashMessageData;
        if (msgData.type === 'base_url_request') {

          // Build server url and base subpath.
          const baseUrl = PageConfig.getBaseUrl();
          const baseSubpath = PageConfig.getOption('baseUrl');
          const n = baseUrl.lastIndexOf(baseSubpath)
          const serverUrl = baseUrl.slice(0, n)
          comm.send({
            type: 'base_url_response',
            server_url: serverUrl,
            base_subpath: baseSubpath,
            frontend: "jupyterlab",
          });
        }
      };
    }
  );
}

/**
 * Initialization data for the jupyterlab-dash extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'retrieve_base_url',
  autoStart: true,
  requires: [ILayoutRestorer, INotebookTracker, IConsoleTracker],
  activate: activate
};

export default extension;