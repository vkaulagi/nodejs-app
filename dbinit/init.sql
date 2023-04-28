CREATE DATABASE IF NOT EXISTS ecommercedb;

USE ecommercedb;

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