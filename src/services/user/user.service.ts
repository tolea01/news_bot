import PRISMA from '../../db/db.config';
import LOGGER from '../../utils/logger';
import { NewsReadDto } from '../news/news.dto';
import { TelegramUserDto } from './user.dto';

export default class UserService {
  async findOrCreateUser(
    telegramUser: TelegramUserDto,
  ): Promise<TelegramUserDto> {
    try {
      const user = await PRISMA.user.upsert({
        where: { username: telegramUser.username },
        update: {
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
        },
        create: {
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
        },
      });

      LOGGER.info('User processed successfully', { userId: user.id });

      return user;
    } catch (error) {
      LOGGER.error('Failed to process user', { error });

      throw error;
    }
  }

  async markNewsAsRead(newsReadDto: NewsReadDto): Promise<NewsReadDto> {
    try {
      const { userId, newsId } = newsReadDto;
      const newsRead = await PRISMA.newsRead.create({
        data: {
          userId,
          newsId,
          read_at: new Date(),
        },
      });

      LOGGER.info('News marked as read', { userId, newsId });

      return newsRead;
    } catch (error) {
      LOGGER.error('Error marked news as read', { error });

      throw error;
    }
  }
}
