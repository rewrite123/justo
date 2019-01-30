const http = require("http");
const url = require("url");
var handlebars = require("handlebars");
const fs = require("fs");
var path = require("path")

/* This is the port of the server. */
var port = process.env.PORT || 443;

var options = {};
if(!process.env.PORT){
	options = {
		key: fs.readFileSync('privateKey.key'),
		cert: fs.readFileSync('certificate.crt')
	};
}

/* This is how one would start the serveer. */
function startServer(){
	server.listen(port, function(){
		console.log("server hosted on port " + port);
		//console.table(index.macro);
	});
}
module.exports.startServer = startServer;

/* This holds arrays for all the files that we will be serveing on our website. */
var index = {
	html:	  [],
	css:	  [],
	js:		  [],
	media:	[],
	reddir:	[],
	api:	  [],
	macro:  []
};
module.exports.index = index;

/* 
   This fills the correct arrays in index with their relevent data. 
   It looks at the /html, /css, /js, /media folders, and readir file 
   for files to servee, and automatically adds their path and url for 
   serveing on the webpage. It uses their order in the file system to 
   create the url, so you don't have to worry about writing the url 
   yourself. It is automatically handled! 
*/
function initIndex(){
	
	/* Reset index so that if we are trying to reinitialize it for some reason it will be fine. */
	index = {
		html:	  [],
		css:	  [],
		js: 	  [],
		media: 	[],
		reddir:	[],
		api:	  [],
		macro:  []
	};
	
	/* 
	   This adds the html and handlebars files for serveing in 
	   our html folder. serve is the url we are serveing to, and 
	   path is the path of the file that we are serveing. 
	*/
	var htmlPath = __dirname + "/html";
	fs.readdir(htmlPath, function(err, files){
		for(let i in files){
			var f = fs.statSync(__dirname+"/html/"+files[i]);
			if(f.isFile()){
				if((files[i].includes(".html") || files[i].includes(".hbs") || files[i].includes(".handlebars")) && !files[i].includes("~")){
					index.html.push({path: __dirname+"/html/"+files[i], serve: files[i].replace(new RegExp(".html", "g"), "").replace(new RegExp(".hbs", "g"), "").replace(new RegExp(".handlebars", "g"), "") });
				}
			}else if(f.isDirectory()){
				initIndexHtmlHelper(__dirname+"/html/"+files[i]);
			}
		}
	});
	
	/* 
	   This adds the css files for serveing in our css folder. 
	   serve is the url we are serveing to, and path is the path 
	   of the file that we are serveing.
	*/
	var cssPath = __dirname + "/css";
	fs.readdir(cssPath, function(err, files){
		for(let i in files){
			var f = fs.statSync(__dirname+"/css/"+files[i]);
			if(f.isFile()){
				if(files[i].includes(".css") && !files[i].includes("~")){
					index.css.push({path: __dirname+"/css/"+files[i], serve: files[i]});
				}
			}else if(f.isDirectory()){
				initIndexCssHelper(__dirname+"/css/"+files[i]);
			}
		}
	});
	
	/* 
	   This adds the js files for serveing in our js folder. 
	   serve is the url we are serveing to, and path is the path 
	   of the file that we are serveing.
	*/
	var jsPath = __dirname + "/js";
	fs.readdir(jsPath, function(err, files){
		for(let i in files){
			var f = fs.statSync(__dirname+"/js/"+files[i]);
			if(f.isFile()){
				if(files[i].includes(".js") && !files[i].includes("~")){
					index.js.push({path: __dirname+"/js/"+files[i], serve: files[i]});
				}
			}else if(f.isDirectory()){
				initIndexJsHelper(__dirname+"/js/"+files[i]);
			}
		}
	});
	
	/* 
	   This adds the js files for serveing in our js folder. 
	   serve is the url we are serveing to, and path is the path 
	   of the file that we are serveing.
	*/
	var mediaPath = __dirname + "/media";
	fs.readdir(mediaPath, function(err, files){
		for(let i in files){
			var f = fs.statSync(__dirname+"/media/"+files[i]);
			if(f.isFile()){
				if(!files[i].includes("~") && !files[i].includes("DS_Store") ){
					index.media.push({path: __dirname+"/media/"+files[i], serve: files[i]});
				}
			}else if(f.isDirectory()){
				initIndexMediaHelper(__dirname+"/media/"+files[i]);
			}
		}
	});
	
	/* 
	    This reads a file and creates a bunch of urls to redirect 
	    users similar to Windows host file. 
	*/
	fs.readFile(__dirname + "/reddir", "utf8", function(err, res){
		if(data != undefined && data.trim() != ""){
			var data = res.split("\n");
			for(let i in data){
				data[i] = data[i].replace(/\s+/g, " ");
				index.reddir.push({from: ""+data[i].split(" ")[0].trim(), to: ""+data[i].split(" ")[1].trim() });
			}
		}
	});
	
	/* 
	   This adds the api files that we run when a user accesses 
	   a url in our api folder. serve is the url we are serveing 
	   to, and path is the path of the file that we are serveing. 
	   All of these files must have a main funtion that accepts 
	   a request and a response from the server, and ends the 
	   connection after doing whatever their job is. 
	*/
	var apiPath = __dirname + "/api";
	fs.readdir(apiPath, function(err, files){
		for(let i in files){
			var f = fs.statSync(__dirname+"/api/"+files[i]);
			if(f.isFile()){
				if(files[i].includes(".js") && !files[i].includes("~")){
					index.api.push({path: __dirname+"/api/"+files[i], serve: files[i].replace(".js", "")});
				}
			}else if(f.isDirectory()){
				initIndexApiHelper(__dirname+"/api/"+files[i]);
			}
		}
	});
	
	/* 
	   TBA 
	*/
	var macroPath = __dirname + "/macro";
	fs.readdir(macroPath, function(err, files){
		for(let i in files){
			var f = fs.statSync(__dirname+"/macro/"+files[i]);
			if(f.isFile()){
				if( (files[i].includes(".html") || files[i].includes(".hbs") || files[i].includes(".handlebars")) && !files[i].includes("~")){
					index.macro.push({path: __dirname+"/macro/"+files[i], serve: files[i].replace(new RegExp(".html", "g"), "").replace(new RegExp(".hbs", "g"), "").replace(new RegExp(".handlebars", "g"), "") });
				}
			}else if(f.isDirectory()){
				initIndexMacroHelper(__dirname+"/macro/"+files[i]);
			}
		}
	});
	
}
initIndex();
module.exports.initIndex = initIndex;

