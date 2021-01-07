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
	console.log("[" + connectionDB.state + "] to database: " + connectionDB.config.database +
				" as user: " + connectionDB.config.user);
});



// Create server routes
app.get('/', printRequest, function (req, res) {
	
	// Find the first products in database an show them in home page
	fs.readFile( __dirname + '/queries/last_products.sql','utf8', function(err, data) {
		if(err){
			res.status(500).send();
			throw err;
		}
		connectionDB.query(data, function (err, result) {
			if (err){
				res.status(500).send();
				throw err;
			} else {
				if(result.length !== 0){
					result.forEach(function (item, index) {
						if(item.DescriptionImage != null){
							item.DescriptionImage = 
								Buffer.from(item.DescriptionImage).toString('base64');
						}
//						console.log(item.DescriptionImage);
					});
					res.status(200).render('index',{products:result});
				} else {
					res.status(404).render('index',{products:result});
				}
//				console.log(result);
			}
		});
	});

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

app.post('/customer/register', printRequest, upload.none(), function (req, res) {
	// Create new customer in database with req body data
	
	// Test with predefined values
//	let testCustomer  = {IdentityNumber: 1010101, Name: 'Node JS Customer', 
//			Password: "neverGuess", Email: "node@test.com", Phone: 0101010, 
//			Address:"Node js house USA", Age:1000};
	
	let newCustomer = req.body;
	
	// To handle optional properties
	for (var prop in newCustomer) {
	    if (Object.prototype.hasOwnProperty.call(newCustomer, prop)) {
	        if(newCustomer[prop] === ''){
	        	newCustomer[prop] = null;
	        }
	    }
	}
	// Seems that JSON has problems with numbers starting with 0, so we send them as String and convert them
	newCustomer.IdentityNumber = parseInt(newCustomer.IdentityNumber, 10);
	newCustomer.Phone = parseInt(newCustomer.Phone, 10);
//	console.log(newCustomer);
	
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
			if(result.affectedRows === 1){
				console.log("New customer registered");
			    // Send confirmation to client
				res.status(201).send(newCustomer);
			} else {
				res.status(500).send();
			}
		});
	});
});

app.post('/customer/login', printRequest, upload.none(), function (req, res) {
	// Check customer is in database and retrieve its data and shopping carts
	
	// Test with predefined values
//	let testCustomer  = {IdentityNumber: 123456789, Password: "test"};
//	let inserts = [testCustomer.IdentityNumber, testCustomer.Password];
	
//	console.log(req.body);
	let inserts = [req.body.IdentityNumber, req.body.Password];
	
	fs.readFile( __dirname + '/queries/find_customer.sql','utf8', function(err, data) {
		let sql = mysql.format(data, inserts);
//		console.log(sql);
		connectionDB.query(sql, function (err, result) {
			if (err){
				res.status(500).send();
				throw err;
			} else {
				if(result.length !== 0){
					res.status(200).send(result);
				} else {
					res.status(400).send();
				}
//				console.log(result);
			}
		});
	});
});

