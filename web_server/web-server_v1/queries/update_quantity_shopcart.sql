UPDATE ecommerce_database.`PRODUCTS IN CART`
SET Quantity = Quantity + ? 
WHERE `Shopping_cartID` = ? AND `ProductID` = ?;