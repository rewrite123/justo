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
		if(obj.user){
			obj.postings = [];
			var postings = await db.postings.findAll({
				where: {
					posting_owner: obj.user.id
				}
			});
			for(let i in postings){obj.postings.push(postings[i]);}
			obj.jobs = [];
			var jobs = await db.posting_employees.findAll({
				where: {
					employee: obj.user.id
				}
			});
			for(let i in jobs){obj.jobs.push(jobs[i])}
			resolve(obj);
		}else{
			resolve(obj);
		}
	});
	return prom;
}
module.exports.main = main;