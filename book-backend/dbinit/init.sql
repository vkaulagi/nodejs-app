-- CREATE DATABASE IF NOT EXISTS ecommercedb;
CREATE DATABASE ecommercedb;

USE ecommercedb;

DROP TABLE IF EXISTS Customer;

CREATE TABLE Customer (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    address2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zipcode VARCHAR(20),
    CONSTRAINT UQ_Customer_userId UNIQUE (userId)
);

DROP TABLE IF EXISTS Book;

CREATE TABLE Book (
  ISBN VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  Author VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(50),
  price DECIMAL(10, 2),
  quantity INT,
  PRIMARY KEY (ISBN)
);