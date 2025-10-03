import axios, { AxiosResponse } from 'axios';
import { ConfigService } from '../../config/config.service';
import LOGGER from '../../utils/logger';

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
}
