const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');
const EventEmitter = require('events');
const logger = require('../utils/logger');
const QRCode = require('qrcode');

const AUTH_DIR = path.join(__dirname, '..', '..', 'whatsapp_auth');

class WhatsAppConnection extends EventEmitter {
  constructor() {
    super();
    this.sock = null;
    this.status = 'DISCONNECTED'; // DISCONNECTED, QR_READY, CONNECTING, CONNECTED
    this.qrCode = null;
    this.qrDataUrl = null;
    this.retryCount = 0;
    this.maxRetries = 5;
  }

  async connect() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      const { version } = await fetchLatestBaileysVersion();

      this.sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: require('pino')({ level: 'silent' }),
        browser: ['FOCA Admission Bot', 'Chrome', '1.0.0'],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 30000,
        emitOwnEvents: false,
        fireInitQueries: true,
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
        markOnlineOnConnect: true,
      });

      // Connection update handler
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.status = 'QR_READY';
          this.qrCode = qr;
          try {
            this.qrDataUrl = await QRCode.toDataURL(qr);
          } catch (e) {
            logger.error('QR code generation failed:', e.message);
          }
          this.emit('qr', qr);
          logger.info('QR Code generated. Scan with WhatsApp.');
        }

        if (connection === 'close') {
          this.status = 'DISCONNECTED';
          this.qrCode = null;
          this.qrDataUrl = null;

          const statusCode = (lastDisconnect?.error instanceof Boom)
            ? lastDisconnect.error.output?.statusCode
            : null;

          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          if (shouldReconnect && this.retryCount < this.maxRetries) {
            this.retryCount++;
            logger.info(`Reconnecting... attempt ${this.retryCount}/${this.maxRetries}`);
            setTimeout(() => this.connect(), 3000);
          } else if (statusCode === DisconnectReason.loggedOut) {
            logger.warn('WhatsApp logged out. Delete whatsapp_auth folder and restart to re-authenticate.');
            this.emit('logged_out');
          } else {
            logger.error('Max reconnection attempts reached');
            this.emit('max_retries');
          }
        }

        if (connection === 'open') {
          this.status = 'CONNECTED';
          this.retryCount = 0;
          this.qrCode = null;
          logger.info('WhatsApp connected successfully!');
          this.emit('connected');
        }

        if (connection === 'connecting') {
          this.status = 'CONNECTING';
          this.emit('connecting');
        }
      });

      // Save credentials on update
      this.sock.ev.on('creds.update', saveCreds);

      // Message handler
      this.sock.ev.on('messages.upsert', (m) => {
        this.emit('message', m);
      });

      return this.sock;
    } catch (error) {
      logger.error('WhatsApp connection error:', error.message);
      this.status = 'DISCONNECTED';
      throw error;
    }
  }

  async sendMessage(jid, text) {
    if (!this.sock || this.status !== 'CONNECTED') {
      logger.warn('Cannot send message: WhatsApp not connected');
      return null;
    }
    try {
      return await this.sock.sendMessage(jid, { text });
    } catch (error) {
      logger.error('Failed to send message:', error.message);
      return null;
    }
  }

  getStatus() {
    return this.status;
  }

  getQRDataUrl() {
    return this.qrDataUrl;
  }

  async logout() {
    if (this.sock) {
      await this.sock.logout();
      this.status = 'DISCONNECTED';
    }
  }
}

// Singleton
const whatsappConnection = new WhatsAppConnection();

module.exports = whatsappConnection;