//Retrieve the customer shopping carts
app.get('/customer/:customerId/shoppingCarts', printRequest, function (req, res) {
	
	let customer = req.params.customerId;
	let shopCarts = [];
	let promisedProducts = [];
	fs.readFile( __dirname + '/queries/find_all_customer_shopcart.sql','utf8', function(err, data) {
		if(err){
			res.status(500).send();
			throw err;
		}
		let shopcartsQuery = data;
		fs.readFile( __dirname + '/queries/find_products_shopcart.sql','utf8', function(err, data) {
			if(err){
				res.status(500).send();
				throw err;
			}
			let productsInShopcartsQuery = data;
			connectionDB.query(shopcartsQuery, customer, function (err, result) {
				if (err){
					res.status(500).send();
					throw err;
				} else {
					console.log(result);
					if(result.length !== 0){
						result.forEach(function (item, index) {
							let shopCart = item;
							shopCart.products = [];
							promisedProducts.push(new Promise(function(resolve, reject){
								connectionDB.query(productsInShopcartsQuery, shopCart.Shopping_cartID, 
										function (err, result) {
									if (err){
										// No need to send response here since we return a Promise
//										res.status(500).send();
//										throw err;
										console.log("Promise rejected");
										reject(err);
									} else {
										if(result.length !== 0){
											result.forEach(function (item, index) {
												// Add product to shopping cart object array
//												console.log("Object name is: " + item.constructor.name)
												if(item.Quantity > item.TotalQuantity){
													item.QuantityAlert = 1;
												}
//												console.log(item);
												if(item.DescriptionImage != null){
													item.DescriptionImage = 
														Buffer.from(item.DescriptionImage).toString('base64');
												}
												shopCart.products.push(item);
											});
										}
										// Add shopping cart with products to the list of Customer's shopping carts
//										console.log(shopCarts);
										shopCarts.push(shopCart);
										// To return successfully from Promise
										resolve();
									}
									/* Do not send response to client here, as it will respond once for every shopping cart.
									   To solve this issue we return promises and wait for completion of all of them
									*/
//									console.log(shopCarts);
//									res.status(200).render('client',{shoppingCarts:shopCarts});
//									res.status(200).send(shopCarts);
								});
							}));
						});
//						console.log(promisedProducts);
//						console.log(shopCarts);
						Promise.all(promisedProducts)
						.then(function(){ // Results are stored in function variable "shopCarts"
//							console.log(shopCarts);
							res.status(200).render('client',{shoppingCarts: shopCarts});
						})
						.catch(function(err){
							res.status(500).send();
							throw err;
						});
					} else {
						// We found this customer has not created a shopping cart yet
						res.status(200).render('client',{shoppingCarts:shopCarts});
						/* It makes no sense to answer with 404 since the customer has to be logged in 
						to access this path, which means the resource should be available
						*/
//						res.status(404).render('client',{shopCarts:shopCarts});
					}
				}
			});
		});
	});
	// Do not send the response here, as queries have not been executed yet, remember the event handlers in Node!
});

