const isProduction = process.env.NODE_ENV === 'production';
const BASE_URL = isProduction ? 'https://lifelane-unfazed.onrender.com' : 'http://localhost:10000';

export const API_URL = isProduction ? BASE_URL : 'http://localhost:10000'; 