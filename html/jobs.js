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
			obj.postings = await db.postings.find({});
		}
		for(let i in obj.postings){
			console.log("-------------" + obj.postings.posting_title.trim());
			// if(obj.postings.posting_title.trim() == ""){
				db.postings.destroy({where: {id: obj.postings.id}});
			// }
		}
		resolve(obj);
	});
	return prom;
}
module.exports.main = main;