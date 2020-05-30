/*查询字段 */
interface fieldProps { //distinct name as aname
    expression: any;    //字段表达式，对应数据库字段,例如distinct name
    valueField?: string;  //数据对应的字段
    alias?: string;      //别名
}

/*where条件 */
interface whereProps {   //where name=? and 
    expression: string; //条件表达式,例如name=?
    valueField?: string;    //数据对应字段
    relation?: string;   //关系，and、or
}

/*排序 */
interface orderByProps {
    field: string; //排序字段
    direction?: string;   //排序方向，desc/asc
}

/* limit */
interface limitProps {
    begin: number;   //起始位置
    end: number;     //结束位置
}


interface sqlOptionsProps {
    type: string;
    fields?: null | fieldProps[];
    tableName: string;
    where?: null | whereProps[];
    orderBy?: null | orderByProps[];
    limit?: null | limitProps;
}


/**
 * 
 * @param type //sql类型，select、insert、update、delete
 * @param fields //查询字段，默认为空，查询所有字段
 * @param tableName //表名
 * @param where //where条件，默认为空，即无条件
 * @param orderBy //排序条件，默认为空，即不排序
 * @param limit   //分页参数，存在时默认查询前10条数据
 */
const getSqlStr = (
    type: string,
    fields: null | fieldProps[] = [],
    tableName: string,
    where: null | whereProps[] = [],
    orderBy: null | orderByProps[] = [],
    limit: null | limitProps = { begin: 0, end: 9 }
) => {
    let sql = "";
    //表名
    if (!tableName) {
        console.log("表名不能为空！")
    }
    switch (type) {
        case "select":
        case "SELECT":
            //sql类型
            sql += "SELECT ";
            //查询字段
            if (fields && fields.length > 0) {
                for (let field of fields) {
                    if (field.expression) {
                        sql += field.expression;
                    }
                    if (field.alias) {
                        sql += " AS " + field.alias
                    }

                    sql += ",";
                }
                //去掉末尾的,
                sql = sql.substring(0, sql.length - 1);
            } else {
                sql += "*";
            }

            sql += " FROM " + tableName;

            //where条件
            if (where && where.length > 0) {
                let whereStr = joinWhere(where);
                sql += whereStr
            }

            //order by
            if (orderBy && orderBy.length) {
                sql += " ORDER BY ";
                for (let i = 0; i < orderBy.length; i++) {
                    let order = orderBy[i];
                    let direction = order.direction ? order.direction : "ASC";
                    sql += `${order.field} ${direction}`;
                    //添加逗号
                    if (i != orderBy.length - 1) {
                        sql += ","
                    }
                }
            }

            //limit
            if (limit) {
                sql += ` limit ${limit.begin},${limit.end}`;
            }

            break;

        case "insert":
        case "INSERT":
            sql += `INSERT INTO ${tableName}(`;
            if (fields && fields.length > 0) {
                //设置新增字段
                for (let i = 0; i < fields.length; i++) {
                    let field = fields[i];
                    sql += `${field.expression}`
                    if (i != fields.length - 1) {
                        sql += ","
                    } else {
                        sql += ")"
                    }
                }

                //设置新增值，新增和编辑的值用?代替，使用mysql的传参方式传入，
                //因为参数入库涉及到参数类型校验，例如日期格式，前端检验相当麻烦，所以直接交由mysql的Api处理
                sql += " VALUE(";
                for (let i = 0; i < fields.length; i++) {
                    let field = fields[i];
                    sql += "?"
                    if (i != fields.length - 1) {
                        sql += ","
                    } else {
                        sql += ")"
                    }
                }
            } else {
                console.log("新增表字段不能为空!")
            }

            break;

        case "update":
        case "UPDATE":
            sql += `UPDATE ${tableName} SET `;
            if (fields && fields.length > 0) {
                for (let i = 0; i < fields.length; i++) {
                    let field = fields[i];
                    sql += `${field.expression}=?`
                    if (i != fields.length - 1) {
                        sql += ","
                    }
                }
            } else {
                console.log("修改表字段不能为空!")
            }

            //where条件
            if (where && where.length > 0) {
                let whereStr = joinWhere(where);
                sql += whereStr
            }
            break;
        case "delete":
        case "DELETE":
            sql += `DELETE FROM ${tableName}`;
            if (where && where.length > 0) {
                let whereStr = joinWhere(where);
                sql += whereStr
            }
            break;
    }
    return sql;
}

