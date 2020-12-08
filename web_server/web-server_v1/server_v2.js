/**
 * http://usejsdoc.org/
 */

const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
const app = express();

app.set('views', './views') // Specify the views directory
app.set('view engine', 'ejs') // Register the template engine

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

function printRequest(req, res, next) {
	console.log("Received request: " + req.method + " " + req.headers.host + " "+ req.url);
	next();
}

// Create server routes

app.get('/', printRequest, function (req, res) {
	// Read file as a Stream
	const streamFile = fs.createReadStream(__dirname + '/views/Homepage_v1.html')
		.on("error", (e) => { // Will be thrown in file is not found, for example
			console.error(e.stack);
			res.status(500).end();
		});
	streamFile.pipe(res);
	res.on("end", () => res.end());
});

app.post('/customer/register', printRequest, function (req, res) {
	// Create new customer in database with req body data
	
	// Test with predefined values
	let queryValues  = {id: 1, title: 'Hello MySQL'};
	
	fs.readFile( __dirname + '/queries/create_customers.sql','utf8', function(err, data) {
		connectionDB.query(data, queryValues, function (err, result) {
			if (err){
				console.error(err.stack);
				throw err;
			}
		    console.log(result);
		    
		    // Send confirmation to client
//			res.send(result);
		});
	});
});

app.put('/customer/login', printRequest, function (req, res) {
	// Check customer is in database and retrieve its data and shopping carts
});

app.post('/seller/register', printRequest, function (req, res) {
	// Create new seller in database with req body data
});

app.put('/seller/login', printRequest, function (req, res) {
	// Check seller is in database and retrieve its selling products
});

app.post('/product', printRequest, function (req, res) {
	// Create new product in database with req body data
});

app.put('/product', printRequest, function (req, res) {
	// Update product in database with req body data
});

app.put('/buy/:product', printRequest, function (req, res) {
	// Buy product with specified productID = decrease product quantity by 1 
});

app.get('/search/:productName', printRequest, function (req, res) {
	// Search all products that match the given product name
	
	fs.readFile( __dirname + '/queries/search_product_name.sql','utf8', function(err, data) {
		connectionDB.query(data, req.params.productName, function (err, result) {
			if (err){
				console.error(err.stack);
				throw err;
			}
		    console.log(result);
		    
		    // Update webpage information
		    res.render('shark.html', {status: 'good'});
		});
	});
});

app.get('test/query', printRequest, function (req, res) {
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

app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something broke! This is probably the fault of the developer, do not worry');
});

// Assume 404 since no middleware responded
app.use(function (req, res, next) {
	res.status(404).send("Sorry can't find that! Check the url");
});

//Start the server, default port for http is 80
app.listen(port, () => { 
	console.log(`Example app listening at http://localhost:${port}`);
});

