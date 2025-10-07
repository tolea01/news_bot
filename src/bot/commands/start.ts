import { Context, Markup, Telegraf } from 'telegraf';
import { ICommand } from '../../interfaces/command.interface';
import UserService from '../../services/user/user.service';
import LOGGER from '../../utils/logger';

export default class StartCommand implements ICommand {
  public bot: Telegraf<Context>;
  protected PAGE_SIZE = 3;
  protected userNews = new Map<number, any[]>();
  protected userPages = new Map<number, number>();

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

      if (!telegramUser) {
        await ctx.reply('❌ Nu s-au putut prelua datele utilizatorului.');
        return;
      }

      const user = await new UserService().findOrCreateUser({
        username: telegramUser?.username ?? '',
        first_name: telegramUser?.first_name ?? '',
        last_name: telegramUser?.last_name ?? '',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const welcomeMessage = `
🤖 Salut, ${user.first_name}! Bine ai venit la News Bot!`.trim();

      await ctx.replyWithMarkdown(
        welcomeMessage,
        Markup.inlineKeyboard([
          [Markup.button.callback('🔍 Caută știri', 'search_news')],
          [Markup.button.callback('📖 Știri citite', 'read_news')],
        ]),
      );

      LOGGER.info('Start command processed', { user: user.username });
    } catch (error) {
      LOGGER.error('Error in start command', { error: error });
      ctx.reply('❌ Eroare la procesarea cererii');
    }
  }
}
