-- Test database for the integration tests (CI only).
-- Mirrors the tables the PHP API reads and writes.

CREATE TABLE IF NOT EXISTS Users (
  ID INT NOT NULL AUTO_INCREMENT,
  firstName VARCHAR(50) NOT NULL DEFAULT '',
  lastName VARCHAR(50) NOT NULL DEFAULT '',
  Login VARCHAR(50) NOT NULL DEFAULT '',
  Password VARCHAR(50) NOT NULL DEFAULT '',
  PRIMARY KEY (ID)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS Colors (
  ID INT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(50) NOT NULL DEFAULT '',
  UserID INT NOT NULL DEFAULT 0,
  PRIMARY KEY (ID)
) ENGINE = InnoDB;

INSERT INTO Users (firstName, lastName, Login, Password)
VALUES ('Test', 'User', 'testuser', 'testpass');

INSERT INTO Colors (Name, UserID)
VALUES ('Blue', 1), ('Light Blue', 1), ('Red', 1);
