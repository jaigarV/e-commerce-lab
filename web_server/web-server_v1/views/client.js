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