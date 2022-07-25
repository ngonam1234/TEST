import myLogger from "../winstonLog/winston.js";
import query from "../helper/helperDb.js";
import { BAD_REQUEST, OK, SYSTEM_ERROR } from "../constant/HttpResponseCode.js";
import nodemailer from 'nodemailer';
import fetch from "node-fetch";

export async function updateTicketByStaff(account_name, project_id, group_id, priority_id, scope, summary, description_by_staff, assignee_id, status_id, request_type_id, sizing_id, id) {
    let params = [account_name, project_id, group_id, priority_id, scope, summary, description_by_staff, assignee_id, status_id, request_type_id, sizing_id, id]
    let sql = `CALL updateTicketByStaff(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    try {
        const result = await query(sql, params);
        let ret = result[0][0];
        console.log(ret);
        let id = ret.res;
        return { statusCode: 200, data: { account_name, project_id, group_id, priority_id, scope, summary, description_by_staff, assignee_id, request_type_id, sizing_id, status_id } };
    } catch (error) {
        myLogger.info("login e: %o", error);
        return { statusCode: 500, error: 'ERROR', description: 'System busy!' };
    }

}

export async function updateTicketStatusByStaff(ticket_id, created_by_account, new_status, note, date_activity, time_spent) {
    let params = [ticket_id, created_by_account, new_status, note, date_activity, time_spent]
    let sql = `CALL updateStatusTicketByStaff(?, ?, ?, ?, ?, ?)`
    try {
        const result = await query(sql, params);
        let ret = result[0][0];
        let id = ret.res;
        if (id > 0) {
            return { statusCode: 200, data: { ticket_id, created_by_account, new_status, note, date_activity, time_spent } };
        } else {
            return { statusCode: BAD_REQUEST, error: 'UPDATE_FALSE', description: 'update false' };
        }
    } catch (error) {
        myLogger.info("login e: %o", error);
        return { statusCode: 500, error: 'ERROR', description: 'System busy!' };
    }
}


export async function updateTransferTicketByStaff(ticket_id, new_group, new_assignee, time_spent, note, date_of_activity, create_by_account) {
    let params = [ticket_id, new_group, new_assignee, time_spent, note, date_of_activity, create_by_account]
    let sql = `CALL transferTicketByStaff(?, ?, ?, ?,?, ?, ?)`
    try {
        const result = await query(sql, params);
        let ret = result[0][0];
        let id = ret.res;
        myLogger.info("%o", ret)
        if (id > 0) {
            return { statusCode: OK, data: { ticket_id, new_group, new_assignee, time_spent, note, date_of_activity, create_by_account } };
        } else {
            return { statusCode: BAD_REQUEST, error: 'UPDATE_FALSE', description: 'update false' };
        }
    } catch (error) {
        myLogger.info("login e: %o", error);
        return { statusCode: 500, error: 'ERROR', description: 'System busy!' };
    }
}

export async function updateCommentByStaff(ticket_id, created_by_account, note, date_activity, time_spent) {
    let params = [ticket_id, created_by_account, note, date_activity, time_spent]
    let sql = `CALL updateCommentByStaff(?, ?, ?, ?, ?)`
    try {
        const result = await query(sql, params);
        let ret = result[0][0];
        console.log(ret);
        let id = ret.res;
        if (id > 0) {
            return { statusCode: 200, data: { ticket_id, created_by_account, note, date_activity, time_spent } };
        } else {
            return { statusCode: BAD_REQUEST, error: 'UPDATE_FALSE', description: 'update false' };
        }
    } catch (error) {
        myLogger.info("login e: %o", error);
        return { statusCode: 500, error: 'ERROR', description: 'System busy!' };
    }
}


export async function ticketStatusAllByStaff(staff_account_name) {
    let params = [staff_account_name]
    let sql = `CALL ticketAllByStaff(?)`
    try {
        const result = await query(sql, params);
        let ret = result[0];
        myLogger.info(ret)
        let arr = [];
        let objMap = Object.create(null);
        let statusArr = [];
        let requestArr = [];
        for (const r of ret) {
            let { id, customer_name, project_id, category_id, email, phone, date_create, resolved_date, summary,
                description_by_customer, group_id, priority_id, scope, assignee_id, description_by_staff, status_name, status_id, request_type_id, request_type_name } = r;
            let statusNum = !statusArr[status_name] ? 1 : statusArr[status_name] + 1;
            statusArr[status_name] = statusNum;
            let requestNum = !requestArr[request_type_name] ? 1 : requestArr[request_type_name] + 1;
            requestArr[request_type_name] = requestNum;

            if (objMap[status_id]) {
                objMap[status_id].details.push({
                    id, customer_name, project_id, category_id, email, phone, date_create, resolved_date, summary,
                    description_by_customer, group_id, priority_id, scope, assignee_id, description_by_staff, status_name, status_id, request_type_id, request_type_name
                });
            } else {
                let details = [{
                    id, customer_name, project_id, category_id, email, phone, date_create, resolved_date, summary,
                    description_by_customer, group_id, priority_id, scope, assignee_id, description_by_staff, status_name, status_id, request_type_id, request_type_name
                }];
                objMap[status_id] = { type: status_name, details };
            }
        }

        Object.keys(objMap).forEach(o => {
            // myLogger.info(objMap[o])
            arr.push(objMap[o]);
        });
        let status = [];
        Object.keys(statusArr).forEach(o => {
            // myLogger.info(objMap[o])
            status.push({ statusName: o, quantity: statusArr[o] });
        });
        let requests = [];
        Object.keys(requestArr).forEach(o => {
            myLogger.info(requestArr[o])
            requests.push({ requestName: o, quantity: requestArr[o] });
        });
        // console.log(ret);
        return { statusCode: 200, data: { tickets: arr, status, requests } };
    } catch (error) {
        myLogger.info("login e: %o", error);
        return { statusCode: 500, error: 'ERROR', description: 'System busy!' };
    }
}


function makeCookie(jsessionid) {
    return `JSESSIONID=${jsessionid};`;
}
export async function createTicketByStaff(
    account_name,
    customer_name,
    project_id,
    summary,
    group_id,
    priority_id,
    scope,
    description_by_staff,
    request_type_id,
    sizing_id,
    resolved_date,
    component_name,
    time_spent,
    activity_date,
    assignee_name, jsessionid) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let constUrl = 'http://180.93.175.189:30001/api/issue-mine'
    try {
        const objLogin = {
            projectId: project_id,
            summary: summary,
            description: description_by_staff,
            componentName: component_name,
            timeSpent: time_spent,
            dueDate: resolved_date,
            startDate: activity_date,
            assigneeName: assignee_name
        }
        let headers = {
            "Content-Type": "application/json",
            jsessionid
        }
        const body = JSON.stringify(objLogin);
        let requestOptions = {
            method: 'POST',
            body: body,
            headers
        };
        let createTicket = await fetch(constUrl, requestOptions)
            .then(response => response.json());
        myLogger.info("asdashdhasd: %o", createTicket);
        let { createTaskRes } = createTicket;
        if (createTaskRes) {
            let { id, key } = createTaskRes;
            // let issue_id = createTaskRes.id;
            myLogger.info("IssueId %o", id);
            // myLogger.info("asdashdhasd: %o", createTicket);
            let params = [account_name,
                customer_name,
                project_id,
                summary,
                group_id,
                priority_id,
                scope,
                assignee_name,
                description_by_staff,
                request_type_id,
                sizing_id,
                resolved_date,
                id,
                component_name,
                time_spent,
                activity_date,
            ]
            let sql = `CALL createTicketByStaff(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            try {
                const result = await query(sql, params);
                // let ret = result[0][0];
                console.log(ret);
                let idMaster = result[0][0].res;
                myLogger.info("idMaster: %o", idMaster);
                ret = {
                    statusCode: OK, data: {
                        idMaster, account_name,
                        customer_name,
                        project_id,
                        summary,
                        group_id,
                        priority_id,
                        scope,
                        description_by_staff,
                        request_type_id,
                        sizing_id,
                        resolved_date,
                        id,
                        component_name,
                        time_spent,
                        activity_date
                    }
                };
            } catch (error) {
                myLogger.info("login e: %o", error);
                ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'Insert DB error!' };
            }
        }
    } catch (error) {
        myLogger.info("login e: %o", error);
        ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'Create Issue error!' };
    }
    return ret;
}

