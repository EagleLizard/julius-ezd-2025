
import path from 'node:path';
import pino, { DestinationStream, Logger, LoggerOptions } from 'pino';

import { files } from '../util/files';
import { LOG_DIR_PATH, LOG_FILE_EXT } from '../../constants';
import { juliusConfig } from '../../config';

export type EzdLogger = Logger;

const level = (juliusConfig.isDevEnv())
  ? 'debug'
  : 'info'
;
/*
  There can be multiple loggers, to different destinations.
  Each type of logger should exist exactly once.
  Currently they'll be identified by file name
*/
const loggerMap: Map<string, EzdLogger> = new Map();

export const ezdLog = {
  init: initLogger,
} as const;

function initLogger(logName: string): EzdLogger {
  let logStream: DestinationStream;
  let opts: LoggerOptions;
  let logger: EzdLogger | undefined;
  logger = loggerMap.get(logName);
  if(logger !== undefined) {
    return logger;
  }
  files.mkdirIfNotExist(LOG_DIR_PATH);
  let logFileName = `${logName}.${LOG_FILE_EXT}`;
  let logFilePath = [
    LOG_DIR_PATH,
    logFileName,
  ].join(path.sep);
  logStream = pino.transport({
    target: 'pino/file',
    options: {
      destination: logFilePath,
    }
  });
  opts = {
    level,
    formatters: {
      level: (label) => {
        return {
          level: label,
        };
      },
      bindings: (bindings) => {
        return {
          pid: bindings.pid,
          host: bindings.hostname,
        };
      }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  logger = pino(opts, logStream);
  loggerMap.set(logName, logger);
  return logger;
}
