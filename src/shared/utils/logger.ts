import { logger, consoleTransport } from 'react-native-logs';

const log = logger.createLogger({
  transport: consoleTransport,
  severity: __DEV__ ? 'debug' : 'warn',
  transportOptions: {
    colors: {
      info: 'cyan',
      debug: 'magenta',
      warn: 'yellow',
      error: 'red',
    },
  },
  async: true,
  dateFormat: 'time',
});

export default log;