//Add product to customer shopping cart
app.put('/customer/:customerId/product/:productId', printRequest, function (req, res) {
	let customer = req.params.customerId;
	let product = req.params.productId;
	let quantity = req.body.quantity;
	
	fs.readFile( __dirname + '/queries/find_customer_shopcart.sql','utf8', function(err, data) {
		let searchCartQuery = data;
		fs.readFile( __dirname + '/queries/create_customer_shopcart.sql','utf8', function(err, data) {
			let createCartQuery = data;
			fs.readFile( __dirname + '/queries/add_product_shopcart.sql','utf8', function(err, data) {
				let addProductToCartQuery = data;
				connectionDB.beginTransaction(function(err) {
					if (err) { 
						throw err;
						res.status(500).send();
					}
					// Find if customer has a shopping cart to add the products in
					let actualShoppingCarts = [];
					// Code with events
					// The query already filters shoppping carts and retrieves those unpurchased
					connectionDB.query(searchCartQuery, customer)
					.on('error', (err) => {
						res.status(500).send();
						return connectionDB.rollback(function() {
							throw err;
						});
					}).on('result', (result) => {
						actualShoppingCarts.push(result);
					// The 'end' event does not provide any data, just announces the end of results
					}).on('end', () => {
						console.log("Customers shopping carts unpurchased:");
						// Use promise to converge both paths: when shopping cart is found, and when one needs to be created
						new Promise(function(resolve, reject){
							console.log(actualShoppingCarts);
							if(actualShoppingCarts.length){
								return resolve(actualShoppingCarts[0].Shopping_cartID);
							}
							// If customer has any unpurchased shopping cart, create one
							connectionDB.query(createCartQuery, customer)
							.on('error', (err) => {
								if(err.code === 'ER_DUP_ENTRY'){
									res.status(400).send();
								} else {
									res.status(500).send();
								}
								return reject(err);
							}).on('result', (result) => {
								console.log("Customers new shopping carts:");
								console.log(result);
								return resolve(result.insertId);
							});
						}).then(function(shoppingCartId){
							//TODO: Change last input argument to be the product qunatity
							connectionDB.query(addProductToCartQuery, [shoppingCartId, product, quantity])
							.on('error', (err) => {
								// The product is already present in shopping cart, we just need to increase its quantity
								if(err.code === 'ER_DUP_ENTRY'){
									fs.readFile( __dirname + '/queries/update_quantity_shopcart.sql','utf8', function(err, data) {
										connectionDB.query(data, [quantity, shoppingCartId, product])
										.on('error', (err) => {
											res.status(400).send();
											return connectionDB.rollback(function() {
												throw err;
											});
										}).on('result', (result) => {
											if(result.affectedRows === 1){
												connectionDB.commit(function(err) {
													if (err) {
														res.status(500).send();
														return connectionDB.rollback(function() {
															throw err;
														});
													}
													console.log('Successfull transaction to update product quantity into shopping cart!');
//													console.log(result);
													res.status(200).send(result);
												});
											} else {
												console.log('Transaction failed to update product quantity into shopping cart! :(');
												res.status(400).send();
												return connectionDB.rollback(function() {
													throw err;
												});
											}
										});
									});
								} else {
									res.status(500).send();
									return connectionDB.rollback(function() {
										throw err;
									});
								}
							}).on('result', (result) => {
								connectionDB.commit(function(err) {
									if (err) {
										res.status(500).send();
										return connectionDB.rollback(function() {
											throw err;
										});
									}
									console.log('Successfull transaction to add product into shopping cart!');
//									console.log(result);
									res.status(200).send(result);
								});
							});
						}).catch(function(err){
							res.status(500).send();
							return connectionDB.rollback(function() {
								throw err;
							});
						});
					});
					
					// Code with callbacks
					/*
					connectionDB.query(searchCartQuery, customer, function (error, result, fields) {
						if (error) {
							return connectionDB.rollback(function() {
								throw error;
							});
						} else {
							// The query "result" is an array
							shoppingCart = result[0].Shopping_cartID;
							console.log("Shopping cart found: " + shoppingCart); 
							// If customer has no shopping cart, create one
							if (shoppingCart.length == 0){
								connectionDB.query(createCartQuery, customer, function (error, result, fields) {
									if (error) {
										return connectionDB.rollback(function() {
											throw error;
										});
									} else {
										shoppingCart = result[0].Shopping_cartID;
										// addProductToCart(shoppinCart, product);
										connectionDB.query(addProductToCartQuery, [shoppingCart, product], function (error, result, fields) {
											if (error) {
												return connectionDB.rollback(function() {
													if(error.code === 'ER_DUP_ENTRY'){
														res.status(400).send();
													} else {
														throw error;
													}
												});
											} else {
												console.log(result);
												// End transaction with commit
												connectionDB.commit(function(err) {
													if (err) {
														return connectionDB.rollback(function() {
															throw err;
														});
													}
													console.log('Successfull transaction to add product into shopping cart!');
												});
											    // Send confirmation to client
												res.status(200).send(result);
											}
										});
										
									}
								});
							} else {
								// addProductToCart(shoppinCart, product);
								connectionDB.query(addProductToCartQuery, [shoppingCart, product], function (error, result, fields) {
									if (error) {
										return connectionDB.rollback(function() {
											if(error.code === 'ER_DUP_ENTRY'){
												res.status(400).send();
											} else {
												throw error;
											}
										});
									} else {
										console.log(result);
										// End transaction with commit
										connectionDB.commit(function(err) {
											if (err) {
												return connectionDB.rollback(function() {
													throw err;
												});
											}
											console.log('Successfull transaction to add product into shopping cart!');
										});
									    // Send confirmation to client
										res.status(200).send(result);
									}
								});
							}
						}
					}); // And more queries ...
					*/
				});
			});
		});
	});
});

app.post('/seller/register', printRequest, upload.none(), function (req, res) {
	// Create new seller in database with req body data
	
	let newSeller = req.body;
	
	// To handle optional properties
	for (var prop in newSeller) {
	    if (Object.prototype.hasOwnProperty.call(newSeller, prop)) {
	        if(newSeller[prop] === ''){
	        	newSeller[prop] = null;
	        }
	    }
	}
	
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
			if(result.affectedRows === 1){
				console.log("New seller registered");
			    // Send confirmation to client
				res.status(201).send(newSeller);
			} else {
				res.status(500).send();
			}
		});
	});
});

app.post('/seller/login', printRequest, upload.none(), function (req, res) {
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
				if(result.length !== 0){
					res.status(200).send(result);
				} else {
					res.status(400).send();
				}
//				console.log(result);
			}
		});
	});
});

