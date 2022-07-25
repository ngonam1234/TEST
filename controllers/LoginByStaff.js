import myLogger from "../winstonLog/winston.js";
import query from "../helper/helperDb.js";
import fetch from 'node-fetch';
import { genTokenStaff, genRefreshTokenStaff } from '../token/ValidateToken.js';
import { OK, SYSTEM_ERROR, Unauthorized } from "../constant/HttpResponseCode.js";
import router from "../routers/Staff.js";

export async function loginByStaff(username, password) {
    let params = [username, password]
    let sql = `CALL staffLogin(?, ?)`;
    try {

        const result = await query(sql, params);
        let ret = result[0][0];
        let { res, id, full_name, email, phone, role } = ret;
        if (res == 1) {
            let accessToken = genTokenStaff(username, full_name, email, phone, role);
            let refreshToken = genRefreshTokenStaff(username, full_name, email, phone, role);
            return { statusCode: OK, data: { full_name, email, phone, accessToken, refreshToken, role } }
        } else {
            return { statusCode: Unauthorized, error: 'USERNAME_NOT_FOUND', description: 'Username or Password incorrect' };
        }
    } catch (e) {
        myLogger.info("login e: %o", e);
        return { statusCode: 500, error: 'ERROR', description: 'System busy!' };

    } finally {

    }
}


export async function loginByStaffNew(username, password) {
    const urlLogin = 'http://180.93.175.189:30001/public/login';
    let ret = undefined;
    try {
        const objLogin = {
            username,
            password
        }
        const body = JSON.stringify(objLogin);
        let headers = {
            "Content-Type": "application/json"
        }
        let requestOptions = {
            method: 'POST',
            body: body,
            headers
        };
        let projectRes = await fetch(urlLogin, requestOptions)
            .then(response => response.json());
        let { JSESSIONID } = projectRes;
        if (JSESSIONID) {
            const getUserUrl = `http://180.93.175.189:30001/api/user/${username}`;
            try {

                let headers = {
                    "jsessionid": JSESSIONID
                }
                let requestOptions = {
                    method: 'GET',
                    headers
                };
                let user = await fetch(getUserUrl, requestOptions)
                    .then(response => response.json());
                let { name, key, emailAddress, displayName } = user;
                let accessToken = genTokenStaff(name, displayName, emailAddress, JSESSIONID, key);
                let refreshToken = genRefreshTokenStaff(name, displayName, emailAddress, JSESSIONID, key);
                return { statusCode: 200, data: { name, displayName, emailAddress, JSESSIONID, key, accessToken, refreshToken, role: 'STAFF' } }
            } catch (e) {
                myLogger.info("login e: %o", e);
                ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'System busy!' };
            }
        } else {
            ret = { statusCode: Unauthorized, error: 'ERROR', description: 'System busy!' };
        }
    } catch (e) {
        myLogger.info("login e: %o", e);
        ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'System busy!' };
    }
    return ret;

}

export async function findByUser(username, jsessionid) {

    const getUserUrl = `http://180.93.175.189:30001/api/user/${username}`;
    try {
        let headers = {
            "jsessionid": jsessionid
        }
        let requestOptions = {
            method: 'GET',
            headers
        };
        let user = await fetch(getUserUrl, requestOptions)
            .then(response => response.json());
        let { name, key, emailAddress, displayName } = user;
        return { statusCode: 200, data: { name, key, emailAddress, displayName } }
    } catch (e) {
        myLogger.info("login e: %o", e);
        ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'System busy!' };
    }


    return ret;

}

