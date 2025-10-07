import { Context, Telegraf } from 'telegraf';
import { ICommand } from '../../interfaces/command.interface';
import NewsService from '../../services/news/news.service';
import UserService from '../../services/user/user.service';
import LOGGER from '../../utils/logger';
import Pagination from '../../utils/pagination';

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
    this.bot.on('text', this.handleText.bind(this));
    this.bot.on('callback_query', this.handlePagination.bind(this));
    LOGGER.info('Start command initialized');
  }

  async sendNewsPage(ctx: Context, news: any, page: number) {
    await Pagination.sendDataOnPage(ctx, news, page, this.PAGE_SIZE);
  }

  async handlePagination(ctx: Context) {
    try {
      await Pagination.paginate(
        ctx,
        this.userNews,
        this.userPages,
        this.PAGE_SIZE,
      );
    } catch (error) {
      LOGGER.info('handle pagination error', { error });
    }
  }

  async handleText(ctx: Context) {
    try {
      const newsService: NewsService = new NewsService();
      const message: string = (ctx.message as any)?.text;
      const newsFromAPI = await newsService.fetchNews(message);
      const newsFromDb = await newsService.getAllNews();
      const existingNewsTitles: string[] = newsFromDb.map(
        (article) => article.title,
      );

      if (!message) {
        await ctx.reply('Nu s-a putut procesa mesajul introdus, mai încercați');
        return;
      }

      if (message.startsWith('/')) return;

      if (!newsFromAPI || newsFromAPI.length === 0) {
        await ctx.reply('❌ Nu am găsit știri pentru această căutare.');
        return;
      }

      const reply = newsFromAPI.filter(
        (article: any) => !existingNewsTitles.includes(article.title),
      );

      if (reply.length == 0) {
        await ctx.reply(
          '✅ Toate știrile pe această temă există deja în baza de date.',
        );
        return;
      }

      LOGGER.info(`User query message ${message}`, {
        fetchedNews: newsFromAPI,
        query: message,
      });

      await newsService.uploadNewsToDb(reply);

      LOGGER.info('News upload successfuly to db');

      const userId: number | undefined = ctx.from?.id;

      if (!userId) return;

      this.userNews.set(userId, reply);
      this.userPages.set(userId, 0);

      await this.sendNewsPage(ctx, reply, 0);
    } catch (error) {
      LOGGER.error('Error in handle text method', { error });
      await ctx.reply('❌ A apărut o eroare la prelucrarea cererii.');
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
