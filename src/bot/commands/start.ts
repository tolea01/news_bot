import { Context, Telegraf } from 'telegraf';
import { ICommand } from '../../interfaces/command.interface';
import NewsService from '../../services/news/news.service';
import UserService from '../../services/user/user.service';
import LOGGER from '../../utils/logger';

export default class StartCommand implements ICommand {
  public bot: Telegraf<Context>;

  constructor(bot: Telegraf<Context>) {
    this.bot = bot;
  }

  init(): void {
    this.bot.start(this.handleStart.bind(this));
    this.bot.on('text', this.handleText.bind(this));
    LOGGER.info('Start command initialized');
  }

  async handleText(ctx: Context) {
    try {
      const newsService: NewsService = new NewsService();
      const message: string = (ctx.message as any)?.text;
      const articles = await newsService.fetchNews(message);

      if (!message) {
        await ctx.reply('Nu s-a putut procesa mesajul introdus, mai încercați');
      }

      if (message.startsWith('/')) return;

      if (!articles || articles.length === 0) {
        await ctx.reply('❌ Nu am găsit știri pentru această căutare.');
        return;
      }

      const replyMessage = articles
        .slice(0, 5)
        .map(
          (article: any, index: number) =>
            `📰 *${index + 1}. ${article.title}*\n${article.url}`,
        )
        .join('\n\n');

      LOGGER.info(`User query message ${message}`, {
        fetchedNews: articles,
        query: message,
      });

      await ctx.replyWithMarkdown(replyMessage);
    } catch (error) {
      LOGGER.error('Error in handle text method', { error: error });
    }
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
🤖 Salut, ${user.first_name}! Bine ai venit la News Bot! 

Vreau să-ți ofer știrile care te interesează cel mai mult.

📝 *Te rog să-mi spui ce fel de știri te interesează:*

Poți să introduci:
• Un cuvânt cheie (ex: "tehnologie", "sport", "politică")
• O temă (ex: "AI", "fotbal", "educație")
• O categorie generală

*Exemple:* tehnologie, bitcoin, fotbal, sănătate, educație
      `.trim();

      await ctx.replyWithMarkdown(welcomeMessage);

      LOGGER.info('Start command processed', { user: user.username });
    } catch (error) {
      LOGGER.error('Error in start command', { error: error });
      ctx.reply('❌ Eroare la procesarea cererii');
    }
  }
}
