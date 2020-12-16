SELECT S.Name, S.Email, S.Phone, S.Address, P.ProductID, P.Name AS ProductName 
FROM `ecommerce_database`.`SELLER` AS S LEFT JOIN ecommerce_database.`PRODUCT` AS P ON S.OrganizationID = P.Seller
WHERE S.OrganizationID = ? AND S.Password = ?;