import * as process from 'node:process';
import * as path from 'node:path';

import { FileLogger } from './utils/logger';
import {
  type baseMessageT,
  checkValidStdMessage,
  decodeMessage,
  encodeMessage,
} from './rpc';


// Initialize the process
process.stdin.setEncoding('utf8');
process.stdin.resume();

const globalLogger = new FileLogger(
  path.join(process.cwd(), 'taskfile-language-server.log')
);

globalLogger.write('LSP has been started...');

process.stdin.on('data', (data) => {
  const out = checkValidStdMessage(data);

  const { ok, value } = decodeMessage(data);

  if (!ok) {
    globalLogger.write('Got an error during decoding...');
    globalLogger.write(data.toString());
    return;
  }

  if (out.ok) {
    handleStdMessage(value.request, value.content, globalLogger);
  }
});
process.stdin.on('end', () => { }); // Do nothing when the stream ends


function handleStdMessage(
  baseMessage: baseMessageT,
  content: string,
  logger: FileLogger,
) {
  logger.write('Received message with method: ' + baseMessage.method);
}
