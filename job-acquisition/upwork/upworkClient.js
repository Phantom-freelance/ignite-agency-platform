const axios = require('axios');
const logger = require('../utils/logger');

class UpworkClient {
  constructor() {
    this.baseURL = 'https://www.upwork.com/api/profiles/v2';
    this.apiKey = process.env.UPWORK_API_KEY;
    this.apiSecret = process.env.UPWORK_API_SECRET;
  }

  async searchJobs(query) {
    try {
      const response = await axios.get(`${this.baseURL}/search/jobs.json`, {
        params: {
          q: query,
          sort: 'recency',
          paging: '0;50'
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data.jobs.map(job => ({
        source: 'upwork',
        external_id: job.id,
        title: job.title,
        description: job.description,
        budget: job.budget,
        skills: job.skills,
        client_rating: job.client?.feedback,
        posted_at: job.date_created,
        url: job.url,
        raw_data: job
      }));
    } catch (error) {
      logger.error('Upwork API error:', error);
      return [];
    }
  }

  async fetchJobs() {
    const queries = [
      'node.js development',
      'react developer',
      'full stack developer',
      'API integration',
      'automation',
      'web scraping'
    ];

    let allJobs = [];
    for (const query of queries) {
      const jobs = await this.searchJobs(query);
      allJobs = allJobs.concat(jobs);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }

    return allJobs;
  }
}

module.exports = new UpworkClient();
