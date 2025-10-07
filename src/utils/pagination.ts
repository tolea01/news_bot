import { Context } from 'telegraf';
import LOGGER from './logger';

export default class Pagination {
  static async sendDataOnPage(
    ctx: Context,
    data: any,
    page: number,
    pageSize: number,
  ): Promise<void> {
    try {
      const start: number = page * pageSize;
      const end: number = start + pageSize;
      const pageNews = data.slice(start, end);
      const hasPrev: boolean = page > 0;
      const hasNext: boolean = end < data.length;
      const buttons = [];

      const message = pageNews
        .map(
          (article: any, index: number) =>
            `📰 *${start + index + 1}. ${article.title}*\n${article.url}`,
        )
        .join('\n\n');

      if (hasPrev) {
        buttons.push({ text: '⬅️ Înapoi', callback_data: `prev_${page}` });
      }

      if (hasNext) {
        buttons.push({ text: '➡️ Înainte', callback_data: `next_${page}` });
      }

      await ctx.replyWithMarkdown(message, {
        reply_markup: { inline_keyboard: [buttons] },
      });
    } catch (error) {
      LOGGER.info('Error sending data to user', {
        error,
        username: ctx.from?.username,
      });
      await ctx.reply('Nu s-a putut procesa mesajul introdus, mai încercați');
    }
  }

  static async paginate(
    ctx: Context,
    dataMapObj: Map<number, any[]>,
    pageMapObj: Map<number, number>,
    pageSize: number,
  ): Promise<void> {
    const userId: number | undefined = ctx.from?.id;

    if (!userId) return;

    const data = ((await ctx.callbackQuery) as any).data;
    const dataToDisplay: any[] | undefined = dataMapObj.get(userId);
    let page: number | undefined = pageMapObj.get(userId) || 0;

    if (!dataToDisplay) {
      await ctx.answerCbQuery('❌ Nu am găsit știrile pentru această sesiune.');
      return;
    }

    if (data.startsWith('next_')) page++;
    if (data.startsWith('prev_')) page--;

    pageMapObj.set(userId, page);

    await ctx.deleteMessage();

    await this.sendDataOnPage(ctx, dataToDisplay, page, pageSize);
  }
}
