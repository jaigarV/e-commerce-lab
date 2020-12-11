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
	document.getElementById("homeIcon").addEventListener('click', showHome);
	document.getElementById("shoppingCartIcon").addEventListener('click', showShoppingCarts);
	
	// Check if there is a user logged
	if(sessionStorage.getItem("userName") !== null){
		printUser();
		toggleUserMenu();
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
	window.location.reload(false); 
}

function showHome(){
	window.location.reload(true);
}

function showShoppingCarts(){
	// Make get request to server to retrieve the customer shopping cart web page
}

function printUser(){
	document.getElementById("userMessage").innerHTML = "Welcome " + sessionStorage.getItem("userName") + "!";
}

function toggleUserMenu(){
	for(let element of document.getElementsByClassName("user-logged")){
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

// Legacy code as reference
/*
// Accordion to show the categories by adding or removing the w3-show class attribute
function myAccFunc() {
	var x = document.getElementById("demoAcc");
	if (x.className.indexOf("w3-show") == -1) {
		x.className += " w3-show";
	} else {
		x.className = x.className.replace(" w3-show", "");
	}
}

// Click on the myBtn link on page load to open the accordion for demo purposes
document.getElementById("myBtn").click();

// Open and close sidebar withou using classes
function w3_open() {
	document.getElementById("mySidebar").style.display = "block";
	document.getElementById("myOverlay").style.display = "block";
}

function w3_close() {
	document.getElementById("mySidebar").style.display = "none";
	document.getElementById("myOverlay").style.display = "none";
}
*/