/**
 * 生成可执行sql和sql所需要的参数
 * @param sqlOptions 
 * @param resquestParams 
 */
const sqlJoin = (sqlOptions: sqlOptionsProps, resquestParams: any) => {
    let type = sqlOptions.type || "select";
    let fields: any = sqlOptions.fields;
    let tableName = sqlOptions.tableName;
    let where: any = sqlOptions.where;
    let orderBy = sqlOptions.orderBy;
    let limit = sqlOptions.limit;
    let whereValue = getWhereValue(where, resquestParams);
    let filedsParams = getFiledsParams(type, fields, resquestParams);
    let sqlStr = getSqlStr(type, fields, tableName, whereValue.whereArr, orderBy, limit);
    let paramsArr = filedsParams.concat(whereValue.paramsArr);
    return {
        sqlStr,
        paramsArr
    }
}


/**
 * 拼接wehre条件,最后一个条件的关系将会被舍弃，默认如果未配置关系则视为AND
 * @param where 
 */
const joinWhere = (where: whereProps[]) => {
    let whereStr = "";
    //where条件
    whereStr += " WHERE ";
    for (let i = 0; i < where.length; i++) {
        let wh = where[i]
        whereStr += wh.expression;
        if (i != where.length - 1) {
            if (wh.relation && wh.relation != "") {
                whereStr += " " + wh.relation + " ";
            } else {
                whereStr += " AND ";
            }

        }
    }
    return whereStr;
}

/**
 * 获取where条件和其对应的参数，返回一个对象，whereArr为条件，paramsArr为条件值，一一对应
 * @param whereList //手动配置的可选条件
 * @param searchObj //条件值对象
 */
const getWhereValue = (whereList: whereProps[], searchObj: any) => {
    let whereArr = [];  //条件数组
    let paramsArr = []; //条件值数组，用于替换问号数据
    if (searchObj && whereList && whereList.length > 0) {
        for (let where of whereList) {
            if (where.valueField) {
                let value = searchObj[where.valueField];
                let isEmpty = isEmptyFilter(value, true);
                if (!isEmpty) {
                    whereArr.push(where);
                    paramsArr.push(value);
                }
            }
        }
    }
    return {
        whereArr,
        paramsArr
    };
}


const getFiledsParams = (type: string, fileds: fieldProps[], resquestParams: any) => {
    let filedsParams: any[] = [];
    let typeLower = type.toLowerCase();
    //查询和删除不需要字段参数，只有where参数
    if (typeLower === 'select' || typeLower === 'delete') {
        return filedsParams;
    }
    //字段拼接参数
    if (fileds && fileds.length > 0) {
        for (let filed of fileds) {
            if (filed.valueField) {
                //数据库不接收undefined
                let param = resquestParams[filed.valueField] || null;
                filedsParams.push(param);
            }
        }
    }

    return filedsParams;
}

/**
 * 校验数据是否为空
 * @param value             //数据
 * @param vaildEmptyStr     //是否对空字符串进行校验
 */
const isEmptyFilter = (value: any, vaildEmptyStr: boolean = false) => {
    let valueType = Object.prototype.toString.call(value);
    switch (valueType) {
        case "[object Null]":
        case "[object Undefined]":
            return true;
        case "[object String]":
            if (vaildEmptyStr && value === "") {
                return true;
            }
            return false;
        default:
            return false;
    }
}

export default {
    sqlJoin
}; 