export async function getDetailsTicket(ticket_id, account_name) {
    let params = [ticket_id]
    let paramsLog = [account_name, ticket_id]
    let sql = `CALL getAllTicketById(?)`
    let sqlLog = `CALL getLogCommentByTicket(?,?)`
    try {
        const result = await query(sql, params);
        const resultLog = await query(sqlLog, paramsLog);
        let ret = result[0];
        let retLog = resultLog[0];

        let details = [];
        let detailsLog = [];
        ret.forEach(e => {
            let { id, ticket_id, date_create, create_by_account, new_status, note, date_activity, time_spent, activity_type, assignee_id, new_group, status_name } = e;
            details.push({ id, ticket_id, date_create, create_by_account, new_status, note, date_activity, time_spent, activity_type, assignee_id, new_group, status_name });
        })
        retLog.forEach(e => {
            let { id, ticket_id, date_create, create_by_account, note, date_activity, time_spent, activity_type } = e;
            detailsLog.push({ id, ticket_id, date_create, create_by_account, note, date_activity, time_spent, activity_type });
        })
        return { statusCode: 200, data: { details, detailsLog } };
    } catch (error) {
        myLogger.info("login e: %o", error);
        return { statusCode: 500, error: 'ERROR', description: 'System busy!' };
    }
}

