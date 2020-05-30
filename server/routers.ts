import express from 'express';
let router = express.Router();
import sqlUtil from './sqlUtil';

/* 查询 */
router.get('/select', function (req, res, next) {
    let options = {
        type: "select",
        fields: null,
        tableName: "tableA",
        where: [
            { expression: "name=?", valueField: "name", relation: "AND" },
            { expression: "age=?", valueField: "age", relation: "AND" },
        ],
        orderBy: null,
        limit: { begin: 0, end: 9 }
    }
    let params = {
        name: "张珊",
        age: ""
    }
    let sql = sqlUtil.sqlJoin(options, params)
    console.log(sql)
    res.json(sql)
});


/* 新增 */
router.get('/add', function (req, res, next) {
    let options = {
        type: "insert",
        fields: [
            { expression: "name", valueField: "name" },
            { expression: "age", valueField: "age" },
        ],
        tableName: "tableA"
    }
    let params = {
        name: "张珊",
        age: "27"
    }
    let sql = sqlUtil.sqlJoin(options, params)
    console.log(sql)
    res.json(sql)
});

//修改
router.get('/update', function (req, res, next) {
    let options = {
        type: "update",
        fields: [
            { expression: "name", valueField: "name" },
            { expression: "age", valueField: "age" },
        ],
        tableName: "tableA",
        where: [
            { expression: "id=?", valueField: "id" }
        ]
    }
    let params = {
        id: 1,
        name: "张珊",
        age: "27"
    }
    let sql = sqlUtil.sqlJoin(options, params)
    console.log(sql)
    res.json(sql)
});

//修改
router.get('/deleteById', function (req, res, next) {
    let options = {
        type: "delete",
        fields:null,
        tableName: "tableA",
        where: [
            { expression: "id=?", valueField: "id" }
        ]
    }
    let params = {
        id: 1,
        name: "张珊",
        age: "27"
    }
    let sql = sqlUtil.sqlJoin(options, params)
    console.log(sql)
    res.json(sql)
});


module.exports = router;