/* This helps add all the html files into index.html */
function initIndexHtmlHelper(path){
	fs.readdir(path, function(err, files){
		for(let i in files){
			var f = fs.statSync(path+"/"+files[i]);
			if(f.isFile()){
				if((files[i].includes(".html") || files[i].includes(".hbs") || files[i].includes(".handlebars")) && !files[i].includes("~")){
					index.html.push({path: path+"/"+files[i], serve: (path.replace(__dirname+"/html/", "") + "/" + files[i]).replace(new RegExp(".html", "g"), "").replace(new RegExp(".hbs", "g"), "").replace(new RegExp(".handlebars", "g"), "") });
				}
			}else if(f.isDirectory()){
				initIndexHtmlHelper(path+"/"+files[i]);
			}
		}
	});
}

/* This helps add all the css files into index.css */
function initIndexCssHelper(path){
	fs.readdir(path, function(err, files){
		for(let i in files){
			var f = fs.statSync(path+"/"+files[i]);
			if(f.isFile()){
				if(files[i].includes(".css") && !files[i].includes("~")){
					index.css.push({path: path+"/"+files[i], serve: path.replace(__dirname+"/css/", "") + "/"+files[i]});
				}
			}else if(f.isDirectory()){
				initIndexCssHelper(path+"/"+files[i]);
			}
		}
	});
}

/* This helps add all the js files into index.js */
function initIndexJsHelper(path){
	fs.readdir(path, function(err, files){
		for(let i in files){
			var f = fs.statSync(path+"/"+files[i]);
			if(f.isFile()){
				if(files[i].includes(".js") && !files[i].includes("~")){
					index.js.push({path: path+"/"+files[i], serve: path.replace(__dirname+"/js/", "") + "/"+files[i] });
				}
			}else if(f.isDirectory()){
				initIndexJsHelper(path+"/"+files[i]);
			}
		}
	});
}

