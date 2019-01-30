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
			//[{posting_title: "A", id: -1, posting_type: "TEST", posting_completion_deadline: "9/11/1998"}];
			var postings = await db.postings.find({});
			obj.postings = [];
			for(let i in postings){
				console.log("---------------" + JSON.stringify(postings));
				obj.postings.push(postings[i]);
			}
		}
		//console.log( JSON.stringify(obj.postings) );
		resolve(obj);
	});
	return prom;
}
module.exports.main = main;