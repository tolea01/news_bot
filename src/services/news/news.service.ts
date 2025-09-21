import axios, { AxiosResponse } from 'axios';
import { ConfigService } from '../../config/config.service';
import LOGGER from '../../utils/logger';

export default class NewsService {
  configService: ConfigService = new ConfigService();
  newsApiKey: string;
  baseUrl: string;

  constructor() {
    this.newsApiKey = this.configService.get('NEWS_API_KEY');
    this.baseUrl = 'https://newsapi.org/v2';
  }

  async fetchNews(category: string = 'technology', pageSize: number = 20) {
    try {
      const respose: AxiosResponse<any, any, {}> = await axios.get(
        `${this.baseUrl}/top-headlines`,
        {
          params: {
            category,
            pageSize,
            country: 'us',
            apiKey: this.newsApiKey,
          },
        },
      );

      LOGGER.info('Fetched news from NewsApi', {
        category,
        count: respose.data.articles.length,
      });

      return respose.data.articles;
    } catch (error) {
      LOGGER.error('Error fetching news from NewsAPI');
    }
  }
}
