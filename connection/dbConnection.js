import { createPool } from "mysql";
import { POOL} from "../config/config.js";
import myLogger from "../winstonLog/winston.js";
import dotenv from 'dotenv';
dotenv.config();
let configDB = {
    host: process.env.HOST,
    user: process.env.USER_DB,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    pool: POOL,
    port: process.env.PORT_DB
};
myLogger.info("DB config: %o",configDB);
let connection = createPool(configDB);
export default connection;