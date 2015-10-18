/**
 * Created by bryazginnn on 22.11.14.
 */

var PG = require('../../utils/pg');
var PgExpressions = require('./pg_expressions');

var model = {};

model.find = function (condition_id, url_id, paramtype_id) {
    return PG.logQueryOneOrNone("SELECT * FROM params WHERE CONDITION_ID = $1 AND URL_ID = $2 AND PARAMTYPE_ID = $3", [condition_id, url_id, paramtype_id]);
};

model.insert = function (condition_id, url_id, paramtype_id, param_value) {
    return PG.logQueryOneOrNone("INSERT INTO params (CONDITION_ID, URL_ID, PARAMTYPE_ID, PARAM_VALUE, DATE_CREATE, IS_LAST) " +
        "SELECT $1, $2, $3, $4, $5, TRUE RETURNING PARAM_ID", [condition_id, url_id, paramtype_id, param_value, new Date()] )
};

model.replaceByPtName = function (condition_id, url_id, paramtype, param_value) {
    return model.getParamtype(paramtype)
        .then(function(paramtype){
            model.replace(condition_id, url_id, paramtype.paramtype_id, param_value)
        })
};

model.setNotActual = function (condition_id, url_id) {
    return PG.logQuery("UPDATE params SET IS_LAST = FALSE WHERE CONDITION_ID = $1 AND URL_ID = $2", [condition_id, url_id] )
};

model.deleteNoActual = function (condition_id, url_id) {
    return PG.logQuery("DELETE FROM params WHERE IS_LAST IS FALSE AND CONDITION_ID = $1 AND URL_ID = $2", [condition_id, url_id] )
};

model.getParamtype = function (paramtype) {
    return PG.logQueryOneOrNone("SELECT * FROM paramtypes WHERE PARAMTYPE_NAME = $1", [paramtype] )
};

model.delete = function (id) {
    return PG.logQueryOneOrNone("DELETE FROM params WHERE PARAM_ID = $1", [id] )
};

model.replace = function (condition_id, url_id, paramtype_id, param_value) {
    return model.find (condition_id, url_id, paramtype_id)
        .then(function(res){
            if(res) {
                return model.delete(res.param_id);
            }
            return
        })
        .then(function() {
            return model.insert(condition_id, url_id, paramtype_id, param_value)
        })
        .then(function(res) {
            return res;
        })
};


model.getParamDiagram = function (condition_id, paramtype_id) {
    return PG.logQuery( "SELECT " +
        "    SC.POSITION_N + 1 as POSITION, " +
        "    P.PARAM_VALUE as VALUE " +
        "FROM " +
        "    spages SP  " +
        "    JOIN scontents SC  " +
        "        ON SP.SPAGE_ID = SC.SPAGE_ID" +
        "    JOIN params P  " +
        "         ON SC.URL_ID = P.URL_ID " +
        "         AND SP.CONDITION_ID = P.CONDITION_ID " +
        "    JOIN paramtypes PT  " +
        "         ON P.PARAMTYPE_ID = PT.PARAMTYPE_ID " +
        "WHERE " +
        "    SP.CONDITION_ID  = $1  " +
        "    AND PT.PARAMTYPE_ID = $2 " +
        "ORDER BY SC.POSITION_N;",
        [condition_id, paramtype_id])
};
model.getSiteParam = function (condition_id, url_id, paramtype_id) {
    return PG.logQueryOne( "SELECT " +
        "    P.PARAM_VALUE AS PARAM_VALUE, " +
        "    GET_COLOR(PC.PERCENT,'R') AS COLOR_R, " +
        "    GET_COLOR(PC.PERCENT,'G') AS COLOR_G, " +
        "    GET_COLOR(PC.PERCENT,'B') AS COLOR_B, " +
        "    PT.paramtype_ru_name " +
        "FROM " +
        "    params P  " +
        "    JOIN paramtypes PT  " +
        "         ON P.PARAMTYPE_ID = PT.PARAMTYPE_ID " +
        "    JOIN condurls CU  " +
        "         ON CU.CONDITION_ID = P.CONDITION_ID " +
        "         AND CU.URL_ID = P.URL_ID " +
        "    JOIN percents PC  " +
        "         ON CU.CONDURL_ID = PC.CONDURL_ID " +
        "         AND P.PARAMTYPE_ID = PC.PARAMTYPE_ID " +
        "WHERE " +
        "    P.CONDITION_ID  = $1  " +
        "    AND P.PARAMTYPE_ID = $2 " +
        "    AND P.URL_ID = $3 " +
        "    AND PC.IS_LAST = TRUE;",
        [condition_id, paramtype_id, url_id])
};

model.getParamtypesForUrl = function (condition_id, url_id) {
    var ex = PgExpressions;
    return ex.execute_list(ex.GET_PARAMTYPES_FOR_URL(condition_id, url_id));
};

model.getParamtypes = function (search_id) {
    var ex = PgExpressions;
    return ex.execute_list(ex.GET_PARAMTYPES(search_id))
};
module.exports = model;



