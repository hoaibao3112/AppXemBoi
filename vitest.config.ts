import { defineConfig } from 'vitest/config';
import fs from 'fs';
import path from 'path';

// Đọc và parse thủ công file .env để tránh phụ thuộc gói ngoài
const envPath = path.resolve(__dirname, '.env');
const envLines = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8').split('\n') : [];
const envVars: Record<string, string> = {
  JWT_SECRET: 'mock_jwt_secret_for_coi_vo_thuong_unit_tests'
};

for (const line of envLines) {
  const cleanLine = line.trim();
  if (!cleanLine || cleanLine.startsWith('#')) continue;
  const match = cleanLine.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.substring(1, val.length - 1);
    }
    envVars[key] = val;
  }
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
  test: {
    env: envVars,
    fileParallelism: false
  }
});

