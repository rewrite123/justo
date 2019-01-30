/* This is the sequelize and myslq stuff that we require. */

// const sequelize = db.sequelize;//"mysql://f4c6q7bw69vclpct@qbct6vwi8q648mrn.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/fpt7lwzwi3y42ylb");

var bc = require("bcrypt-nodejs");

var db = require(__dirname + "/models");
module.exports.db = db;

const sequelize = db.sequelize;

/* This is for the actual server. */
var server = require("./server.js");

db.sequelize.sync({force: false}).catch(function(err){
	console.log("ERROR: " + JSON.stringify(err) );
}).then(function() {
	server.startServer();
});
// server.startServer();

/* ---------------------------------------------------------------------- */
/* ----------------------CUSTOM-UTILS-GO-BELOW-HERE---------------------- */
/* ---------------------------------------------------------------------- */

function authenticateUser(cookies){
	var prom = new Promise(function(resolve, reject){
		var result = {};
		if(cookies.session_id){
			db.sessions.find({
				where: {
					session_id: bc.hashSync(cookies.session_id, cookies.salt)
				}
			}).then(function(session){
				if(session){
					db.users.find({
						where: {
							id: session.session_user_id
						}
					}).then(function(user){
						result.id         = user.id;
						result.first_name = user.first_name;
						result.last_name  = user.last_name;
						result.email      = user.email;
						result.image      = user.image;
						resolve(result);
					});
				}else{
					resolve();
				}
			});
		}else{
			resolve();
		}
	});
	return prom;
}
module.exports.authenticateUser = authenticateUser;