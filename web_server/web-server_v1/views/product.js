window.onload = init;

// Do when page finish to load (don't use document.write() or it will replace whole page)
function init() {
	// Add EventListener for left menu option when user clicks
	let LeftSideBarOptions = document.getElementsByClassName("acc-left-menu");
	for(let option of LeftSideBarOptions){
		option.addEventListener('click', toggleAccordion);
	}
	
	// Log out listener
	document.getElementById("logout").addEventListener('click', logoutUser);
	
	// Top menu icons
	document.getElementById("searchIcon").addEventListener('click', () => {
		toggleShowElement(document.getElementById("searchForm"));
	});
	
	document.getElementById("loginCustomerForm").addEventListener('submit', loginCustomerRequest);
	document.getElementById("loginSellerForm").addEventListener('submit', loginSellerRequest);
	
	document.getElementById("registerCustomerForm").addEventListener('submit', registerCustomerRequest);
	document.getElementById("registerSellerForm").addEventListener('submit', registerSellerRequest);
	
	document.getElementById("addToCartButton").addEventListener('click', addToCartRequest);
	
	document.getElementById("updateProductForm").addEventListener('submit', updateProductRequest);
	
	document.getElementById("postCommentButton").addEventListener('click', registerComment);
	// Configures the input to use \n as paragraph separator instead of <br>
	// -- Not working...
//	document.execCommand("defaultParagraphSeparator", false, "\n");
	
	let starRatings = document.getElementsByClassName("rating");
	for(let star of starRatings){
		star.addEventListener('mouseover', toggleStars);
		star.addEventListener('mouseleave', keepStars);
		star.addEventListener('click', setRating);
	}
	
	// Check if there is a user logged
	if(sessionStorage.getItem("userName") !== null){
		printUser();
		toggleUserMenu();
		if(sessionStorage.getItem("userType") == "customer"){
			toggleCustomerMenu();
			document.getElementById("shoppingCartIcon").addEventListener('click', showShoppingCarts);
		} else if (sessionStorage.getItem("userType") == "seller"){
			toggleSellerMenu();
			document.getElementById("briefcaseIcon").addEventListener('click', showSellerProducts);
		}
	} else {
		// Show user the accordion open as example
		document.getElementById("login").click();
	}
	
}

//Show and hide the accordions on menu click
function toggleAccordion(event) {
	let emitterId;
	if(event instanceof Event){
		emitterId = event.currentTarget.id;
	} else {
		emitterId = event.id;
	}
	
	let accordion = document.getElementById(emitterId + "Acc");
	toggleShowElement(accordion);
}

function logoutUser(){
	sessionStorage.clear();
	window.location.href = '/';
}

function showShoppingCarts(){
	// Make get request to server to retrieve the customer shopping cart web page
}

function showSellerProducts(){
	let sellerId = sessionStorage.getItem("userID");
	console.log("The seller Id is: " + sellerId);
	// The address should be /seller/:sellerId/products
	window.location.href = '/seller/' + sellerId + '/products';
}

function status(response) {
	if (response.ok) {
		return Promise.resolve(response);
	} else {
		return Promise.reject(new Error(response.statusText));
	}
}

function statusRegister(response) {
	if (response.ok) {
		return Promise.resolve(response);
	} else if(response.status === 400){
		return Promise.reject(new Error(response.status));
	} else {
		return Promise.reject(new Error(response.statusText));
	}
}


function loginCustomerRequest(event){
	// To stop the default action of the form
	event.preventDefault();

	// This will be sent as multipart/form-data
	let loginForm = new FormData(document.getElementById("loginCustomerForm"));
	
//	for(var pair of loginForm.entries()) {
//		   console.log(pair[0]+ ', '+ pair[1]);
//		}
	
	// If we need the original format of <form>, x-www-form-urlencoded
//	let loginForm = new URLSearchParams(new FormData(loginForm));
	
	// Send form data to server
	fetch('/customer/login', {
		method: 'POST',
		body: loginForm 
	})
	.then(status)
	.then(response => response.json())
	.then(result => {
		if(result.length !== 0){
			sessionStorage.clear();
			sessionStorage.setItem("userID", result[0].IdentityNumber);
			sessionStorage.setItem("userName", result[0].Name);
			sessionStorage.setItem("userType", "customer");
			window.location.reload(false);
			// Add icons or other UI elements for use by customers
		} else {
			document.getElementById('errorCustomerLogin').innerHTML = "The login data is incorrect";
		}
	})
	.catch(function(error) {
	    console.log('Customer login request failed', error);
	});
}

