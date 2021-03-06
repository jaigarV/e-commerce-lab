/**
 * http://usejsdoc.org/
 */
// ----------------  Requires  ------------------

const fs = require('fs');
const mysql = require('mysql');
// Express is the most famous Node.js web application framework (npm install express)
const express = require('express');
// Multer is a popular Express middleware for handling multipart/form-data (images and text) (npm install multer)
const multer = require('multer');
// To get file extensions on uploads
const path = require('path');

//Switch to Express to crate the web server, instead of http
//const http = require('http');

//It is usually not necessary to use the stream module to consume streams
//const stream = require('stream');

//----------------  Configurations  ------------------

const app = express();

//Register ejs as .html. If we did not call this, we would need to name our views foo.ejs instead of foo.html.
app.engine('.html', require('ejs').__express);
// Set the root for the file path, to find other resources
app.use('/' , express.static(path.join(__dirname ,'views')));
app.use('/images' , express.static(path.join(__dirname ,'images')));


app.set('view engine', 'ejs'); // Register the template engine
app.set('views', './views'); // Specify the views directory

// Include parsing middleware before the routes
//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Specify how to store the uploaded files for Multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
    	// Remeber to create folder or it will crash
        cb(null, './images/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//    	cb(null, file.fieldname + path.extname(file.originalname));
    }
});

// Specify how to filter the uploaded files for Multer
const imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Add the Multer configuration
const upload = multer({ storage: storage, fileFilter: imageFilter });

// Port where the server will listen to
const port = 80;

// Log all the requests in the console with their method and sender
function printRequest(req, res, next) {
	console.log("Received request: " + req.method + " " + req.headers.host + " "+ req.url);
	next(); // Express way to chain middlewares
}

// Add MySQL database connection properties
const connectionDB = mysql.createConnection({
	host: "localhost",
	user: "jaigar",
	password: "arrowhead",
	database: "ecommerce_database"
});

//----------------  Connections and routes  ------------------

// Attempt connection to MySQL database
connectionDB.connect(function(err) {
	if (err){
		console.error('Error connecting: ' + err.stack);
		throw err;
	}
	console.log("Connected as id " + connectionDB.threadId);
});



// Create server routes
app.get('/', printRequest, function (req, res) {
	// Read file as a Stream
	const streamFile = fs.createReadStream(__dirname + '/views/index.html')
		.on("error", (e) => { // Will be thrown in file is not found, for example
			console.error(e.stack);
			res.status(500).end();
		});
	streamFile.pipe(res);
	res.on("end", () => res.end());
});

app.get('/test', printRequest, function (req, res) {
	// Read file as a Stream
	const streamFile = fs.createReadStream(__dirname + '/views/test.html')
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
//	let testCustomer  = {IdentityNumber: 1010101, Name: 'Node JS Customer', 
//			Password: "neverGuess", Email: "node@test.com", Phone: 0101010, 
//			Address:"Node js house USA", Age:1000};
	
	let newCustomer = req.body;
	// Seems that JSON has problems with numbers starting with 0, so we send them as String and convert them
	newCustomer.IdentityNumber = parseInt(newCustomer.IdentityNumber, 10);
	newCustomer.Phone = parseInt(newCustomer.Phone, 10);
	console.log(newCustomer);
	
	fs.readFile( __dirname + '/queries/create_customers.sql','utf8', function(err, data) {
		connectionDB.query(data, newCustomer)
		.on('error', (err) => {
			if(err.code === 'ER_DUP_ENTRY'){
				console.error(err);
				res.status(400).send(err.sqlMessage);
			} else {
				//console.error(err.stack);
				res.status(500).send();
				throw err;
			}
		}).on('result', (result) => {
//			console.log(result);
		    // Send confirmation to client
			res.status(201).send(newCustomer);
		});
	});
});

app.post('/customer/login', printRequest, function (req, res) {
	// Check customer is in database and retrieve its data and shopping carts
	
	// Test with predefined values
//	let testCustomer  = {IdentityNumber: 123456789, Password: "test"};
//	let inserts = [testCustomer.IdentityNumber, testCustomer.Password];
	
	let inserts = [req.body.IdentityNumber, req.body.Password];
	
	fs.readFile( __dirname + '/queries/find_customers.sql','utf8', function(err, data) {
		let sql = mysql.format(data, inserts);
//		console.log(sql);
		connectionDB.query(sql, function (err, result) {
			if (err){
				res.status(500).send();
				throw err;
			} else {
				if(result.lenght !== 0){
					res.status(200).send(result);
				} else {
					res.status(404).send();
				}
				console.log(result);
			}
		});
	});
});

app.post('/customer/shoppingCarts', printRequest, function (req, res) {
	// Show the customer shopping carts
	
});

