#!/usr/bin/env node
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { spawn, type ChildProcess } from 'node:child_process';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HELP = `Miura Architect

Usage:
  miura-architect dev [-- <app-command>]
  miura-architect server

Commands:
  dev      Starts the Architect bridge server, serves the Architect UI, and optionally runs your app dev server.
  server   Starts only the websocket bridge server.

Examples:
  miura-architect dev -- vite
  miura-architect dev -- npm run dev:app
`;

const command = process.argv[2] ?? 'dev';

if (command === '--help' || command === '-h' || command === 'help') {
  console.log(HELP);
} else if (command === 'server') {
  await import('./server.js');
} else if (command === 'dev') {
  await import('./server.js');
  serveArchitectUi();
  runAppCommand(process.argv.slice(3));
} else {
  console.error(`Unknown command "${command}".\n\n${HELP}`);
  process.exit(1);
}

function serveArchitectUi(port = Number(process.env.MIURA_ARCHITECT_PORT ?? 3005)): void {
  const distDir = resolve(fileURLToPath(new URL('./', import.meta.url)));

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const requestedPath = decodeURIComponent(url.pathname);
    const normalizedPath = requestedPath === '/' ? '/index.html' : requestedPath;
    const filePath = safeJoin(distDir, normalizedPath);
    const target = existsSync(filePath) && statSync(filePath).isFile()
      ? filePath
      : join(distDir, 'index.html');

    const stream = createReadStream(target);
    stream.on('error', (error) => {
      res.statusCode = 500;
      res.end(String(error));
    });
    res.setHeader('Content-Type', contentType(target));
    stream.pipe(res);
  });

  server.listen(port, () => {
    console.log(`[miura-architect] ui listening on http://localhost:${port}`);
  });
}

function runAppCommand(args: string[]): void {
  const separatorIndex = args.indexOf('--');
  const commandArgs = separatorIndex >= 0 ? args.slice(separatorIndex + 1) : args;
  if (commandArgs.length === 0) return;

  const child = spawn(commandArgs[0], commandArgs.slice(1), {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

  const stop = (signal: NodeJS.Signals) => {
    stopChild(child, signal);
    process.exit(signal === 'SIGINT' ? 130 : 143);
  };

  process.once('SIGINT', () => stop('SIGINT'));
  process.once('SIGTERM', () => stop('SIGTERM'));

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

function stopChild(child: ChildProcess, signal: NodeJS.Signals): void {
  if (!child.killed) {
    child.kill(signal);
  }
}

function safeJoin(root: string, path: string): string {
  const resolved = resolve(root, `.${path}`);
  return resolved.startsWith(root) ? resolved : join(root, 'index.html');
}

function contentType(path: string): string {
  switch (extname(path)) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.ico':
      return 'image/x-icon';
    case '.woff2':
      return 'font/woff2';
    default:
      return 'application/octet-stream';
  }
}
