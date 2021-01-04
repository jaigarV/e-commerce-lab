UPDATE `ecommerce_database`.`PRODUCT` 
SET Quantity = Quantity - ?
WHERE `PRODUCT`.`ProductID` = ?;