-- Insert deafult values in all tables to perform tests
INSERT INTO `ecommerce_database`.`ADMINISTRATOR` (`IdentityNumber`, `Name`, `Password`, `Email`, `Phone`) VALUES ('123456789', 'TestAdmin', 'test', 'TestAdmin@test.com', '123456');

INSERT INTO `ecommerce_database`.`CUSTOMER` (`IdentityNumber`, `Name`, `Password`, `Email`, `Phone`, `Address`, `Gender`, `Age`, `Country`) VALUES ('123456789', 'TestCutomer', 'test', 'TestCutomer@test.com', '123456', 'Test Street, Number 0, 000 00, Lulea', 'Other', '0', 'World');

INSERT INTO `ecommerce_database`.`SELLER` (`OrganizationID`, `Name`, `Password`, `Email`, `Phone`, `Address`, `Country`) VALUES ('0011223344', 'TestSeller', 'test', 'TestSeller@test.com', '00112233', 'Test factory, Number 101, 111 11, Gothenburg', ' Sweden');

INSERT INTO `ecommerce_database`.`PRODUCT` (`ProductID`, `Name`, `Price`, `Quantity`, `DescriptionText`, `DescriptionImage`, `Seller`) VALUES (1, 'Cheese', '5', '10', 'Just cheddar', LOAD_FILE('/var/lib/mysql-files/test_image.jpg'), '11223344');

INSERT INTO `ecommerce_database`.`SHOPPING CART` (`Shopping_cartID`, `Buyer`) VALUES (1, '123456789');

INSERT INTO `ecommerce_database`.`ORDER` (`Shopping_cartID`, `ProductID`) VALUES ('1', '1');

INSERT INTO `ecommerce_database`.`COMMENT` (`Author`, `Rating`, `Text`, `Product`) VALUES ('123456789', '2', 'It was a good product, not extraordinary', '1');
