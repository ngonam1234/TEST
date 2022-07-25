import myLogger from "../winstonLog/winston.js";
import query from "../helper/helperDb.js";
import { genTokenCustomer, genRefreshTokenCustomer } from '../token/ValidateToken.js';
import { OK, SYSTEM_ERROR, Unauthorized } from "../constant/HttpResponseCode.js";

export async function loginByCustomer(username, password) {
    let params = [username, password]
    let sql = `CALL customerLogin(?, ?)`;
    try {

        const result = await query(sql, params);
        let ret = result[0][0];
        let { res, id, full_name, email, role} = ret;
        if (res == 1) {
            let accsessToken = genTokenCustomer(username, full_name, email, role);
            let refreshToken = genRefreshTokenCustomer(username, full_name, email, role);
            return { statusCode: OK, data: { id, full_name, email, role, accsessToken, refreshToken } }
        } else {
            return { statusCode: Unauthorized, error: 'USERNAME_NOT_FOUND', description: 'username not found' };
        }
    } catch (e) {
        myLogger.info("login e: %o", e);
        return { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'System busy!' };

    } finally {

    }
}