var mainJs = require("../main.js");
var server = require("../server.js");
var db = mainJs.db;
var bc = require("bcrypt-nodejs");

/* */
async function main(req){
	var cookies = server.extractCookiesFromRequest(req);
	var prom = new Promise(async function(resolve, reject){
		var obj = {};
		obj.user = await mainJs.authenticateUser(cookies);
		obj.postings = await db.postings.find({
			where: {
				posting_owner: obj.user.id
			}
		});
		obj.jobs = await db.posting_employees.find({
			where: {
				employee: obj.user.id
			}
		});
		resolve(obj);
	});
	return prom;
}
module.exports.main = main;