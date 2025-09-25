import { Context, Telegraf } from 'telegraf';
import { ConfigService } from '../config/config.service';
import LOGGER from '../utils/logger';
import StartCommand from './commands/start';

export default class TelegramBot {
  private bot: Telegraf<Context>;
  configService: ConfigService = new ConfigService();
  TelegramBotToken: string = this.configService.get('BOT_API_KEY');

  constructor() {
    this.bot = new Telegraf(this.TelegramBotToken);
  }

  setupErrorHandling() {
    this.bot.catch((error, ctx) => {
      LOGGER.error('Telegram bot error');

      if (ctx.message) {
        ctx.reply('Eroare, încearcă mai târziu');
      }
    });
  }

  loadCommands() {
    const startCommand = new StartCommand(this.bot);
    startCommand.init();

    LOGGER.info('All comand loaded succesufuly');
  }

  async startWebhook() {
    this.loadCommands();

    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));

    await this.bot.launch({
      webhook: {
        domain: this.configService.get('WEBHOOK_URL'),
        port: Number(this.configService.get('APP_PORT') || 3000),
      },
    });

    LOGGER.info('Telegram bot started in webhook mode');
  }

  async startPooling() {
    this.loadCommands();

    await this.bot.launch();

    LOGGER.info('Telegram bot started in pooling mode');
  }
}
