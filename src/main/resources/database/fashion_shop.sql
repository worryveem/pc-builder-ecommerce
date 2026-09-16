DROP SCHEMA IF EXISTS fashion_shop;
CREATE SCHEMA fashion_shop;
USE fashion_shop;

-- ==========================================================
-- 1. USERS & AUTHENTICATION
-- ==========================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    full_name VARCHAR(255),
    phone VARCHAR(20) UNIQUE,
    role VARCHAR(50) DEFAULT 'customer',
    discount_percent DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 2. CATEGORIES (Đa cấp & Hỗ trợ Dynamic PC Builder)
-- ==========================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id INT NULL,
    builder_supported BOOLEAN DEFAULT FALSE,
    builder_component_type VARCHAR(50) NULL,
    display_order INT DEFAULT 0,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ==========================================================
-- 3. PRODUCTS (COMPONENT, PREBUILT_PC, LAPTOP, ACCESSORY)
-- ==========================================================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model_code VARCHAR(100),
    price DECIMAL(12,2) NOT NULL,
    warranty_months INT DEFAULT 36,
    product_type VARCHAR(50) NOT NULL DEFAULT 'COMPONENT',
    stock_quantity INT DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ==========================================================
-- 4. PRODUCT SPECIFICATIONS (Structured Columns + JSON Extra)
-- ==========================================================
CREATE TABLE product_specifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL UNIQUE,
    socket VARCHAR(50) NULL,
    chipset VARCHAR(50) NULL,
    supported_sockets VARCHAR(255) NULL,
    cooler_height_mm INT NULL,
    ram_type VARCHAR(20) NULL,
    max_ram_capacity INT NULL,
    ram_slots INT NULL,
    capacity_gb INT NULL,
    speed_mhz INT NULL,
    modules_count INT DEFAULT 1,
    form_factor VARCHAR(50) NULL,
    supported_form_factors VARCHAR(255) NULL,
    gpu_length_mm INT NULL,
    max_gpu_length_mm INT NULL,
    max_cooler_height_mm INT NULL,
    tdp_w INT NULL,
    power_consumption_w INT NULL,
    recommended_psu_w INT NULL,
    psu_wattage INT NULL,
    screen_size DECIMAL(4,1) NULL,
    resolution VARCHAR(50) NULL,
    refresh_rate INT NULL,
    panel_type VARCHAR(50) NULL,
    response_time DECIMAL(3,1) NULL,
    raw_extra_specs JSON NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ==========================================================
