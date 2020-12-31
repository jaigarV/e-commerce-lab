SELECT * 
FROM ecommerce_database.`ORDER` AS O LEFT JOIN ecommerce_database.`PRODUCT` AS P ON O.ProductID = P.ProductID
WHERE Shopping_cartID = ?;