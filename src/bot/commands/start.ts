import { Context, Telegraf } from 'telegraf';
import UserService from '../../services/user/user.service';
import LOGGER from '../../utils/logger';

export default class StartCommand {
  private bot: Telegraf<Context>;

  constructor(bot: Telegraf<Context>) {
    this.bot = bot;
  }

  init(): void {
    this.bot.start(this.handleStart.bind(this));
    LOGGER.info('Start command initialized');
  }

  async handleStart(ctx: Context): Promise<void> {
    try {
      const telegramUser = ctx.from;
      const user = await new UserService().findOrCreateUser({
        username: telegramUser?.username ?? '',
        first_name: telegramUser?.first_name ?? '',
        last_name: telegramUser?.last_name ?? '',
        created_at: new Date(),
        updated_at: new Date(),
      });
      const welcomeMessage = `🤖 Salut, ${user.first_name}`;

      await ctx.reply(welcomeMessage);

      LOGGER.info('Start command processed', { userId: user.username });
    } catch (error) {
      LOGGER.error('Error in start command', { error: error });
      ctx.reply('❌ Eroare la procesarea cererii');
    }
  }
}
