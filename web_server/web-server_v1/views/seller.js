/**
 * http://usejsdoc.org/
 */

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
	
	// New product modal
	document.getElementById("newProductForm").addEventListener('submit', newProductRequest);

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

function newProductRequest(){
	// To stop the default action of the form
	event.preventDefault();

	// This will be sent as multipart/form-data
	let loginForm = new FormData(document.getElementById("newProductForm"));
	loginForm.append("Seller", sessionStorage.getItem("userID"));
	
	// Send form data to server
	fetch('/product', {
		method: 'POST',
		body: loginForm 
	})
	.then(status)
	.then(response => response.json())
	.then(result => {
		if(result.length !== 0){
			window.location.reload(true);
			// Add icons or other UI elements for use by customers
		} else {
			document.getElementById('errorNewProduct').innerHTML = "The data entered is incorrect";
		}
	})
	.catch(function(error) {
//		console.log("The error msg is:" + error.message);
		if(error.message === "400"){
			document.getElementById('errorNewProduct').innerHTML = "Duplicate entry, product already exist";
		} else {
			console.log('New product request failed', error);
		}
	});
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

function printUser(){
	document.getElementById("sellerMessage").innerHTML = "Welcome " + sessionStorage.getItem("userName") + 
		" to the seller interface";
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