app.post('/seller/register', printRequest, function (req, res) {
	// Create new seller in database with req body data
	
	let newSeller = req.body;
	// Seems that JSON has problems with numbers starting with 0, so we send them as String and convert them
	newSeller.OrganizationID = parseInt(newSeller.OrganizationID, 10);
	newSeller.Phone = parseInt(newSeller.Phone, 10);
	console.log(newSeller);
	
	fs.readFile( __dirname + '/queries/create_seller.sql','utf8', function(err, data) {
		connectionDB.query(data, newSeller)
		.on('error', (err) => {
			if(err.code === 'ER_DUP_ENTRY'){
				console.error(err);
				res.status(400).send(err.sqlMessage);
			} else {
				//console.error(err.stack);
				throw err;
			}
		}).on('result', (result) => {
//			console.log(result);
		    // Send confirmation to client
			res.status(201).send(newSeller);
		});
	});
});

app.post('/seller/login', printRequest, function (req, res) {
	// Check seller is in database and retrieve its selling products
	
	let inserts = [req.body.OrganizationID, req.body.Password];
	
	fs.readFile( __dirname + '/queries/find_seller.sql','utf8', function(err, data) {
		let sql = mysql.format(data, inserts);
//		console.log(sql);
		connectionDB.query(sql, function (err, result) {
			if (err){
				res.status(500).send();
				throw err;
			} else {
				if(result.lenght !== 0){
					res.status(200).send(result);
				} else {
					res.status(404).send();
				}
				console.log(result);
			}
		});
	});
});

app.post('/product', printRequest, upload.single("upload_image"), function (req, res) {
	// Create new product in database with req body data
	
	let newProduct = req.body;
	console.log(newProduct);
	
	newProduct.Seller = parseInt(newProduct.Seller, 10);
	
	if(req.file){
		newProduct.DescriptionImage = fs.readFileSync(req.file.path);
	}
	
	// Handle possible file upload -- Not working
//	upload(req, res, function (err) {
//		if(req.file){
//			if (req.fileValidationError) {
//	            return res.status(400).send(req.fileValidationError);
//	        } else if (err){
//	        	res.status(500).send();
//	        	throw err;
//	        } else {
//	        	newProduct.DescriptionImage = req.file;
//	        }
//		}
//	});
	
	fs.readFile( __dirname + '/queries/create_product.sql','utf8', function(err, data) {
//		let sql = mysql.format(data, newProduct);
//		console.log(sql);
		connectionDB.query(data, newProduct)
		.on('error', (err) => {
			if(err.code === 'ER_DUP_ENTRY'){
				console.error(err);
				res.status(400).send(err.sqlMessage);
			} else {
				//console.error(err.stack);
				throw err;
			}
		}).on('result', (result) => {
//			console.log(result);
		    // Send confirmation to client
			res.status(201).send(newProduct);
		});
	});
});

app.post('/product/update', printRequest, upload.single("upload_image"), function (req, res) {
	// Update product in database with req body data
	
	let updates = req.body;
	Object.keys(updates).forEach((key) => {
		if(updates[key] == undefined || updates[key] == null || updates[key] === "") {
			delete updates[key];
		}
	});
	console.log(updates);
	
	let id = updates.ProductID;
	delete updates.ProductID;
	
	if(req.file){
		updates.DescriptionImage = fs.readFileSync(req.file.path);
	}
	
	fs.readFile( __dirname + '/queries/update_product.sql','utf8', function(err, data) {
//		let sql = mysql.format(data, [updates, id]);
//		console.log(sql);
		connectionDB.query(data, [updates, id])
		.on('error', (err) => {
			if(err.code === 'ER_DUP_ENTRY'){
				console.error(err);
				res.status(400).send(err.sqlMessage);
			} else {
				//console.error(err.stack);
				throw err;
			}
		}).on('result', (result) => {
//			console.log(result);
		    // Send confirmation to client
			res.status(201).send(updates);
		});
	});
});

app.put('/buy/:product', printRequest, function (req, res) {
	// Buy product with specified productID = decrease product quantity by 1 
});

app.get('/search/:productName', printRequest, function (req, res) {
	// Search all products that match the given product name
	
	console.log(req.body);
	console.log(req.params);
	
	fs.readFile( __dirname + '/queries/search_product_name.sql','utf8', function(err, data) {
		connectionDB.query(data, req.params.productName, function (err, result) {
			if (err){
				console.error(err.stack);
				throw err;
			}
		    console.log(result);
		    
		    // Update webpage information
		    res.render('index.html', {status: 'good'});
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
	res.status(500).send('Something broke in the server!' +
			'This is probably the fault of the developer, do not worry');
});

// Assume 404 since no middleware responded
app.use(function (req, res, next) {
	res.status(404).send("Sorry can't find that! Check the url");
});

//Start the server, default port for http is 80
app.listen(port, () => { 
	console.log(`Elshoppen server listening at http://localhost:${port}`);
}).on("error", (e) => {
	// Handle error event on server, 
	// i.e. when server listens on port < 1024 and does not have root privileges
	console.error(e.stack);
});

