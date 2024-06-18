// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "webhook" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('webhook.helloWorld', () => {
    vscode.window.terminals.forEach((t) => {
      t.processId.then((n) => {
        vscode.window.showInformationMessage("process id " + n);
      })
    })

		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from webhook!');

    getListeningPorts().then(ports => {
      ports.forEach(p => {
        vscode.window.showInformationMessage(`Listening port: ${p}`);
      })
    }).catch(error => {
      vscode.window.showInformationMessage(`Error: ${error.message}`);
    });
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

      console.log(stdout)
      // 解析标准输出，提取监听端口
      const lines = stdout.split('\n');
      const listeningPorts: number[] = [];

      lines.forEach(line => {
        const columns = line.split(/\s+/).filter(Boolean);
        console.log(columns)
        if (columns.length >= 4 && columns[3].includes('LISTEN')) {
          const port = parseInt(columns[3].split('/')[0], 10);
          listeningPorts.push(port);
        }
      });

      resolve(listeningPorts);
    });
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
