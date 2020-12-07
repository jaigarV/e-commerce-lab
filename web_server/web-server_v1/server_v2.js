/**
 * http://usejsdoc.org/
 */

const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
const app = express();

// Switch to Express to crate the web server, instead of http
//const http = require('http');

// It is usually not necessary to use the stream module to consume streams
//const stream = require('stream');

const port = 80;

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

// Create server routes

app.get('/', function (req, res) {
	// Read file as a Stream
	const streamFile = fs.createReadStream(__dirname + '/views/Clothing_Store_v1.html')
		.on("error", (e) => { // Will be thrown in file is not found, for example
			console.error(e.stack);
			res.status(500).end();
		});
	streamFile.pipe(res);
	res.on("end", () => res.end());
});

app.get('/query', function (req, res) {
	// Specify encoding "utf8" to retrieve string, instead of the raw buffer returned otherwise.
	fs.readFile( __dirname + '/queries/find_customers.sql','utf8', function(err, data) {
		connectionDB.query(data, function (err, result, fields) {
			if (err){
				console.error(err.stack);
				throw err;
			}
		    console.log(result);
			res.send(result);
		});
	});
});

//Start the server, default port for http is 80
app.listen(port, () => { 
	console.log(`Example app listening at http://localhost:${port}`)
});

