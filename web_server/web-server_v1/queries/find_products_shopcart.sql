SELECT PC.*, P.`Name`, P.`Seller`, P.`Quantity` AS TotalQuantity
FROM ecommerce_database.`PRODUCTS IN CART` AS PC LEFT JOIN ecommerce_database.`PRODUCT` AS P ON PC.ProductID = P.ProductID
WHERE Shopping_cartID = ?;