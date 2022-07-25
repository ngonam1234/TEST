import dotenv from 'dotenv'
dotenv.config();
export const POOL = {
    min: process.env.MIN_CONECTION_POOL || 0,
    acquire: process.env.ACQUIRE_CONECTION_POOL || 30000,
    idle: process.env.IDLE_CONECTION_POOL || 10000
};