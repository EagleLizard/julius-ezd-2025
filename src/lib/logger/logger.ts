
import pino, { destination, DestinationStream, Logger, LoggerOptions, MultiStreamOptions, StreamEntry } from 'pino';
import { APP_LOGGER_NAME, LOG_DIR_PATH, LOG_FILE_EXT } from '../../constants';
import path from 'node:path';
import { juliusConfig } from '../../config';
import { files } from '../util/files';

const level = (juliusConfig.isDevEnv())
  ? 'debug'
  : 'info'
;

/*
  Base application logger for general purpose.
_*/
export const logger = initLogger();

function initLogger(): Logger {
  let logger: Logger;
  let opts: LoggerOptions;
  let streams: StreamEntry[];
  let stream: pino.MultiStreamRes;
  let logFileName: string;
  let errorLogFileName: string;
  let logFilePath: string;
  let errorLogFilePath: string;
  let logStream: DestinationStream;
  let errorLogStream: DestinationStream;

  files.mkdirIfNotExist(LOG_DIR_PATH);

  logFileName = `${APP_LOGGER_NAME}.${LOG_FILE_EXT}`;
  errorLogFileName = `${APP_LOGGER_NAME}.error.${LOG_FILE_EXT}`;
  logFilePath = [
    LOG_DIR_PATH,
    logFileName,
  ].join(path.sep);
  errorLogFilePath = [
    LOG_DIR_PATH,
    errorLogFileName,
  ].join(path.sep);
  logStream = pino.transport({
    target: 'pino/file',
    options: {
      destination: logFilePath,
    },
  });
  errorLogStream = pino.transport({
    target: 'pino/file',
    options: {
      destination: errorLogFilePath,
    },
  });
  streams = [
    { level: 'error', stream: errorLogStream },
    { level: level, stream: logStream },
    { level: level, stream: process.stdout },
  ];
  let multistreamOpts: MultiStreamOptions;
  multistreamOpts = {
    // dedupe: true // send logs only to the stream with the higher level
  };
  stream = pino.multistream(streams, multistreamOpts);
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
  logger = pino(opts, stream);
  return logger;
}
