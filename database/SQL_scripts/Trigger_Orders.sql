CREATE DEFINER = CURRENT_USER TRIGGER `mydb`.`ORDER_STORE_PRICE` AFTER INSERT ON `ORDER` FOR EACH ROW
BEGIN
	UPDATE `ORDER` AS `O`
    SET `O`.`ProductPriceThen` = `PRODUCT`.`Price`
    WHERE `ORDER`.`ProductPriceThen` IS NULL AND `O`.`ProductID` = `PRODUCT`.`ProductID`;
END