export async function getTimeSpent(account_name) {
    let params = [account_name]
    let sql = `CALL getTimeSpent(?)`
    try {
        const result = await query(sql, params);
        let ret = result[0];
        let details = [];
        ret.forEach(e => {
            let { count7, count6, count5, count4, count3, count2, count1, count0 } = e;
            details.push(count7);
            details.push(count6);
            details.push(count5);
            details.push(count4);
            details.push(count3);
            details.push(count2);
            details.push(count1);
            details.push(count0);
            // details.push({ count0, count1, count2, count3, count4, count5, count6, count7 });
        })
        return { statusCode: 200, data: { details } };
    } catch (error) {
        myLogger.info("login e: %o", error);
        return { statusCode: 500, error: 'ERROR', description: 'System busy!' };
    }
}

export async function getAllProjects() {
    let sql = `CALL getAllProjects()`
    try {
        const result = await query(sql);
        let ret = result[0];
        let details = [];
        ret.forEach(e => {
            let { id, name, project_category, project_code, image } = e;
            details.push({ id, name, project_category, project_code, image });
        })
        return { statusCode: 200, data: { details } };
    } catch (error) {
        myLogger.info("login e: %o", error);
        return { statusCode: 500, error: 'ERROR', description: 'System busy!' };
    }
}

export async function sendMail(email) {

    var transporter = nodemailer.createTransport({
        // service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'codedaoit@gmail.com',
            pass: 'cxxbcdsliapjbpyo'
        }
    });

    var mailOptions = {
        from: `ducnv72@fpt.com.vn`,
        to: `${email}`,
        subject: 'HOP BIDV',
        text: 'Thong Nhat cac Yeu Cau!'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return { statusCode: 500, error: 'ERROR', description: 'System busy!' };
        } else {
            return { statusCode: 200 };
        }
    });
}

export async function updateIssue(ticket_id, account_name, issue_id) {
    let params = [ticket_id, account_name, issue_id]
    let sql = `CALL updateIdIssue(?, ?,?)`
    try {
        const result = await query(sql, params);
        let ret = result[0][0];
        let id = ret.res;
        if (id > 0) {
            return { statusCode: OK, data: { ticket_id, account_name, issue_id } };
        } else {
            return { statusCode: BAD_REQUEST, error: 'UPDATE_FALSE', description: 'update false' };
        }
    } catch (error) {
        myLogger.info("login e: %o", error);
        return { statusCode: 500, error: 'ERROR', description: 'System busy!' };
    }
}


export async function findByIssue(issue_id, jsessionid) {
    const getUserUrl = `http://180.93.175.189:30001/api/issue/${issue_id}`;
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
        let { projectRes } = user;
        return { statusCode: 200, data: { projectRes } }
    } catch (e) {
        myLogger.info("login e: %o", e);
        ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'System busy!' };
    }
    return ret;
}


export async function getTicketConfig() {
    let sqlProjects = `select *  from projects`;
    let sqlStatus = `select *  from status_support`;
    let sqlPriority = `select *  from priority`;
    let sqlRequest = `select *  from request_type`;
    let sqlGroup = "select * from `group`";
    let sqlSizing = `select *  from sizing`;
    try {
        const resultProjects = await query(sqlProjects);
        const resultStatus = await query(sqlStatus);
        const resultPriority = await query(sqlPriority);
        const resultRequest = await query(sqlRequest);
        const resultGroup = await query(sqlGroup);
        const resultSizing = await query(sqlSizing);
        let projects = [];
        let status = [];
        let priority = [];
        let request = [];
        let group = [];
        let sizing = [];

        resultProjects.forEach(e => {
            let { name,
                date_create,
                user_create,
                account_owner,
                department,
                project_code,
                project_id,
                project_category,
                image } = e;
            projects.push({
                name,
                date_create,
                user_create,
                account_owner,
                department,
                project_code,
                project_id,
                project_category,
                image
            });
        })
        resultStatus.forEach(e => {
            let { id, status_name } = e;
            status.push({
                id, status_name
            });
        })


        resultPriority.forEach(e => {
            let { id, name_priority } = e;
            priority.push({
                id, name_priority
            });
        })

        resultRequest.forEach(e => {
            let { id, request_type_name } = e;
            request.push({
                id, request_type_name
            });
        })
        resultGroup.forEach(e => {
            let { id,
                group_name } = e;
            group.push({
                id,
                group_name
            });
        })
        resultSizing.forEach(e => {
            let { id, name } = e;
            sizing.push({
                id, name
            });
        })
        return { statusCode: 200, data: { projects, status, priority, request, group, sizing } };
    } catch (error) {
        myLogger.info("login e: %o", error);
        return { statusCode: 500, error: 'ERROR', description: 'System busy!' };
    }
}

export async function getNameComponentByProject(project_id) {
    let params = [project_id]
    let sql = `CALL getNameComponentByProjectCode(?)`
    try {
        const result = await query(sql, params);
        let component_name = result[0];
        return { statusCode: OK, data: { component_name } };
    } catch (error) {
        myLogger.info("login e: %o", error);
        return { statusCode: 500, error: 'ERROR', description: 'System busy!' };
    }
}