import axios, { AxiosResponse } from 'axios';
import { ConfigService } from '../../config/config.service';
import PRISMA from '../../db/db.config';
import LOGGER from '../../utils/logger';
import { NewsDto } from './news.dto';

export default class NewsService {
  private configService: ConfigService = new ConfigService();
  private newsApiKey: string;
  private baseUrl: string;

  constructor() {
    this.newsApiKey = this.configService.get('NEWS_API_KEY');
    this.baseUrl = 'https://newsapi.org/v2';
  }

  async fetchNews(query: string) {
    try {
      const respose: AxiosResponse<any, any, {}> = await axios.get(
        `${this.baseUrl}/everything`,
        {
          params: {
            q: query,
            language: 'ro',
            apiKey: this.newsApiKey,
          },
        },
      );

      LOGGER.info('Fetched news from NewsApi', {
        query,
        count: respose.data.articles.length,
      });

      return respose.data.articles;
    } catch (error) {
      LOGGER.error('Error fetching news from NewsAPI', { error: error });
    }
  }

  async uploadNewsToDb(articles: NewsDto[]) {
    try {
      const formatedArticles = articles.map((article) => ({
        title: article.title,
        content: article.content,
        description: article.description,
        author: article.author,
      }));

      const news = await PRISMA.news.createMany({
        data: formatedArticles,
        skipDuplicates: true,
      });

      return news;
    } catch (error) {
      LOGGER.error('Failed to process news', { error });

      throw error;
    }
  }

  async getAllNews() {
    return PRISMA.news.findMany();
  }
}
