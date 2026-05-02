import { createClient } from 'redis';

class RedisManager {
  constructor() {
    // Connects to local Redis by default, or your production URL
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    // Centralized error handling
    this.client.on('error', (err) => console.error('❌ Redis Error:', err));
    this.client.on('connect', () => console.log('✅ Redis Connected'));
    this.client.on('reconnecting', () => console.log('🔄 Redis Reconnecting...'));
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  // Helper to safely disconnect when shutting down the server
  async disconnect() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}

// Export a singleton instance
export const redisManager = new RedisManager();

// Export the raw client for easy usage in your controllers
export default redisManager.client;