import axios from "axios";

export const envApi = axios.create({
    baseURL: process.env.BACKEND_URL || 'http://localhost:8080',
});
