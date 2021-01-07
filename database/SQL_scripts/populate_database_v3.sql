-- Insert deafult values in all tables to perform tests
INSERT INTO `ecommerce_database`.`ADMINISTRATOR` (`IdentityNumber`, `Name`, `Password`, `Email`, `Phone`) VALUES ('123456789', 'TestAdmin', 'test', 'TestAdmin@test.com', '123456');

INSERT INTO `ecommerce_database`.`CUSTOMER` (`IdentityNumber`, `Name`, `Password`, `Email`, `Phone`, `Address`, `Gender`, `Age`, `Country`) VALUES ('123456789', 'TestCustomer', 'test', 'TestCutomer@test.com', '123456', 'Test Street, Number 0, 000 00, Lulea', 'Other', '0', 'World');
INSERT INTO `ecommerce_database`.`CUSTOMER` (`IdentityNumber`, `Name`, `Password`, `Email`, `Phone`, `Address`, `Gender`, `Age`, `Country`) VALUES ('999999999', 'TestCustomer2', 'test', 'TestCutomer2@test.com', '654321', 'Test Street, Number 2, 000 00, Lulea', 'Other', '200', 'Space');

INSERT INTO `ecommerce_database`.`SELLER` (`OrganizationID`, `Name`, `Password`, `Email`, `Phone`, `Address`, `Country`) VALUES ('1223344', 'TestSeller', 'test', 'TestSeller@test.com', '00112233', 'Test factory, Number 101, 111 11, Gothenburg', ' Sweden');
INSERT INTO `ecommerce_database`.`SELLER` (`OrganizationID`, `Name`, `Password`, `Email`, `Phone`, `Address`, `Country`) VALUES ('4433221', 'TestSeller2', 'test', 'TestSeller2@test.com', '33221100', 'Test factory, Number 102, 111 12, Stockholm', ' Sweden');

-- Include `ProductID` to be sure which ID the products get assigned in the database and use them in following SQL statements
INSERT INTO `ecommerce_database`.`PRODUCT` (`ProductID`, `Name`, `Price`, `Quantity`, `DescriptionText`, `DescriptionImage`, `Seller`) VALUES ('1', 'House', '1000000', '2', 'Spectacular house in the north pole', LOAD_FILE('/var/lib/mysql-files/test_image.jpg'), '1223344');
INSERT INTO `ecommerce_database`.`PRODUCT` (`ProductID`, `Name`, `Price`, `Quantity`, `DescriptionText`, `DescriptionImage`, `Seller`) VALUES ('2', 'Headphones', '500', '10', 'Gaming headphones, of course', LOAD_FILE('/var/lib/mysql-files/test_image_2.png'), '1223344');
INSERT INTO `ecommerce_database`.`PRODUCT` (`ProductID`, `Name`, `Price`, `Quantity`, `DescriptionText`, `DescriptionImage`, `Seller`) VALUES ('3', 'Food basket', '300', '30', 'A lot of food uncooked', LOAD_FILE('/var/lib/mysql-files/test_image_3.jpeg'), '4433221');
INSERT INTO `ecommerce_database`.`PRODUCT` (`ProductID`, `Name`, `Price`, `Quantity`, `DescriptionText`, `DescriptionImage`, `Seller`) VALUES ('4', 'Cheetos', '20', '100', 'The original cheetos with cheese flavour', LOAD_FILE('/var/lib/mysql-files/test_image_4.jpeg'), '4433221');


INSERT INTO `ecommerce_database`.`SHOPPING CART` (`Shopping_cartID`, `Buyer`) VALUES (1, '123456789');
INSERT INTO `ecommerce_database`.`SHOPPING CART` (`Shopping_cartID`, `Buyer`) VALUES (2, '999999999');
INSERT INTO `ecommerce_database`.`SHOPPING CART` (`Shopping_cartID`, `Buyer`) VALUES (3, '123456789');



INSERT INTO `ecommerce_database`.`PRODUCTS IN CART` (`Shopping_cartID`, `ProductID`, `Quantity`) VALUES ('1', '1', 1);
INSERT INTO `ecommerce_database`.`PRODUCTS IN CART` (`Shopping_cartID`, `ProductID`, `Quantity`) VALUES ('1', '3', 5);

INSERT INTO `ecommerce_database`.`PRODUCTS IN CART` (`Shopping_cartID`, `ProductID`, `Quantity`) VALUES ('2', '1', 1);
INSERT INTO `ecommerce_database`.`PRODUCTS IN CART` (`Shopping_cartID`, `ProductID`, `Quantity`) VALUES ('2', '2', 3);

INSERT INTO `ecommerce_database`.`PRODUCTS IN CART` (`Shopping_cartID`, `ProductID`, `Quantity`) VALUES ('3', '2', 7);
INSERT INTO `ecommerce_database`.`PRODUCTS IN CART` (`Shopping_cartID`, `ProductID`, `Quantity`) VALUES ('3', '4', 5);

UPDATE ecommerce_database.`SHOPPING CART` SET Bought = 1 WHERE Shopping_cartID = 3;

INSERT INTO `ecommerce_database`.`COMMENT` (`Author`, `Rating`, `Text`, `Product`) VALUES ('123456789', '2', 'Hello,<br>It was a good product, not extraordinary', '1');
INSERT INTO `ecommerce_database`.`COMMENT` (`Author`, `Rating`, `Text`, `Product`) VALUES ('123456789', '5', 'It was delicious, will repeat next year<br>Regards,<br>Tester', '3');
