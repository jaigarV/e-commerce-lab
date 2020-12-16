SELECT P.*, S.Name AS SellerName
FROM ecommerce_database.PRODUCT AS P JOIN ecommerce_database.SELLER AS S ON P.SELLER = S.OrganizationID
WHERE P.ProductID = ?;