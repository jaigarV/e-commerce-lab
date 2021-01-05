SELECT COMMENT.*, CUSTOMER.Name
FROM ecommerce_database.COMMENT LEFT JOIN ecommerce_database.CUSTOMER ON COMMENT.Author = CUSTOMER.IdentityNumber
WHERE COMMENT.Product = ?;