/* This helps add all the media files into index.media */
function initIndexMediaHelper(path){
	fs.readdir(path, function(err, files){
		for(let i in files){
			var f = fs.statSync(path+"/"+files[i]);
			if(f.isFile()){
				if(!files[i].includes("~") && !files[i].includes("DS_Store")){
					index.media.push({path: path+"/"+files[i], serve: path.replace(__dirname+"/media/", "") + "/"+files[i]});
				}
			}else if(f.isDirectory()){
				initIndexMediaHelper(path+"/"+files[i]);
			}
		}
	});
}

/* This helps add all the api js files into index.api */
function initIndexApiHelper(path){
	fs.readdir(path, function(err, files){
		for(let i in files){
			var f = fs.statSync(path+"/"+files[i]);
			if(f.isFile()){
				if(files[i].includes(".js") && !files[i].includes("~")){
					index.api.push({path: path+"/"+files[i], serve: (path.replace(__dirname+"/api/", "") + "/" + files[i]).replace(".js", "")});
				}
			}else if(f.isDirectory()){
				initIndexApiHelper(path+"/"+files[i]);
			}
		}
	});
}

function initIndexMacroHelper(path){
	fs.readdir(path, function(err, files){
		for(let i in files){
			var f = fs.statSync(path+"/"+files[i]);
			if(f.isFile()){
				if((files[i].includes(".html") || files[i].includes(".hbs") || files[i].includes(".handlebars")) && !files[i].includes("~")){
					index.macro.push({path: path+"/"+files[i], serve: (path.replace(__dirname+"/macro/", "") + "/" + files[i]).replace(new RegExp(".html", "g"), "").replace(new RegExp(".hbs", "g"), "").replace(new RegExp(".handlebars", "g"), "") });
				}
			}else if(f.isDirectory()){
				initIndexMacroHelper(path+"/"+files[i]);
			}
		}
	});
}

/* 
   This takes a request and returns the relevent query string 
   from it. 
*/
function extractQueryStringFromRequest(req){
	var q = url.parse(req.url, true).query;
	return q;
}
module.exports.extractQueryStringFromRequest = extractQueryStringFromRequest;

/* 
   This takes a request, and returns a promise with the relevent 
   JSON as a parameter. 
*/
function extractJSONFromRequest(req){
	var prom = new Promise(function(resolve, reject){
		var jsonString = "";
		req.on('data', function (data) {
			jsonString += data;
		});
		req.on('end', function () {
			if(jsonString != ""){
				resolve(JSON.parse(jsonString));
			}else{
				resolve("");
			}
		});
	});
	
	return prom;
}
module.exports.extractJSONFromRequest = extractJSONFromRequest;

/* This little baby is used to get the cookies out of a request. */
function extractCookiesFromRequest(req){
	var cookies = {},
	rc = req.headers.cookie;

	rc && rc.split(';').forEach(function( cookie ) {
		var parts = cookie.split('=');
		cookies[parts[0].trim()] = decodeURI(parts.slice(1).join('='));
	});
	return cookies;
}
module.exports.extractCookiesFromRequest = extractCookiesFromRequest;

