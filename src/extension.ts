// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';

interface Expose {
  port: number;
  link: string;
}

const exposePorts = new Map();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "webhook" is now active!');

  const interval = vscode.workspace.getConfiguration().get('webhook.interval', 2000)
  setInterval(() => {
    getListeningPorts().then(ports => {
      const api = vscode.workspace.getConfiguration().get('webhook.address', '')

      if (api && api !== "") {
        fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ports: ports
          })
        }).then( response => response.json()).then(data => data as Expose[]).then( data => {
          let newPorts = [] as Array<number>
          data.forEach((p: Expose) => {
            newPorts.push(p.port)
            if (!exposePorts.has(p.port)) {
              const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
              statusBar.text = `${p.port}`
              statusBar.tooltip = `${p.link}`
              statusBar.command = {
                command: 'webhook.openLink',
                title: 'Open Link',
                arguments: [statusBar]
              }
              statusBar.show()

              context.subscriptions.push(statusBar)
              exposePorts.set(p.port, statusBar)
            }
          })

          exposePorts.forEach((port, statusBar) => {
            if (!newPorts.includes(port)) {
              exposePorts.delete(port)
              statusBar.dispose()
            }
          });
        })
      } else {
        console.log(`skip to notify the listen ports`);
      }

      ports.forEach(p => {
        console.log(`get listen port: ${p}`);
      })
    }).catch(error => {
      vscode.window.showInformationMessage(`Error: ${error.message}`);
    });
  }, interval)

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('webhook.openLink', (item) => {
    vscode.env.openExternal(vscode.Uri.parse(`http://${item.tooltip}`))
	});

	context.subscriptions.push(disposable);
}

async function getListeningPorts(): Promise<number[]> {
  return new Promise((resolve, reject) => {
    exec('netstat -tulnp', (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`Error: ${err.message}`));
        return;
      }

      if (stderr) {
        reject(new Error(`Stderr: ${stderr}`));
        return;
      }

      const lines = stdout.split('\n');
      const listeningPorts: number[] = [];

      lines.forEach((line) => {
        const columns = line.split(/\s+/);
        if (columns.length >= 7 && columns[5].includes('LISTEN')) {
          const ip = columns[3].split(':')
          const port = parseInt(ip[ip.length-1], 10);
          listeningPorts.push(port);
        }
      });

      resolve(listeningPorts);
    });
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