app.get('/seller/:sellerId/products', printRequest, function (req, res) {
	// Check seller is in database and retrieve its selling products
	
	let seller = req.params.sellerId;
	console.log(seller);
	
	fs.readFile( __dirname + '/queries/find_seller_products.sql','utf8', function(err, data) {
		connectionDB.query(data, seller, function (err, result) {
			if (err){
				if(err.code === 'ER_EMPTY_QUERY'){
					res.status(404).send();
				} else {
					res.status(500).send();
					throw err;
				}
			}
			// Update webpage information
			if(result.length !== 0){
				result.forEach(function (item, index) {
					if(item.DescriptionImage != null){
						item.DescriptionImage = 
							Buffer.from(item.DescriptionImage).toString('base64');
					}
				});
				res.status(200).render('seller',{products:result});
			} else {
				res.status(404).render('seller',{products:result});
			}
		});
	});
});

app.get('/product/:productId', printRequest, getComments, function (req, res) {
	
	let product = req.params.productId;
	fs.readFile( __dirname + '/queries/find_product.sql','utf8', function(err, data) {
		connectionDB.query(data, product, function (err, result) {
			if (err){
				if(err.code === 'ER_EMPTY_QUERY'){
					res.status(404).send();
				} else {
					res.status(500).send();
					throw err;
				}
			}
			// Update webpage information
			if(result.length !== 0){
				result.forEach(function (item, index) {
					if(item.DescriptionImage != null){
						item.DescriptionImage = 
							Buffer.from(item.DescriptionImage).toString('base64');
					}
				});
				res.status(200).render('product',{product:result, comments: req.middlewareContent});
			} else {
				res.status(404).render('product',{product:result, comments: req.middlewareContent});
			}
		});
	});
});

function getComments(req, res, next) {
	let product = req.params.productId;
	let comments = [];
	fs.readFile( __dirname + '/queries/find_product_comments.sql','utf8', function(err, data) {
		connectionDB.query(data, product, function (err, result) {
			if (err){
				res.status(500).send();
				throw err;
			}
			console.log("Comments retrieved:")
			console.log(result);
			// Add information to request as new property
			req.middlewareContent = result;
			next(); // Express way to chain middlewares
		});
	});
}

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

app.put('/product', printRequest, upload.single("upload_image"), function (req, res) {
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
				res.status(500).send();
				throw err;
			}
		}).on('result', (result) => {
//			console.log(result);
		    // Send confirmation to client
			res.status(201).send(updates);
		});
	});
});

app.post('/product/:productId/comment', printRequest, upload.none(), function (req, res) {
	let newComment = req.body;
	newComment.Product = req.params.productId;
	// newComment object needs to have matching properties with database table to correctly insert data
	console.log(newComment);
	
	fs.readFile( __dirname + '/queries/create_comment.sql','utf8', function(err, data) {
		connectionDB.query(data, newComment)
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
			res.status(201).send(newComment);
		});
	});
});

app.delete('/product/:productId/shoppingCart/:shoppingCartId', printRequest, function (req, res) {
	
	let product = req.params.productId;
	let shoppingCart = req.params.shoppingCartId;
	
	fs.readFile( __dirname + '/queries/delete_shopcart_product.sql','utf8', function(err, data) {
		connectionDB.query(data, [shoppingCart, product] , function (err, result) {
			if (err){
				res.status(500).send();
				throw err;
			} else {
				console.log("Removed product with ID:" + product);
				res.status(200).send({deletedItems : result.affectedRows})
			}
		});
	});
	
});

