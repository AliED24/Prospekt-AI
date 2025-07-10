import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

console.log('🔗 Frontend API Configuration:');
console.log(`   Backend URL: ${backendUrl}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

export const envApi = axios.create({
    baseURL: backendUrl,
});
