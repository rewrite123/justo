var mainJs = require("../main.js");
var server = require("../server.js");
var db = mainJs.db;
var bc = require("bcrypt-nodejs");

/* */
async function main(req){
	var cookies = server.extractCookiesFromRequest(req);
	var query = server.extractQueryStringFromRequest(req);
	var prom = new Promise(async function(resolve, reject){
		var obj = {};
		obj.user = await mainJs.authenticateUser(cookies);
		if(obj.user){
			var postings = await db.postings.findAll({
				limit: 20,
				offset: 20*( parseInt(query.page)-1)
			});
			obj.postings = [];
			for(let i in postings){obj.postings.push(postings[i])}
		}
		obj.goBackAPageUrl = "/jobs?page=" + (parseInt(query.page)-1);
		obj.goForwardAPageUrl = "/jobs?page=" + (parseInt(query.page)+1);
		resolve(obj);
	});
	return prom;
}
module.exports.main = main;