//Buy products from shopping cart and decrease product quantity accordingly
app.put('/buy/:shoppingCartId', printRequest, function (req, res) {
	let shoppingCart = req.params.shoppingCartId;
	
	// Promise to wrap reading of SQL file queries
	new Promise(function(resolve, reject){
		// Missing query to update shopcart and mark as bought: buy_shopcart.sql
		fs.readFile( __dirname + '/queries/find_products_shopcart.sql','utf8', function(err, data) {
			if(err){
				return reject(err);
			}
			let productsInShopcart = data;
			fs.readFile( __dirname + '/queries/update_product_quantity.sql','utf8', function(err, data) {
				if(err){
					return reject(err);
				}
				let decreaseProductQuantity = data;
				fs.readFile( __dirname + '/queries/buy_shopcart.sql','utf8', function(err, data) {
					if(err){
						return reject(err);
					}
					let boughtShopCart = data;
					return resolve({queryProducts: productsInShopcart, queryUpdateQuantity: decreaseProductQuantity, queryBuyStatus: boughtShopCart});
				});
			});
		});
	}).then(function(queries){
		// Perform database queries to buy products
		connectionDB.beginTransaction(function(err) {
			if (err) {
				res.status(500).send();
				throw err;
			}
			connectionDB.query(queries.queryProducts, shoppingCart, function (error, result, fields) {
				if (error) {
					res.status(500).send();
					return connectionDB.rollback(function() {
						throw error;
					});
				}
				let promisedQuantityRemoval = [];
				let nProducts = 0;
				// For each product perform a query to decrease the quantity bought
				result.forEach(function (item, index) {
					promisedQuantityRemoval.push(new Promise(function(resolve, reject){
						connectionDB.query(queries.queryUpdateQuantity, [item.Quantity, item.ProductID], function (error, result, fields) {
							if (error) {
								return reject(error);
							}
							nProducts++;
							return resolve();
						});
					}));
				});
				Promise.all(promisedQuantityRemoval)
				.then(function(){
					// Update shopping cart status to flag as bought by customer
					connectionDB.query(queries.queryBuyStatus, shoppingCart, function (error, result, fields) {
						if (error) {
							res.status(500).send();
							return connectionDB.rollback(function() {
								throw error;
							});
						}
						// Finish transaction by committing all changes
						connectionDB.commit(function(err) {
							if (err) {
								return connectionDB.rollback(function() {
									throw err;
								});
							}
							console.log("Products found in shopping cart:" + result.length + ", products stock updated:" + nProducts);
							console.log('Successfull transaction to buy products!');
							res.status(200).send({shoppingCartId:shoppingCart});
						});
					});
				})
				.catch(function(err){
					if (err.code === 'ER_DATA_OUT_OF_RANGE'){
						console.log('Transaction not completed given not enough product quantity to buy products!');
						res.status(400).send(err);
						return connectionDB.rollback(function() {
						});
					} else {
						res.status(500).send();
						return connectionDB.rollback(function() {
							throw err;
						});
					}
				});
			});
		});
	}).catch(function(err){
		res.status(500).send();
		throw err;
	});
});

app.get('/search', printRequest, function (req, res) {
	// Search all products that match the given product name
	
	let searchParam = req.query.searchWord;
	console.log("Performing a search with: " + searchParam);
	let searchSql = '%' + searchParam + '%';
	
	fs.readFile( __dirname + '/queries/search_product_name.sql','utf8', function(err, data) {
//		let sql = mysql.format(data, [updates, id]);
//		console.log(sql);
		connectionDB.query(data, searchSql, function (err, result) {
			if (err){
				res.status(500).send();
				throw err;
			}
			// Update webpage information
			if(result.length !== 0){
				result.forEach(function (item, index) {
					if(item.DescriptionImage != null){
						item.DescriptionImage = 
							Buffer.from(item.DescriptionImage).toString('base64');
					}
				});
				res.status(200).render('index',{products:result});
			} else {
				res.status(404).render('index',{products:result});
			}
		});
	});
});

// Set the root for the file path, to find other resources
// Place after routes otherwise app.get('/') never gets called
app.use('/' , express.static(path.join(__dirname ,'views')));
app.use('/images' , express.static(path.join(__dirname ,'images')));

// Handle errors in server
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something broke in the server!' +
			'This is probably the fault of the developer, do not worry');
});

// Assume 404 since no middleware responded
app.use(function (req, res, next) {
	res.status(404).send("Sorry can't find that! Check the url");
});

// Start the server, default port for http is 80
const server = app.listen(port, () => { 
	console.log(`Elshoppen server listening at http://localhost:${port}`);
}).on("error", (e) => {
	// Handle error event on server, 
	// i.e. when server listens on port < 1024 and does not have root privileges
	console.error(e.stack);
});

function shutDownServer(){
	server.close(() => {
		console.log("\nClosed server connections.");
		connectionDB.end();
	    console.log("Closed database connections.");
	    process.exit()
	  });
};

// Listen for TERM signal .e.g. kill
process.on ('SIGTERM', shutDownServer);

// Listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', shutDownServer); 

// Listen for exit event 
process.on('exit',shutDownServer); 


