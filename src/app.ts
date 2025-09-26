import express from 'express';
import TelegramBot from './bot/bot';
import { ConfigService } from './config/config.service';
import LOGGER from './utils/logger';

const app = express();
const APP_PORT: string | 3000 = new ConfigService().get('APP_PORT') || 3000;
const telegramBot: TelegramBot = new TelegramBot();

const startServer = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'production') {
      await telegramBot.startWebhook();

      app.use('/webhook', (req, res) => {
        telegramBot.bot.handleUpdate(req.body, res);
      });
    } else {
      await telegramBot.startPooling();
    }

    app.listen(APP_PORT, () => {
      LOGGER.info(`Server running on port ${APP_PORT}`);
      LOGGER.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    LOGGER.error('Failed to start server');
    process.exit(1);
  }
};

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'news-bot',
  });
});

process.on('SIGTERM', async () => {
  await telegramBot.bot.stop();

  LOGGER.info('SIGTERM received, shutting down gracefully');

  process.exit(0);
});

startServer();
