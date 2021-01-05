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
	
	// Buy products buttons
	let buyProductButtons = document.getElementsByClassName("buy-product");
	for(let button of buyProductButtons){
		button.addEventListener('click', buyProduct);
	}
	
	// Delete products buttons
	let deleteProductButtons = document.getElementsByClassName("delete-product");
	for(let button of deleteProductButtons){
		button.addEventListener('click', deleteProduct);
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
	
	if (window.location.hash == '#reload-buy') {
		let shopcartId = sessionStorage.getItem("shopcartID");
		document.getElementById("buyMsg"+shopcartId).innerHTML = "Buy transaction successful!";
	} else {
		sessionStorage.removeItem("shopcartID");
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
	let customerId = sessionStorage.getItem("userID");
	console.log("The customer Id is: " + customerId);
	// The address should be /customer/:customerId/shoppingCarts
	window.location.href = '/customer/' + customerId + '/shoppingCarts';
}

function status(response) {
	if (response.ok) {
		return Promise.resolve(response);
	} else {
		return Promise.reject(new Error(response.statusText));
	}
}

function statusRegister2(response) {
	if (response.ok) {
		return Promise.resolve(response);
	} else if(response.status === 400){ // Indicates bad request from client
		/* If we create an Error we loose the response object as it only passes a String representation 
		 * of the object in its "message" property
		 */
		return Promise.resolve(response);
	} else {
		return Promise.reject(new Error(response.statusText));
	}
}

function buyProduct(event) {
	let button = event.srcElement;
	let shoppingCart = button.dataset.shoppingcartid;
		
	// Send data to server by manipulating HTTP method and URL
	fetch('/buy/' + shoppingCart, {
		method: 'PUT'
	})
	.then(statusRegister2)
	.then(response => response.json())
	.then(result => {
		console.log(result);
		if(result.hasOwnProperty('shoppingCartId')){
			// I cannot execute any extra code after a reload, so I need to add a trigger with window.location.hash
			window.location.hash = 'reload-buy';
			sessionStorage.setItem('shopcartID', shoppingCart);
			window.location.reload(true);
			// No need to clean previous message as page will reload
//			document.getElementById("errorBuyMsg"+shoppingCart).innerHTML = "";
		} else if(result.hasOwnProperty('code') && result.code === "ER_DATA_OUT_OF_RANGE"){
			document.getElementById("buyMsg"+shoppingCart).innerHTML = "";
			document.getElementById("errorBuyMsg"+shoppingCart).innerHTML = "Products in shopping cart exceed product stock, buy transaction cancelled";
			console.log('Products in shopping cart exceed product stock, buy transaction cancelled');
		} else {
			document.getElementById("buyMsg"+shoppingCart).innerHTML = "";
			document.getElementById("errorBuyMsg"+shoppingCart).innerHTML = "Buy transaction cancelled";
		}
	})
	.catch(function(error) {
		// Server send this status when product quantity unavailable
		console.error('Buy transaction cancelled due to unexpected error', error.message);
		document.getElementById("errorBuyMsg"+shoppingCart).innerHTML = "Buy transaction cancelled due to unexpected error";
	});
}

function deleteProduct(event) {
//	console.log(event);
	let button = event.srcElement;
	let product = button.dataset.productid;
	let shoppingCart = button.dataset.shoppingcartid;
	
	// Send data to server by manipulating HTTP method and URL
	fetch('/product/' + product + '/shoppingCart/' + shoppingCart, {
		method: 'DELETE'
	})
	.then(status)
	.then(response => response.json())
	.then(result => {
		if(result.deletedItems !== 0){
			window.location.reload(true);
		} else {
			//document.getElementById('errorDeleteProduct').innerHTML = "The product could not removed from shopping cart";
			console.log('Delete product in shopping cart request failed, deleted 0 rows');
		}
	})
	.catch(function(error) {
		if(error.message === "400"){ // Indicates duplicate entry
			console.log('Delete product in shopping cart request failed', error);
		} else {
			console.log('Delete product in shopping cart request failed', error);
		}
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