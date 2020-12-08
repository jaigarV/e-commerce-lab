SELECT Name, Email, Phone, Address, Shopping_cartID 
FROM ecommerce_database.CUSTOMER AS C LEFT JOIN ecommerce_database.`SHOPPING CART` AS S ON C.IdentityNumber = S.Buyer
WHERE  IdentityNumber = ? AND Password = ?;