function loginSellerRequest(event){
	// To stop the default action of the form
	event.preventDefault();

	let loginForm = new FormData(document.getElementById("loginSellerForm"));
	
	// Send form data to server
	fetch('/seller/login', {
		method: 'POST',
		body: loginForm 
	})
	.then(status)
	.then(response => response.json())
	.then(result => {
		if(result.length !== 0){
			sessionStorage.clear();
			sessionStorage.setItem("userID", result[0].OrganizationID);
			sessionStorage.setItem("userName", result[0].Name);
			sessionStorage.setItem("userType", "seller");
			window.location.reload(false);
			// Add icons or other UI elements for use by customers
		} else {
			document.getElementById('errorSellerLogin').innerHTML = "The login data is incorrect";
		}
	})
	.catch(function(error) {
	    console.log('Seller login request failed', error);
	});
}

function registerCustomerRequest(event){
	// To stop the default action of the form
	event.preventDefault();

	let loginForm = new FormData(document.getElementById("registerCustomerForm"));
	
	// Send form data to server
	fetch('/customer/register', {
		method: 'POST',
		body: loginForm 
	})
	.then(statusRegister)
	.then(response => response.json())
	.then(result => {
		if(result.length !== 0){
			sessionStorage.clear();
			sessionStorage.setItem("userID", result.IdentityNumber);
			sessionStorage.setItem("userName", result.Name);
			sessionStorage.setItem("userType", "customer");
			window.location.reload(false);
			// Add icons or other UI elements for use by customers
		} else {
			document.getElementById('errorCustomerRegister').innerHTML = "The data entered is incorrect";
		}
	})
	.catch(function(error) {
//		console.log("The error msg is:" + error.message);
		if(error.message === "400"){
			document.getElementById('errorCustomerRegister').innerHTML = "Duplicate entry, you are already registered";
		} else {
			console.log('Customer register request failed', error);
		}
	});
}

function registerSellerRequest(event){
	// To stop the default action of the form
	event.preventDefault();

	let loginForm = new FormData(document.getElementById("registerSellerForm"));
	
	// Send form data to server
	fetch('/seller/register', {
		method: 'POST',
		body: loginForm 
	})
	.then(statusRegister)
	.then(response => response.json())
	.then(result => {
		if(result.length !== 0){
			sessionStorage.clear();
			sessionStorage.setItem("userID", result.OrganizationID);
			sessionStorage.setItem("userName", result.Name);
			sessionStorage.setItem("userType", "seller");
			window.location.reload(false);
			// Add icons or other UI elements for use by customers
		} else {
			document.getElementById('errorSellerRegister').innerHTML = "The data entered is incorrect";
		}
	})
	.catch(function(error) {
		if(error.message === "400"){
			document.getElementById('errorSellerRegister').innerHTML = "Duplicate entry, you are already registered";
		} else {
			console.log('Seller register request failed', error);
		}
	});
}

function addToCartRequest(){
	// Remeber to get the value property when dealing with html elements
	let productID = document.getElementById("ProductID").value;
	let customerID = sessionStorage.getItem("userID");
	let productQuantity = {quantity: document.getElementById("quantityAdd").value};
	 console.log("Send data -> ProductID:" + productID + ", userID:" + customerID + ", quantity:" + productQuantity.quantity);
	
	 // Send form data to server
	fetch('/customer/' + customerID + '/product/' + productID, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(productQuantity)
	})
	.then(statusRegister)
	.then(response => response.json())
	.then(result => {
		if(result.length !== 0){
			console.log(result);
			let userMsg = document.getElementById("addProductShopcartMessage");
			userMsg.innerHTML = "The product has been added to shopping cart correctly";;
		} else {
			document.getElementById('"addProductShopcartErrorMessage"')
				.innerHTML = "The add product to shopping cart request has incorrect data";
		}
	})
	.catch(function(error) {
//		console.log("The error msg is:" + error.message);
		if(error.message === "400"){
			document.getElementById('addProductShopcartErrorMessage').innerHTML = "Duplicate entry, product already in shopping cart";
			let userMsg = document.getElementById('"addProductShopcartMessage"');
			userMsg.innerHTML = "Duplicate";
		} else {
			console.log('Add product to shopping cart request failed', error);
		}
	});
}

function updateProductRequest(event){
	// To stop the default action of the form
	event.preventDefault();

	// This will be sent as multipart/form-data
	let loginForm = new FormData(document.getElementById("updateProductForm"));
	loginForm.append("SellerID", sessionStorage.getItem("userID"));
	
	// Send form data to server
	fetch('/product', {
		method: 'PUT',
		body: loginForm 
	})
	.then(status)
	.then(response => response.json())
	.then(result => {
		if(result.length !== 0){
			window.location.reload(true);
			// Add icons or other UI elements for use by customers
		} else {
			document.getElementById('errorUpdateProduct').innerHTML = "The product was not updated, error data input?";
		}
	})
	.catch(function(error) {
//		console.log("The error msg is:" + error.message);
		console.log('New product request failed', error);
		
	});
}

