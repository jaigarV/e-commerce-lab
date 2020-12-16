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
	
	document.getElementById("updateProductForm").addEventListener('submit', updateProductRequest);
	
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
	fetch('customer/login', {
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
	fetch('seller/login', {
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
	fetch('customer/register', {
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
	fetch('seller/register', {
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

function updateProductRequest(event){
	// To stop the default action of the form
	event.preventDefault();

	// This will be sent as multipart/form-data
	let loginForm = new FormData(document.getElementById("updateProductForm"));
//	loginForm.append("ProductID", sessionStorage.getItem(""));
	
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

