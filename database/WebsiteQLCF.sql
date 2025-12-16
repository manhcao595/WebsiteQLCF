CREATE DATABASE WebsiteQLCF;

USE WebsiteQLCF;

CREATE TABLE Category (
    CategoryID INT PRIMARY KEY IDENTITY,
    Name NVARCHAR(100) NOT NULL
);
CREATE TABLE MenuItem (
    ItemID INT PRIMARY KEY IDENTITY,
    Name NVARCHAR(100) NOT NULL,
    CategoryID INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Status BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID)
);
CREATE TABLE TableInfo (
    TableID INT PRIMARY KEY IDENTITY,
    TableName NVARCHAR(50) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Trống' -- Trống / Đang phục vụ / Đang đặt trước
);

CREATE TABLE Sale (
    SaleID INT PRIMARY KEY IDENTITY,
    TableID INT NOT NULL,
    SaleDate DATETIME NOT NULL DEFAULT GETDATE(),
    TotalAmount DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (TableID) REFERENCES TableInfo(TableID)
);

CREATE TABLE SaleDetail (
    SaleDetailID INT PRIMARY KEY IDENTITY,
    SaleID INT NOT NULL,
    ItemID INT NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL, -- Giá bán tại thời điểm
    Amount AS (Quantity * Price) PERSISTED, -- Thành tiền
    FOREIGN KEY (SaleID) REFERENCES Sale(SaleID),
    FOREIGN KEY (ItemID) REFERENCES MenuItem(ItemID)
);
ALTER TABLE MenuItem
ADD CONSTRAINT UQ_MenuItem_Name UNIQUE(Name);