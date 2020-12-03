
-- -----------------------------------------------------
-- Schema ecommerce_database
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ecommerce_database` ;
USE `ecommerce_database` ;

-- Fixes errors with default value for Dates
SET GLOBAL SQL_MODE='ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Table `ecommerce_database`.`CUSTOMER`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce_database`.`CUSTOMER` (
  `IndentityNumber` INT(9) NOT NULL,
  `Name` VARCHAR(25) NOT NULL,
  `Password` VARCHAR(16) NOT NULL,
  `Email` VARCHAR(25) NOT NULL,
  `Phone`  INT(11) NOT NULL,
  `Address` VARCHAR(60) NOT NULL,
  `Gender` ENUM('Male', 'Female', 'Other') NULL,
  `Age` INT(3) NULL,
  `Country` VARCHAR(20) NULL,
  PRIMARY KEY (`IndentityNumber`),
  UNIQUE INDEX `Email_UNIQUE` (`Email` ASC) VISIBLE);
-- It defualt so we can remove it ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ecommerce_database`.`SELLER`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce_database`.`SELLER` (
  `OrganizationID` INT(9) NOT NULL,
  `Name` VARCHAR(25) NOT NULL,
  `Password` VARCHAR(16) NOT NULL,
  `Email` VARCHAR(25) NOT NULL,
  `Phone` INT(11) NOT NULL,
  `Address` VARCHAR(60) NOT NULL,
  `Country` VARCHAR(20) NULL,
  PRIMARY KEY (`OrganizationID`),
  UNIQUE INDEX `Name_UNIQUE` (`Name` ASC) VISIBLE);


-- -----------------------------------------------------
-- Table `ecommerce_database`.`ADMINISTRATOR`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce_database`.`ADMINISTRATOR` (
  `IdentityNumber` INT(9) NOT NULL,
  `Name` VARCHAR(25) NOT NULL,
  `Password` VARCHAR(24) NOT NULL,
  `Email` VARCHAR(25) NOT NULL,
  `Phone` INT(11) NOT NULL,
  PRIMARY KEY (`IdentityNumber`));


-- -----------------------------------------------------
-- Table `ecommerce_database`.`PRODUCT`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce_database`.`PRODUCT` (
  `ProductID` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(45) NOT NULL,
  `Price` DECIMAL NOT NULL,
  `Quantity` INT UNSIGNED NOT NULL,
  `DescriptionText` MEDIUMTEXT NULL,
  `DescriptionImage` MEDIUMBLOB NULL,
  `Seller` INT(9) NOT NULL,
  PRIMARY KEY (`ProductID`),
  INDEX `fk_SELLER_idx` (`Seller` ASC) VISIBLE,
  CONSTRAINT `fk_SELLER`
    FOREIGN KEY (`Seller`)
    REFERENCES `ecommerce_database`.`SELLER` (`OrganizationID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);


-- -----------------------------------------------------
-- Table `ecommerce_database`.`SHOPPING CART`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce_database`.`SHOPPING CART` (
  `Shopping_cartID` INT NOT NULL AUTO_INCREMENT,
  `Buyer` INT(9) NULL,
  PRIMARY KEY (`Shopping_cartID`),
  INDEX `Customer_idx` (`Buyer` ASC) VISIBLE,
  CONSTRAINT `fk_CUSTOMER`
    FOREIGN KEY (`Buyer`)
    REFERENCES `ecommerce_database`.`CUSTOMER` (`IndentityNumber`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE);


-- -----------------------------------------------------
-- Table `ecommerce_database`.`COMMENT`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce_database`.`COMMENT` (
  `Author` INT NOT NULL,
  `Rating` INT NULL,
  `Text` MEDIUMTEXT NOT NULL,
  `Date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE NOW(),
  `Product` INT NOT NULL,
  PRIMARY KEY (`Author`, `Product`),
  INDEX `fk_COMMENT_PRODUCT_idx` (`Product` ASC) VISIBLE,
  CONSTRAINT `fk_COMMENT_PRODUCT`
    FOREIGN KEY (`Product`)
    REFERENCES `ecommerce_database`.`PRODUCT` (`ProductID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);


-- -----------------------------------------------------
-- Table `ecommerce_database`.`ORDER`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce_database`.`ORDER` (
  `Shopping_cartID` INT NOT NULL,
  `ProductID` INT NOT NULL,
  `ProductPriceThen` DECIMAL NULL,
  PRIMARY KEY (`Shopping_cartID`, `ProductID`),
  INDEX `fk_SHOPPING CART_has_PRODUCT_PRODUCT1_idx` (`ProductID` ASC) VISIBLE,
  INDEX `fk_SHOPPING CART_has_PRODUCT_SHOPPING CART1_idx` (`Shopping_cartID` ASC) VISIBLE,
  CONSTRAINT `fk_SHOPPING CART`
    FOREIGN KEY (`Shopping_cartID`)
    REFERENCES `ecommerce_database`.`SHOPPING CART` (`Shopping_cartID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_PRODUCT`
    FOREIGN KEY (`ProductID`)
    REFERENCES `ecommerce_database`.`PRODUCT` (`ProductID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

-- SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
-- SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

USE `ecommerce_database`;

DELIMITER $$
USE `ecommerce_database`$$
CREATE DEFINER = CURRENT_USER TRIGGER `ecommerce_database`.`ORDER_STORE_PRICE` AFTER INSERT ON `ORDER` FOR EACH ROW
BEGIN
	UPDATE `ORDER` AS `O`
    SET `O`.`ProductPriceThen` = `PRODUCT`.`Price`
    WHERE `ORDER`.`ProductPriceThen` IS NULL AND `O`.`ProductID` = `PRODUCT`.`ProductID`;
END$$


DELIMITER ;
