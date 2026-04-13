-- ============================================================
-- SmartRetail ERP - Complete Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS smartretail_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartretail_db;

-- ── ROLES ──────────────────────────────────────────────────
CREATE TABLE roles (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE   -- ROLE_ADMIN, ROLE_OWNER, ROLE_STAFF
);

-- ── USERS ──────────────────────────────────────────────────
CREATE TABLE users (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    full_name    VARCHAR(150),
    email        VARCHAR(150) UNIQUE,
    phone        VARCHAR(20),
    enabled      BOOLEAN DEFAULT TRUE,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ── STORES ─────────────────────────────────────────────────
CREATE TABLE stores (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    address      TEXT,
    city         VARCHAR(100),
    state        VARCHAR(100),
    pincode      VARCHAR(10),
    gst_number   VARCHAR(20),
    phone        VARCHAR(20),
    email        VARCHAR(150),
    owner_id     BIGINT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- ── CATEGORIES ─────────────────────────────────────────────
CREATE TABLE categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── SUPPLIERS ──────────────────────────────────────────────
CREATE TABLE suppliers (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100),
    phone        VARCHAR(20),
    email        VARCHAR(150),
    address      TEXT,
    city         VARCHAR(100),
    gst_number   VARCHAR(20),
    balance_due  DECIMAL(12,2) DEFAULT 0.00,
    status       ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── PRODUCTS ───────────────────────────────────────────────
CREATE TABLE products (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    sku             VARCHAR(100) UNIQUE,
    barcode         VARCHAR(100),
    description     TEXT,
    category_id     BIGINT,
    supplier_id     BIGINT,
    store_id        BIGINT,
    cost_price      DECIMAL(10,2) NOT NULL,
    selling_price   DECIMAL(10,2) NOT NULL,
    mrp             DECIMAL(10,2),
    gst_percentage  DECIMAL(5,2) DEFAULT 0.00,
    unit            VARCHAR(30) DEFAULT 'piece',
    image_url       VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    expiry_date     DATE,
    batch_number    VARCHAR(100),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- ── INVENTORY ──────────────────────────────────────────────
CREATE TABLE inventory (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT NOT NULL UNIQUE,
    store_id        BIGINT NOT NULL,
    quantity        INT NOT NULL DEFAULT 0,
    min_quantity    INT DEFAULT 10,
    max_quantity    INT DEFAULT 1000,
    last_updated    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- ── STOCK MOVEMENTS ────────────────────────────────────────
CREATE TABLE stock_movements (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id     BIGINT NOT NULL,
    store_id       BIGINT NOT NULL,
    movement_type  ENUM('IN','OUT','RETURN','ADJUSTMENT') NOT NULL,
    quantity       INT NOT NULL,
    reference_type VARCHAR(50),    -- ORDER, PURCHASE, RETURN, MANUAL
    reference_id   BIGINT,
    notes          TEXT,
    created_by     BIGINT,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ── CUSTOMERS ──────────────────────────────────────────────
CREATE TABLE customers (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    phone          VARCHAR(20) UNIQUE,
    email          VARCHAR(150),
    address        TEXT,
    city           VARCHAR(100),
    loyalty_points INT DEFAULT 0,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── DISCOUNTS ──────────────────────────────────────────────
CREATE TABLE discounts (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    type           ENUM('FLAT','PERCENTAGE') NOT NULL,
    value          DECIMAL(10,2) NOT NULL,
    min_order_amt  DECIMAL(10,2) DEFAULT 0,
    max_uses       INT,
    used_count     INT DEFAULT 0,
    valid_from     DATE,
    valid_to       DATE,
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── ORDERS ─────────────────────────────────────────────────
CREATE TABLE orders (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number  VARCHAR(50) NOT NULL UNIQUE,
    customer_id     BIGINT,
    store_id        BIGINT NOT NULL,
    created_by      BIGINT NOT NULL,
    subtotal        DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount      DECIMAL(12,2) DEFAULT 0,
    total_amount    DECIMAL(12,2) NOT NULL,
    paid_amount     DECIMAL(12,2) DEFAULT 0,
    due_amount      DECIMAL(12,2) DEFAULT 0,
    payment_mode    ENUM('CASH','UPI','CARD','PART_PAYMENT','CREDIT') DEFAULT 'CASH',
    status          ENUM('COMPLETED','PARTIAL','CANCELLED','REFUNDED') DEFAULT 'COMPLETED',
    notes           TEXT,
    order_date      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ── ORDER ITEMS ────────────────────────────────────────────
CREATE TABLE order_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT NOT NULL,
    product_id      BIGINT NOT NULL,
    quantity        INT NOT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    cost_price      DECIMAL(10,2) NOT NULL,
    gst_percentage  DECIMAL(5,2) DEFAULT 0,
    gst_amount      DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price     DECIMAL(10,2) NOT NULL,
    profit          DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ── PAYMENTS ───────────────────────────────────────────────
CREATE TABLE payments (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id       BIGINT NOT NULL,
    amount         DECIMAL(12,2) NOT NULL,
    payment_mode   ENUM('CASH','UPI','CARD','CREDIT') NOT NULL,
    reference_no   VARCHAR(100),
    payment_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by     BIGINT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ── PURCHASES ──────────────────────────────────────────────
CREATE TABLE purchases (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_number       VARCHAR(50) UNIQUE,
    supplier_id     BIGINT NOT NULL,
    store_id        BIGINT NOT NULL,
    total_amount    DECIMAL(12,2) NOT NULL,
    paid_amount     DECIMAL(12,2) DEFAULT 0,
    status          ENUM('PENDING','RECEIVED','PARTIAL','CANCELLED') DEFAULT 'PENDING',
    purchase_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by      BIGINT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE purchase_items (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_id  BIGINT NOT NULL,
    product_id   BIGINT NOT NULL,
    quantity     INT NOT NULL,
    unit_cost    DECIMAL(10,2) NOT NULL,
    total_cost   DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ── RETURNS ────────────────────────────────────────────────
CREATE TABLE returns (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id     BIGINT NOT NULL,
    product_id   BIGINT NOT NULL,
    quantity     INT NOT NULL,
    reason       TEXT,
    refund_amt   DECIMAL(10,2),
    status       ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    created_by   BIGINT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ── NOTIFICATIONS ──────────────────────────────────────────
CREATE TABLE notifications (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT,
    type         VARCHAR(50),   -- LOW_STOCK, DUE_PAYMENT, ORDER, SYSTEM
    title        VARCHAR(200),
    message      TEXT,
    is_read      BOOLEAN DEFAULT FALSE,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── AUDIT LOGS ─────────────────────────────────────────────
CREATE TABLE audit_logs (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT,
    action       VARCHAR(100),
    entity_type  VARCHAR(100),
    entity_id    BIGINT,
    old_value    TEXT,
    new_value    TEXT,
    ip_address   VARCHAR(50),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── SEED DATA ──────────────────────────────────────────────
INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_OWNER'), ('ROLE_STAFF');

-- Password: admin123 (BCrypt encoded)
INSERT INTO users (username, password, full_name, email, phone) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFMCNxKuGGhpSdlBtQMKyWG', 'Admin User', 'admin@smartretail.com', '9999999999'),
('owner', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFMCNxKuGGhpSdlBtQMKyWG', 'Store Owner', 'owner@smartretail.com', '9888888888'),
('staff1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFMCNxKuGGhpSdlBtQMKyWG', 'Staff One', 'staff1@smartretail.com', '9777777777');

INSERT INTO user_roles VALUES (1,1),(2,2),(3,3);

INSERT INTO stores (name, address, city, state, pincode, gst_number, phone, email, owner_id) VALUES
('SmartRetail Main Store', '123 MG Road', 'Delhi', 'Delhi', '110001', '27AADCB2230M1ZT', '9999999999', 'store@smartretail.com', 2);

INSERT INTO categories (name, description) VALUES
('Grains', 'Rice, Wheat, Pulses'),
('Dairy', 'Milk, Butter, Cheese'),
('Spices', 'Salt, Pepper, Masala'),
('Household', 'Detergents, Cleaners'),
('Instant Food', 'Noodles, Ready-to-eat'),
('Personal Care', 'Soap, Toothpaste'),
('Cooking Oil', 'Refined, Mustard Oil'),
('Biscuits', 'Cookies, Crackers');

INSERT INTO suppliers (name, contact_name, phone, email, city, balance_due) VALUES
('AgroFresh Distributors', 'Ramesh Gupta', '9811223344', 'agrofresh@biz.com', 'Ludhiana', 24500),
('Amul Cooperative', 'Suresh Patel', '9922334455', 'amul@coop.com', 'Anand', 0),
('ITC Distribution', 'Vikram Roy', '9933445566', 'itc@dist.com', 'Kolkata', 8900),
('HUL Supply Chain', 'Preet Kaur', '9944556677', 'hul@sc.com', 'Mumbai', 15200);

INSERT INTO products (name, sku, barcode, category_id, supplier_id, store_id, cost_price, selling_price, mrp, gst_percentage, unit) VALUES
('Basmati Rice 5kg',     'RICE001', '8901234567890', 1, 1, 1, 280, 350, 380, 5,  'bag'),
('Amul Butter 500g',     'DAIRY002','8901058001234', 2, 2, 1, 220, 265, 290, 12, 'pack'),
('Tata Salt 1kg',        'SALT003', '8901725000055', 3, 3, 1, 18,  24,  26,  0,  'pack'),
('Aashirvaad Atta 10kg', 'ATTA004', '8901725000056', 1, 3, 1, 390, 460, 490, 5,  'bag'),
('Surf Excel 1kg',       'DETG005', '8901030001234', 4, 4, 1, 185, 230, 250, 18, 'pack'),
('Maggi Noodles 12pk',   'NOOD006', '8901030001235', 5, 3, 1, 145, 180, 200, 12, 'pack'),
('Colgate 200g',         'DENT007', '8901030001236', 6, 4, 1, 70,  95,  110, 12, 'tube'),
('Fortune Oil 1L',       'OIL008',  '8901030001237', 7, 1, 1, 125, 155, 170, 5,  'bottle'),
('Parle-G 800g',         'BISC009', '8901030001238', 8, 3, 1, 55,  75,  85,  18, 'pack'),
('Lifebuoy Soap 4pk',    'SOAP010', '8901030001239', 6, 4, 1, 80,  110, 120, 12, 'pack');

INSERT INTO inventory (product_id, store_id, quantity, min_quantity) VALUES
(1,1,142,20),(2,1,8,15),(3,1,95,30),(4,1,34,10),
(5,1,0,20),(6,1,67,25),(7,1,55,30),(8,1,28,20),
(9,1,89,40),(10,1,12,25);

INSERT INTO customers (name, phone, email, address, loyalty_points) VALUES
('Priya Sharma',   '9876543210','priya@gmail.com', '123 MG Road, Delhi', 1245),
('Rahul Kumar',    '9123456789','rahul@gmail.com', '45 Park Street, Mumbai', 689),
('Anita Singh',    '9988776655','anita@gmail.com', '78 Anna Nagar, Chennai', 1920),
('Mohammed Ali',   '9871234567','mali@gmail.com',  '12 Banjara Hills, Hyd', 340);
