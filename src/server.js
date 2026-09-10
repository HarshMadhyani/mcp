const app = require('./app');
const { config, validateConfig } = require('./config/env');
const { initializeSheets } = require('./config/google');
const { seedDefaultAdmin } = require('./services/adminService');
const whatsappConnection = require('./whatsapp/connection');
const { initializeMessageHandler } = require('./whatsapp/messageHandler');
const { seedSampleData } = require('./utils/seedData');
const logger = require('./utils/logger');

async function start() {
  logger.info('Starting FOCA Admission Bot...');

  // Validate config
  const configValid = validateConfig();

  // Initialize Google Sheets
  if (configValid) {
    const sheetsReady = await initializeSheets();
    if (sheetsReady) {
      // Seed default admin
      await seedDefaultAdmin();

      // Seed sample data if sheets are empty
      await seedSampleData();
    }
  }

  // Start HTTP server
  const server = app.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}`);
    logger.info(`Admin Dashboard: http://localhost:${config.port}/admin/login`);
  });

  // Start WhatsApp connection
  if (configValid) {
    try {
      await whatsappConnection.connect();
      initializeMessageHandler();
    } catch (error) {
      logger.error('WhatsApp connection failed:', error.message);
      logger.info('The admin dashboard is still accessible. Configure WhatsApp from Settings.');
    }
  } else {
    logger.warn('Skipping WhatsApp connection (missing config)');
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Shutting down...');
    server.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Shutting down...');
    server.close();
    process.exit(0);
  });
}

start().catch(error => {
  logger.error('Failed to start:', error.message);
  process.exit(1);
});
