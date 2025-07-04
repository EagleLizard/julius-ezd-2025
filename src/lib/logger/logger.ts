''
import pino, { Logger, LoggerOptions, StreamEntry } from 'pino';
import { LOG_DIR_PATH, LOG_FILE_EXT } from '../../constants';
import path from 'node:path';
import { juliusConfig } from '../../config';

export type EzdLogger = Logger;

/*
  There can be multiple loggers, to different destinations.
  Each type of logger should exist exactly once.
  Currently they'll be identified by file name
*/
const loggerMap: Map<string, Logger> = new Map();

const level = (juliusConfig.getEnvironment() !== 'prod')
  ? 'debug'
  : 'info'
;

export const logger = {
  init: initLogger,
} as const;

async function initLogger(logName: string): Promise<EzdLogger> {
  let logger: Logger | undefined;
  let opts: LoggerOptions;
  let streams: StreamEntry[];
  let stream: pino.MultiStreamRes;
  let logFileName: string;
  let errorLogFileName: string;
  let logFilePath: string;
  let errorLogFilePath: string;
  logger = loggerMap.get(logName);
  if(logger !== undefined) {
    return logger;
  }
  // await files.mkdirIfNotExist(LOG_DIR_PATH);
  logFileName = `${logName}.${LOG_FILE_EXT}`;
  errorLogFileName = `${logName}.error.${LOG_FILE_EXT}`;
  logFilePath = [
    LOG_DIR_PATH,
    logFileName,
  ].join(path.sep);
  errorLogFilePath = [
    LOG_DIR_PATH,
    errorLogFileName,
  ].join(path.sep);
  streams = [
    {
      stream: pino.destination(logFilePath),
    },
    {
      stream: pino.destination(errorLogFilePath),
      level: 'error',
    }
  ];
  stream = pino.multistream(streams);
  opts = {
    level,
  };
  logger = pino(opts, stream);
  loggerMap.set(logName, logger);
  return logger;
}