/* 
   This nice little function just generates a random id of letters 
   and numbers at the length of the param "lengthOfRandomId". 
*/
function generateRandomId(lengthOfRandomId){
	var id = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	
	for (let i = 0; i < lengthOfRandomId; i++){
		id += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return id;
	
}
module.exports.generateRandomId = generateRandomId;

/*
   This function is what we call on each html file string before 
   handing it over to handlebars so that we can use all of the 
   html macro.
*/
function htmlMacro(fileString){
	var result = fileString;
	for(let needsCheck = true, k = 0; needsCheck && k < 25; k++){
		needsCheck = false;
		for(let i in index.macro){
			if(result.includes("@MACRO=" + index.macro[i].serve) ){
				needsCheck = true;
				result = (""+result).replace(new RegExp( ("@MACRO=" + index.macro[i].serve), "g"), fs.readFileSync(index.macro[i].path) );
			}
		}
	}
	return result;
}
module.exports.htmlMacro = htmlMacro;

/* This is the actual server that does all of the work. */
const server = http.createServer(options, function(req, res){
	/* If this is never set to true, then we servee a 404. */
	var triggered = false;
	
	/* This is the path of the url. */
	var pathname = url.parse(req.url).pathname;
	
	/* 
	   This looks at the url, and sees if it is contained 
	   inside of index.html. If it is, it servees the 
	   relevent webpage. For handlebars files, make sure 
	   to include a js file with the same name. This new 
	   js file is responsible for giving the required 
	   information to the handlebars file. It must have a 
	   main function, which returns an object that will 
	   be parsed to JSON and given to the handlebars file.
	*/
	for(let i in index.html){
		if("/"+index.html[i].serve == pathname){
			triggered = true;
			res.statusCode = 200;
			res.setHeader("Content-Type", "text/html");
			var ext = path.extname(index.html[i].path);
			if(ext == ".html"){
				res.end( htmlMacro(fs.readFileSync(index.html[i].path)) );
			}else if(ext == ".hbs" || ext == ".handlebars"){
				var jsPath = index.html[i].path.replace(new RegExp(".hbs", "g"), ".js").replace(new RegExp(".handlebars", "g"), ".js");
				/* Hopefully the accompanying js file exists. If it doesn't, we just give it a default object to work with. */
				var jsAccompanies = fs.existsSync(jsPath);
				var outputString = "";
				if(jsAccompanies){
					var toUse = require( jsPath );
					var template = handlebars.compile( ""+htmlMacro(fs.readFileSync(index.html[i].path)) );
					toUse.main(req).then(function(hbsResult){
						outputString = template( hbsResult );
						res.end(outputString);
					}).catch(function(rejection){
						res.statusCode = 500;
						res.end("<h1>Error 500: Internal server error :(</h1>\n<pre>" + rejection + "</pre>");
						callback(new Error("Ok, so something went wrong probably involving handlebars: " + rejection));
					});
				}else{
					var template = handlebars.compile( ""+fs.readFileSync(index.html[i].path) );
					outputString = template( JSON.stringify({}) );
					res.end(outputString);
				}
				
			}
			
		}
	}
	/* 
	   This looks at the url, and sees if it is contained 
	   inside of index.css. If it is, it servees the 
	   relevent css file. 
	*/
	for(let i in index.css){
		if("/"+index.css[i].serve == pathname){
			triggered = true;
			res.statusCode = 200;
			res.setHeader("Content-Type", "text/css");
			res.end(fs.readFileSync(index.css[i].path));
		}
	}
	/* 
	   This looks at the url, and sees if it is contained 
	   inside of index.js. If it is, it servees the 
	   relevent js file. 
	*/
	for(let i in index.js){
		if("/"+index.js[i].serve == pathname){
			triggered = true;
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/javascript");
			res.end(fs.readFileSync(index.js[i].path));
		}
	}
	/* 
	   This looks at the url, and sees if it is contained 
	   inside of index.media. If it is, it servees the 
	   relevent media file. 
	*/
	for(let i in index.media){
		if("/"+index.media[i].serve == pathname){
			triggered = true;
			res.statusCode = 200;
			res.end(fs.readFileSync(index.media[i].path));
		}
	}
	/* 
	   This looks at the url, and sees if it is contained 
	   inside of index.reddir. If it is, it reddirects 
	   users to the correct webpage. 
	*/
	for(let i in index.reddir){
		if(index.reddir[i].from == pathname){
			triggered = true;
			res.writeHead(302, {Location: index.reddir[i].to.trim()});
			res.end();
		}
	}
	/* 
	   This looks at the url, and sees if it is contained 
	   inside of index.api. If it is, and the request type 
	   in post, it runs the relevent api js file's main
	   function. 
	*/
	if(req.method.toLowerCase() != "get"){
		for(let i in index.api){
			if("/"+index.api[i].serve == pathname){
				triggered = true;
				var required = require(index.api[i].path);
				required.main(req, res);
			}
		}
	}
	
	/* This servers a criminally basic 404 page. */
	if(!triggered){
		res.end("<h1>404: Sorry, but we couldn't find that page.</h1>");
	}
});
module.exports.server = server;