function registerComment(){
	// Retrieve data from html elements
	let comment = document.getElementById("newComment");
	// At the moment this is only replacing the first <br> found, but is unnecessary now
//	let text = comment.innerHTML.replace("<br>", "\n");
	let text = comment.innerHTML;
	let rating = comment.dataset.rating;
	let productID = document.getElementById("ProductID").value;
	
	// This will be sent as multipart/form-data
	let commentForm = new FormData();
	commentForm.append("Author", sessionStorage.getItem("userID"));
	commentForm.append("Rating", rating);
	commentForm.append("Text", text);
	commentForm.append("Product", productID);
	
	console.log(...commentForm);
	// Send form data to server
	fetch('/product/' + productID + '/comment', {
		method: 'POST',
		body: commentForm
	})
	// Keep modifying
	.then(statusRegister)
	.then(response => response.json())
	.then(result => {
		let msgElement = document.getElementById("addCommentMessage");
		if(result.length !== 0){
//			console.log(result);
			if (msgElement.className.indexOf("w3-red") === -1) {
				msgElement.className = msgElement.className.replace(" w3-red", "");
			}
			msgElement.innerHTML = "The comment has been succesfully inserted!";
			setTimeout( ()=> { window.location.reload(true);}, 2000);
		} else {
			if (msgElement.className.indexOf("w3-red") === -1) {
				msgElement.className += " w3-red";
			}
			msgElement.innerHTML = "The comment could not be added, wrong data";
		}
	})
	.catch(function(error) {
//		console.log("The error msg is:" + error.message);
		if(error.message === "400"){
			let msgElement = document.getElementById('addCommentMessage')
			if (msgElement.className.indexOf("w3-red") === -1) {
				msgElement.className += " w3-red";
			}
			msgElement.innerHTML = "Duplicate entry, product already commented";
		} else {
			console.log('Add comment to product failed', error);
		}
	});
}

function toggleStars(event){
	// Get event trigger info
	let starId = event.currentTarget.id;
	let starIndex = Number(starId.charAt(4));
	for (let i = 5; i > 0; i--){
		let starElement = document.getElementById(starId.replace(/[0-9]+/,i.toString()));
		// Check if starts are active
		if(starElement.className.includes(" checked")){
			// If it is active but above rating turn it off
			if(i > starIndex){
				starElement.className = starElement.className.replace(" checked", "");
			}
		// If it is inactive but above or equal to rating turn it on
		} else if(i <= starIndex) {
			starElement.className += " checked";
		}
	}
}

function keepStars(event){
	let starId = event.currentTarget.id;
	let comment = document.getElementById("newComment");
	let rating = comment.dataset.rating
	for (let i = 5; i > 0; i--){
		let starElement = document.getElementById(starId.replace(/[0-9]+/,i.toString()));
		// Check if starts are active
		if(starElement.className.includes(" checked")){
			// If it is active but above rating turn it off
			if(i > rating){
				starElement.className = starElement.className.replace(" checked", "");
			}
		// If it is inactive but above or equal to rating turn it on
		} else if(i <= rating) {
			starElement.className += " checked";
		}
	}
}

function setRating(event){
	let starId = event.currentTarget.id;
	let starIndex = Number(starId.charAt(4));
	// Store rating as data in html element
	let comment = document.getElementById("newComment");
	comment.setAttribute("data-rating", starIndex);
}

function showShoppingCarts(){
	// Make get request to server to retrieve the customer shopping cart web page
	let customerId = sessionStorage.getItem("userID");
	console.log("The customer Id is: " + customerId);
	// The address should be /customer/:customerId/shoppingCarts
	window.location.href = '/customer/' + customerId + '/shoppingCarts';
}

function printUser(){
	document.getElementById("userMessage").innerHTML = "Welcome " + sessionStorage.getItem("userName") + "!";
}

function toggleUserMenu(){
	for(let element of document.getElementsByClassName("user-logged")){
		toggleShowElement(element);
	}
}

function toggleCustomerMenu(){
	for(let element of document.getElementsByClassName("customer-logged")){
		toggleShowElement(element);
	}
}

function toggleSellerMenu(){
	for(let element of document.getElementsByClassName("seller-logged")){
		toggleShowElement(element);
	}
}

function toggleShowElement(element){
	if (element.className.indexOf("w3-hide") === -1) {
		element.className += " w3-hide";
	} else {
		// Check to see fit there are other classes or not
		if(element.className.includes(" w3-hide")){
			element.className = element.className.replace(" w3-hide", "");
		} else {
			element.className = element.className.replace("w3-hide", "");
		}
		
	}
}

