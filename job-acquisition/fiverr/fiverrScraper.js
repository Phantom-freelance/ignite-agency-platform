const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

class FiverrScraper {
  constructor() {
    this.baseURL = 'https://www.fiverr.com';
  }

  async scrapeJobRequests() {
    try {
      const response = await axios.get(`${this.baseURL}/buyers/requests`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const jobs = [];

      $('.request-card').each((i, elem) => {
        const title = $(elem).find('.request-title').text().trim();
        const description = $(elem).find('.request-description').text().trim();
        const budget = $(elem).find('.budget-amount').text().trim();
        const delivery = $(elem).find('.delivery-time').text().trim();
        const url = $(elem).find('a').attr('href');

        if (title && description) {
          jobs.push({
            source: 'fiverr',
            external_id: `fiverr_${Date.now()}_${i}`,
            title,
            description,
            budget,
            delivery_time: delivery,
            url: `${this.baseURL}${url}`,
            posted_at: new Date().toISOString()
          });
        }
      });

      return jobs;
    } catch (error) {
      logger.error('Fiverr scraping error:', error);
      return [];
    }
  }
}

module.exports = new FiverrScraper();
