import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

export const config = {
  // Qwen API Configuration
  qwen: {
    apiKey: process.env.QWEN_API_KEY || '',
    model: process.env.QWEN_MODEL || 'qwen-max',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
  },
  
  // Embedding Configuration (reserved for V2)
  embedding: {
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  },
  
  // Mem0 Configuration
  mem0: {
    apiKey: process.env.MEM0_API_KEY || '',
  },
  
  // ChromaDB Configuration (reserved for V2)
  chroma: {
    path: process.env.CHROMA_DB_PATH || './chroma_db',
  },
  
  // Application Settings
  app: {
    maxContextLength: parseInt(process.env.MAX_CONTEXT_LENGTH) || 4000,
    compressionRatio: parseFloat(process.env.COMPRESSION_RATIO) || 0.3,
    preserveKeyInfo: process.env.PRESERVE_KEY_INFO === 'true',
  },
};

export default config;
