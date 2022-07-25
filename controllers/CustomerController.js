import myLogger from "../winstonLog/winston.js";
import query from "../helper/helperDb.js";
import { SYSTEM_ERROR, OK } from "../constant/HttpResponseCode.js";

export async function getListCustomer() {
    let sql = `CALL getCustomer()`;
    let ret = undefined;
    try {
        const result = await query(sql);
        let res = result[0];
        let customers = [];
        for (let r of res) {
            let { id, username } = r;
            customers.push({ id, username })
        }
        ret = { statusCode: OK, data: { customers } };
    } catch (e) {
        myLogger.info("login e: %o", e);
        ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'System busy!' };

    } finally {
    }
    return ret;
}

export async function insertTicketByCustomer(customer_name, category_id, email, phone, resolved_date, description) {
    let params = [customer_name, category_id, email, phone, resolved_date, description]
    let sql = `CALL insertTicketByCustomer(?, ?, ?, ?, ?, ?)`;
    try {
        const result = await query(sql, params);
        let ret = result[0][0];
        console.log(ret);
        let id = ret.res;
        return { statusCode: OK, data: { id, customer_name, category_id, email, phone, resolved_date, description } };
    } catch (error) {
        myLogger.info("login e: %o", error);
        return { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'System busy!' };
    }
}