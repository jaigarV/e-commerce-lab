/**
 * http://usejsdoc.org/
 */

const http = require('http');
const fs = require('fs');
const mysql = require('mysql');

// It is usually not necessary to use the stream module to consume streams
//const stream = require('stream');

function makeReqCounter() {
	let nreq = 0;
	return (maxRequest) => {
		nreq++;
		console.log(nreq);
		if (nreq === maxRequest){
			console.log("Server status before shutting it down: \n");
			console.log(server);
			server.close();
		}
	};
}

// Add MySQL database connection properties
const connectionDB = mysql.createConnection({
	host: "localhost",
	user: "jaigar",
	password: "arrowhead",
	database: "ecommerce_database"
});

// Attempt connection to MySQL database
connectionDB.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
});

// Create server with node HTTP module

//Stop server after n=maxRequest client request received, and current connections timeout
const reqCounter = makeReqCounter();

// Create server
const server = http.createServer(function (req, res) {
	
	// Log input request
	console.log("Received request: " + req.method + " " + req.headers.host + " "+ req.url);
	
	if(req.url === "/"){
		// Respond with HTML web page
		res.writeHead(200, {'Content-Type': 'text/html'});
		// Read file as a Stream
		const streamFile = fs.createReadStream(__dirname + '/views/Clothing_Store_v1.html')
			.on("error", (e) => { // Will be thrown in file is not found, for example
				console.error(e.stack);
				res.writeHead(500);
				res.end();
			});
		streamFile.pipe(res);
		res.on("end", () => res.end());
		
		// Read file without Streams
//		fs.readFile( __dirname + '/Clothing_Store_v1.html', function(err, data) {
//			res.write(data);
//		    return res.end();
//		});

	}
	else if (req.url === "/query"){
		// Specify encoding "utf8" to retrieve string, instead of the raw buffer returned otherwise.
		fs.readFile( __dirname + '/queries/find_customers.sql','utf8', function(err, data) {
			connectionDB.query(data, function (err, result, fields) {
				if (err){
					console.error(err.stack);
					throw err;
				}
			    console.log(result);
			    // Can not return array to res.write();
				res.write(JSON.stringify(result));
			    return res.end();
			});
		});
	}
	
	// Stop server after n request
	//reqCounter(8);
	
}).on("error", (e) => {
	// Handle error event on server, i.e. when server listens on port < 1024 and does not have root privileges
	console.error(e.stack);
}).listen(80); // Default port for http is 80, so no need to specify port in the browser but need root privileges to execute






