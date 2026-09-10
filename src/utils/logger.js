const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = process.env.LOG_LEVEL || 'info';

function formatTimestamp() {
  return new Date().toISOString();
}

function log(level, ...args) {
  if (LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]) {
    const prefix = `[${formatTimestamp()}] [${level.toUpperCase()}]`;
    if (level === 'error') {
      console.error(prefix, ...args);
    } else if (level === 'warn') {
      console.warn(prefix, ...args);
    } else {
      console.log(prefix, ...args);
    }
  }
}

module.exports = {
  debug: (...args) => log('debug', ...args),
  info: (...args) => log('info', ...args),
  warn: (...args) => log('warn', ...args),
  error: (...args) => log('error', ...args),
};