-- 5. PRODUCT IMAGES
-- ==========================================================
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    product_id INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ==========================================================
-- 6. PC CONFIGURATIONS & ITEMS (Customer Tự Build)
-- ==========================================================
CREATE TABLE pc_configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(255) NOT NULL DEFAULT 'Cấu hình PC của tôi',
    share_token VARCHAR(100) UNIQUE NULL,
    total_price DECIMAL(12,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE pc_configuration_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    configuration_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    price_at_selection DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (configuration_id) REFERENCES pc_configurations(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ==========================================================
-- 7. ADDRESSES
-- ==========================================================
CREATE TABLE addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    address_line VARCHAR(255),
    city VARCHAR(255),
    district VARCHAR(255),
    ward VARCHAR(255),
    user_id INT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ==========================================================
-- 8. CARTS & CART ITEMS
-- ==========================================================
CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_price DECIMAL(12,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quantity INT DEFAULT 1,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    configuration_id INT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (configuration_id) REFERENCES pc_configurations(id) ON DELETE SET NULL
);

-- ==========================================================
-- 9. ORDERS & ORDER ITEMS
-- ==========================================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    is_guest BOOLEAN DEFAULT TRUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    full_name VARCHAR(255),
    address VARCHAR(255),
    notes TEXT,
    subtotal DECIMAL(12,2),
    discount_amount DECIMAL(12,2) DEFAULT 0,
    shipping_fee DECIMAL(12,2) DEFAULT 0,
    total_price DECIMAL(12,2),
    voucher_code VARCHAR(100) NULL,
    order_status VARCHAR(50) DEFAULT 'PENDING',
    payment_method VARCHAR(50) DEFAULT 'COD',
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    price DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    configuration_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (configuration_id) REFERENCES pc_configurations(id) ON DELETE SET NULL
);

-- ==========================================================
-- 10. RATINGS, VOUCHERS, WISHLISTS
-- ==========================================================
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    star INT CHECK (star BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    product_id INT,
    UNIQUE (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(12,2) NOT NULL,
    min_order_amount DECIMAL(12,2) DEFAULT 0,
    usage_limit INT DEFAULT 100,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ==========================================================
-- SEED DATA: USERS & VOUCHERS
-- ==========================================================
INSERT INTO users (username, email, password, full_name, phone, role, status, created_at) VALUES
('admin', 'admin@computopia.com', '$2a$10$ZEyKF8rB7zAlf/0wntqan.qnQWdqEZBJLDl.zWX4l3ioq0Ej9Or2S', 'System Admin', '0900000001', 'ADMIN', 'ACTIVE', NOW()),
('user1', 'user1@gmail.com', '$2a$10$ZEyKF8rB7zAlf/0wntqan.qnQWdqEZBJLDl.zWX4l3ioq0Ej9Or2S', 'Nguyen Van A', '0900000002', 'CUSTOMER', 'ACTIVE', NOW()),
('user2', 'user2@gmail.com', '$2a$10$ZEyKF8rB7zAlf/0wntqan.qnQWdqEZBJLDl.zWX4l3ioq0Ej9Or2S', 'Tran Thi B', '0900000003', 'CUSTOMER', 'ACTIVE', NOW());

INSERT INTO vouchers (code, description, discount_type, discount_value, min_order_amount, usage_limit, is_active) VALUES
('TECH500', 'Giảm 500k cho đơn hàng từ 10 triệu', 'FIXED_AMOUNT', 500000, 10000000, 100, TRUE),
('BUILDER5', 'Giảm 5% cho cấu hình PC tự build', 'PERCENTAGE', 5, 5000000, 200, TRUE);

-- ==========================================================
-- SEED DATA: CATEGORIES (DEMO DATA)
-- ==========================================================
-- 1. Core PC Components
INSERT INTO categories (id, name, slug, description, parent_id, builder_supported, builder_component_type, display_order) VALUES
(1, 'Bộ vi xử lý (CPU)', 'cpu', 'CPU Intel & AMD thế hệ mới nhất', NULL, TRUE, 'CPU', 1),
(2, 'Bo mạch chủ (Mainboard)', 'mainboard', 'Bo mạch chủ socket LGA1700, AM5, AM4', NULL, TRUE, 'MAINBOARD', 2),
(3, 'Card màn hình (GPU/VGA)', 'gpu', 'VGA NVIDIA RTX & AMD Radeon', NULL, TRUE, 'GPU', 3),
(4, 'Bộ nhớ RAM', 'ram', 'RAM DDR4 & DDR5 hiệu năng cao', NULL, TRUE, 'RAM', 4),
(5, 'Ổ cứng SSD', 'ssd', 'SSD NVMe M.2 & SATA tốc độ cao', NULL, TRUE, 'SSD', 5),
(6, 'Nguồn máy tính (PSU)', 'psu', 'Nguồn công suất thực chuẩn 80 Plus', NULL, TRUE, 'PSU', 6),
(7, 'Tản nhiệt CPU (Cooler)', 'cooler', 'Tản nhiệt khí & tản nước AIO', NULL, TRUE, 'COOLER', 7),
(8, 'Vỏ thùng máy (Case)', 'case', 'Vỏ máy tính chuẩn ATX, mATX, ITX', NULL, TRUE, 'CASE', 8),
(9, 'Quạt tản nhiệt (Case Fan)', 'fan', 'Quạt tản nhiệt thùng máy ARGB', NULL, TRUE, 'FAN', 9),
(10, 'Ổ cứng HDD', 'hdd', 'Ổ cứng cơ lưu trữ dung lượng lớn', NULL, TRUE, 'HDD', 10);

-- 2. Optional Setup Gear / Accessories
INSERT INTO categories (id, name, slug, description, parent_id, builder_supported, builder_component_type, display_order) VALUES
(11, 'Màn hình máy tính', 'monitor', 'Màn hình Gaming & Đồ họa tần số quét cao', NULL, TRUE, 'MONITOR', 11),
(12, 'Bàn phím cơ', 'keyboard', 'Bàn phím cơ Custom & Gaming', NULL, TRUE, 'KEYBOARD', 12),
(13, 'Chuột máy tính', 'mouse', 'Chuột gaming không dây siêu nhẹ', NULL, TRUE, 'MOUSE', 13),
(14, 'Tai nghe', 'headset', 'Tai nghe gaming âm thanh vòm 7.1', NULL, TRUE, 'HEADSET', 14),
(15, 'Webcam', 'webcam', 'Webcam Full HD & 4K livestream', NULL, TRUE, 'WEBCAM', 15);

-- 3. Prebuilt PC & Laptop (KHÔNG tham gia Customer Tự Build)
INSERT INTO categories (id, name, slug, description, parent_id, builder_supported, builder_component_type, display_order) VALUES
(16, 'Thùng Máy Dựng Sẵn (Prebuilt PC)', 'prebuilt-pc', 'PC Gaming & Đồ họa lắp ráp hoàn chỉnh', NULL, FALSE, NULL, 16),
(17, 'Laptop Gaming & Văn Phòng', 'laptop', 'Máy tính xách tay chính hãng', NULL, FALSE, NULL, 17);

-- ==========================================================
-- SEED DATA: PRODUCTS & SPECIFICATIONS (DEMO DATA)
-- ==========================================================

-- [CPU] Intel Core i7 14700K (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(101, 'Intel Core i7 14700K', 'Intel', 'BX8071514700K', 10590000, 36, 'COMPONENT', 20, 'CPU 20 nhân 28 luồng, xung nhịp lên đến 5.6GHz, Socket LGA1700', 1);
INSERT INTO product_specifications (product_id, socket, tdp_w) VALUES
(101, 'LGA1700', 125);
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(101, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800', TRUE);

-- [CPU] AMD Ryzen 7 7800X3D (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(102, 'AMD Ryzen 7 7800X3D', 'AMD', '100-100000910WOF', 10290000, 36, 'COMPONENT', 15, 'CPU Gaming tốt nhất thế giới với 3D V-Cache, Socket AM5', 1);
INSERT INTO product_specifications (product_id, socket, tdp_w) VALUES
(102, 'AM5', 120);
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(102, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800', TRUE);

-- [Mainboard] ASUS ROG STRIX B760-F GAMING WIFI (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(103, 'ASUS ROG STRIX B760-F GAMING WIFI', 'ASUS', 'ROG-STRIX-B760-F', 5890000, 36, 'COMPONENT', 12, 'Bo mạch chủ socket LGA1700, hỗ trợ DDR5, WiFi 6E, chuẩn ATX', 2);
INSERT INTO product_specifications (product_id, socket, chipset, ram_type, max_ram_capacity, ram_slots, form_factor) VALUES
(103, 'LGA1700', 'B760', 'DDR5', 192, 4, 'ATX');
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(103, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', TRUE);

-- [Mainboard] MSI MAG B650 TOMAHAWK WIFI (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(104, 'MSI MAG B650 TOMAHAWK WIFI', 'MSI', 'MAG-B650-TOMAHAWK', 5290000, 36, 'COMPONENT', 10, 'Bo mạch chủ socket AM5 cho AMD Ryzen 7000/8000/9000, DDR5, chuẩn ATX', 2);
INSERT INTO product_specifications (product_id, socket, chipset, ram_type, max_ram_capacity, ram_slots, form_factor) VALUES
(104, 'AM5', 'B650', 'DDR5', 192, 4, 'ATX');
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(104, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', TRUE);

-- [RAM] Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(105, 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz', 'Corsair', 'CMH32GX5M2B6000C30', 3290000, 36, 'COMPONENT', 30, 'Kit 2 thanh 16GB DDR5 tốc độ 6000MHz, LED ARGB', 4);
INSERT INTO product_specifications (product_id, ram_type, capacity_gb, speed_mhz, modules_count) VALUES
(105, 'DDR5', 32, 6000, 2);
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(105, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800', TRUE);

-- [GPU] ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(106, 'ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB', 'ASUS', 'TUF-RTX4070TIS-16G', 24990000, 36, 'COMPONENT', 8, 'Card đồ họa 16GB GDDR6X, tản nhiệt 3 quạt siêu êm, dài 305mm', 3);
INSERT INTO product_specifications (product_id, gpu_length_mm, power_consumption_w, recommended_psu_w) VALUES
(106, 305, 285, 750);
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(106, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800', TRUE);

-- [SSD] Samsung 990 PRO 1TB M.2 NVMe PCIe Gen 4 (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(107, 'Samsung 990 PRO 1TB M.2 NVMe', 'Samsung', 'MZ-V9P1T0BW', 2890000, 60, 'COMPONENT', 40, 'Tốc độ đọc lên tới 7450MB/s, ghi 6900MB/s, độ bền cao', 5);
INSERT INTO product_specifications (product_id, capacity_gb) VALUES
(107, 1000);
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(107, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800', TRUE);

-- [PSU] Corsair RM750e 750W 80 Plus Gold ATX 3.0 (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(108, 'Corsair RM750e 750W 80 Plus Gold', 'Corsair', 'CP-9020262-NA', 2790000, 84, 'COMPONENT', 18, 'Nguồn máy tính 750W chuẩn Full Modular, dây dẹp, chuẩn ATX 3.0 PCIe 5.0', 6);
INSERT INTO product_specifications (product_id, psu_wattage) VALUES
(108, 750);
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(108, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800', TRUE);

-- [Cooler] Deepcool AK620 Digital (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(109, 'Deepcool AK620 Digital', 'Deepcool', 'R-AK620-BKADMN-G', 1690000, 36, 'COMPONENT', 22, 'Tản nhiệt khí tháp đôi có màn hình LED hiển thị nhiệt độ, cao 162mm', 7);
INSERT INTO product_specifications (product_id, supported_sockets, cooler_height_mm) VALUES
(109, 'LGA1700,AM5,AM4,LGA1200,LGA1151', 162);
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(109, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800', TRUE);

-- [Case] NZXT H5 Flow RGB Black (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(110, 'NZXT H5 Flow RGB Black', 'NZXT', 'CC-H51FB-R1', 2390000, 24, 'COMPONENT', 14, 'Vỏ case Mid-Tower mặt lưới thoáng khí, hỗ trợ VGA tới 365mm, tản cao 165mm', 8);
INSERT INTO product_specifications (product_id, supported_form_factors, max_gpu_length_mm, max_cooler_height_mm) VALUES
(110, 'ATX,MICRO_ATX,MINI_ITX', 365, 165);
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(110, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800', TRUE);

-- [Monitor] LG UltraGear 27GR75Q-B 27 inch 2K 165Hz (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(111, 'LG UltraGear 27GR75Q-B 27 inch 2K 165Hz', 'LG', '27GR75Q-B', 6290000, 24, 'ACCESSORY', 12, 'Màn hình Gaming 27 inch IPS QHD 2K (2560x1440), 165Hz, 1ms GtG, G-Sync compatible', 11);
INSERT INTO product_specifications (product_id, screen_size, resolution, refresh_rate, panel_type, response_time) VALUES
(111, 27.0, '2560x1440', 165, 'IPS', 1.0);
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(111, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', TRUE);

-- [Prebuilt PC] PC Gaming Computopia Battle RTX 4070 Ti (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(201, 'PC Gaming Computopia Battle RTX 4070 Ti', 'Computopia', 'CPT-BATTLE-01', 42990000, 36, 'PREBUILT_PC', 5, 'Bộ PC Gaming cao cấp lắp sẵn: Core i7 14700K | 32GB RAM DDR5 | RTX 4070 Ti Super | SSD 1TB NVMe | Nguồn 750W Gold | Tản AK620 Digital. Cắm điện là chiến max settings mọi game.', 16);
INSERT INTO product_specifications (product_id, raw_extra_specs) VALUES
(201, '{"cpu": "Intel Core i7 14700K", "mainboard": "ASUS ROG STRIX B760-F", "ram": "Corsair Vengeance 32GB DDR5 6000MHz", "gpu": "ASUS TUF RTX 4070 Ti Super 16GB", "storage": "Samsung 990 Pro 1TB NVMe", "psu": "Corsair RM750e 750W Gold", "case": "NZXT H5 Flow RGB"}');
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(201, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800', TRUE);

-- [Laptop] ASUS ROG Zephyrus G16 2024 (DEMO DATA)
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(301, 'ASUS ROG Zephyrus G16 GU605MI', 'ASUS', 'GU605MI-QR038W', 52990000, 24, 'LAPTOP', 7, 'Laptop Gaming cao cấp mỏng nhẹ: Intel Core Ultra 7 155H | 32GB LPDDR5X | RTX 4070 8GB | 1TB PCIe 4.0 | Màn hình 16 inch OLED 2.5K 240Hz 0.2ms', 17);
INSERT INTO product_specifications (product_id, screen_size, resolution, refresh_rate, panel_type, raw_extra_specs) VALUES
(301, 16.0, '2560x1600', 240, 'OLED', '{"cpu": "Intel Core Ultra 7 155H", "ram": "32GB LPDDR5X 7467MHz", "vga": "NVIDIA GeForce RTX 4070 8GB GDDR6", "storage": "1TB M.2 NVMe PCIe 4.0", "battery": "90Wh", "weight": "1.85 kg"}');
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(301, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', TRUE);
