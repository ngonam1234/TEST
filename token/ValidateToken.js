import jsonwebtoken from 'jsonwebtoken';
import { privateKEY, publicKEY } from '../ConfigKey.js';
import { Unauthorized } from '../constant/HttpResponseCode.js';
import myLogger from '../winstonLog/winston.js'

export function validateTokenCustomerAccess(req, res, next) {
    let { token } = req.headers;
    if (!token) {
        return next({ statusCode: Unauthorized, error: "NO_TOKEN", description: "Không có Token" });
    }
    let verifyOptions = {
        algorithm: "RS256"
    }
    try {
        let payload = jsonwebtoken.verify(token, publicKEY, verifyOptions);
        req.payload = payload;
        let { username, type, full_name, email } = payload;
        if (type !== "ACCESS_TOKEN") {
            return next({ statusCode: Unauthorized, error: "WRONG_TOKEN", description: "Wrong token type" });
        }
        return next();
    } catch (e) {
        return next({ statusCode: Unauthorized, error: "TOKEN_EXPIRED", description: "Token hết hạn" });
    }
}


export function validateTokenStaffAccess(req, res, next) {
    let { token } = req.headers;
    if (!token) {
        return next({ statusCode: Unauthorized, error: "NO_TOKEN", description: "Không có Token" });
    }
    let verifyOptions = {
        algorithm: "RS256"
    }
    try {
        let payload = jsonwebtoken.verify(token, publicKEY, verifyOptions);
        req.payload = payload;
        let { username, type, full_name, email, phone } = payload;
        if (type !== "ACCESS_TOKEN") {
            return next({ statusCode: Unauthorized, error: "WRONG_TOKEN", description: "Wrong token type" });
        }
        return next();
    } catch (e) {
        return next({ statusCode: Unauthorized, error: "TOKEN_EXPIRED", description: "Token hết hạn" });
    }
}


export function genTokenCustomer(username, full_name, email, role) {
    let signOptions = {
        expiresIn: "1h",
        algorithm: "RS256"
    }
    myLogger.info('Generate accesstoken for:' + username);
    let payload = { username, type: "ACCESS_TOKEN", full_name, email, role };
    let accessToken = jsonwebtoken.sign(payload, privateKEY, signOptions);
    return accessToken;
}

export function genRefreshTokenCustomer(username, full_name, email, role) {
    let signOptions = {
        expiresIn: "24h",
        algorithm: "RS256"
    }
    myLogger.info('Generate accesstoken for:' + username);
    let payload = { username, type: "REFRESH_TOKEN", full_name, email, role };
    let refreshToken = jsonwebtoken.sign(payload, privateKEY, signOptions);
    return refreshToken;
}

export function genTokenStaff(username, full_name, email, jsessionid, key) {
    let signOptions = {
        expiresIn: "1h",
        algorithm: "RS256"
    }
    myLogger.info('Generate accesstoken for:' + username);
    let payload = { username, type: "ACCESS_TOKEN", full_name, email, jsessionid, key};
    let accessToken = jsonwebtoken.sign(payload, privateKEY, signOptions);
    return accessToken;
}

export function genRefreshTokenStaff(username, full_name, email, jsessionid, key) {
    let signOptions = {
        expiresIn: "24h",
        algorithm: "RS256"
    }
    myLogger.info('Generate accesstoken for:' + username);
    let payload = { username, type: "REFRESH_TOKEN", full_name, email, jsessionid, key };
    let refreshToken = jsonwebtoken.sign(payload, privateKEY, signOptions);
    return refreshToken;
}

export function refreshToken(refreshtoken) {
    if (!refreshtoken) {
        return { status: false };
    }
    let verifyOptions = {
        algorithm: "RS256"
    }
    try {
        let payload = jsonwebtoken.verify(refreshtoken, publicKEY, verifyOptions);
        let { username, type, full_name, email, jsessionid, key } = payload;
        if (type !== "REFRESH_TOKEN") {
            return { status: false };
        } else {
            let accessToken = undefined;
            if (role == "STAFF") {
                accessToken = genRefreshTokenStaff(username, full_name, email, jsessionid, key);
            } else {
                accessToken = genRefreshTokenCustomer(username, full_name, email, role);
            }
            return { status: true, accessToken }
        }
    } catch (e) {
        myLogger.info(e)
        return { status: false };
    }
}
