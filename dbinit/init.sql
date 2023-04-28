CREATE DATABASE IF NOT EXISTS ecommercedb;

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