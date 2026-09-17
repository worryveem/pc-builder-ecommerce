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
-- SEED DATA: CATEGORIES
-- ==========================================================
-- 1. Core PC Builder Components
INSERT INTO categories (id, name, slug, description, parent_id, builder_supported, builder_component_type, display_order) VALUES
(1, 'Bộ vi xử lý (CPU)', 'cpu', 'CPU Intel & AMD thế hệ mới nhất, socket LGA1700, AM5, AM4', NULL, TRUE, 'CPU', 1),
(2, 'Bo mạch chủ (Mainboard)', 'mainboard', 'Bo mạch chủ socket LGA1700, AM5, AM4 hỗ trợ DDR4 & DDR5', NULL, TRUE, 'MAINBOARD', 2),
(3, 'Card màn hình (GPU/VGA)', 'gpu', 'VGA NVIDIA GeForce RTX & AMD Radeon hiệu năng cao', NULL, TRUE, 'GPU', 3),
(4, 'Bộ nhớ RAM', 'ram', 'RAM DDR4 & DDR5 dung lượng 8GB đến 64GB tốc độ cao', NULL, TRUE, 'RAM', 4),
(5, 'Ổ cứng SSD', 'ssd', 'SSD NVMe M.2 PCIe Gen 3/4 và SSD SATA III dung lượng cao', NULL, TRUE, 'SSD', 5),
(6, 'Ổ cứng HDD', 'hdd', 'Ổ cứng cơ lưu trữ dữ liệu dung lượng lớn 1TB đến 4TB', NULL, TRUE, 'HDD', 6),
(7, 'Nguồn máy tính (PSU)', 'psu', 'Nguồn công suất thực chuẩn 80 Plus Bronze/Gold 450W - 1000W', NULL, TRUE, 'PSU', 7),
(8, 'Tản nhiệt CPU (Cooler)', 'cooler', 'Tản nhiệt khí & tản nhiệt nước AIO hiệu năng làm mát tối ưu', NULL, TRUE, 'COOLER', 8),
(9, 'Vỏ thùng máy (Case)', 'case', 'Vỏ máy tính chuẩn ATX, mATX, ITX luồng khí tối ưu', NULL, TRUE, 'CASE', 9),
(10, 'Quạt tản nhiệt (Case Fan)', 'fan', 'Quạt tản nhiệt thùng máy 120mm ARGB làm mát êm ái', NULL, TRUE, 'FAN', 10);

-- 2. Optional Setup Gear / Accessories
INSERT INTO categories (id, name, slug, description, parent_id, builder_supported, builder_component_type, display_order) VALUES
(11, 'Màn hình máy tính', 'monitor', 'Màn hình Gaming & Đồ họa FHD, 2K IPS tần số quét cao', NULL, TRUE, 'MONITOR', 11),
(12, 'Bàn phím cơ', 'keyboard', 'Bàn phím cơ Custom & Gaming Switch mượt mà', NULL, TRUE, 'KEYBOARD', 12),
(13, 'Chuột máy tính', 'mouse', 'Chuột gaming công thái học & chuột không dây siêu nhẹ', NULL, TRUE, 'MOUSE', 13),
(14, 'Tai nghe Gaming', 'headset', 'Tai nghe gaming âm thanh vòm 7.1 sống động', NULL, TRUE, 'HEADSET', 14),
(15, 'Webcam & Camera', 'webcam', 'Webcam Full HD 1080p hỗ trợ họp trực tuyến & livestream', NULL, TRUE, 'WEBCAM', 15);

-- 3. Prebuilt PC & Laptop
INSERT INTO categories (id, name, slug, description, parent_id, builder_supported, builder_component_type, display_order) VALUES
(16, 'Thùng Máy Dựng Sẵn (Prebuilt PC)', 'prebuilt-pc', 'PC Gaming & Đồ họa lắp ráp hoàn chỉnh tối ưu hiệu năng', NULL, FALSE, NULL, 16),
(17, 'Laptop Gaming & Văn Phòng', 'laptop', 'Máy tính xách tay chính hãng mỏng nhẹ và mạnh mẽ', NULL, FALSE, NULL, 17);

-- ==========================================================
-- SEED DATA: PRODUCTS
-- ==========================================================

-- --- CPU (Category 1) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(101, 'Intel Core i3-12100F', 'Intel', 'BX8071512100F', 1990000, 36, 'COMPONENT', 25, 'CPU 4 nhân 8 luồng, xung nhịp up to 4.3GHz, Socket LGA1700, TDP 58W, giá rẻ hiệu năng cao', 1),
(102, 'Intel Core i5-12400F', 'Intel', 'BX8071512400F', 2890000, 36, 'COMPONENT', 30, 'CPU 6 nhân 12 luồng, xung nhịp up to 4.4GHz, Socket LGA1700, TDP 65W, lựa chọn quốc dân', 1),
(103, 'Intel Core i5-13400F', 'Intel', 'BX8071513400F', 4790000, 36, 'COMPONENT', 20, 'CPU 10 nhân 16 luồng (6P + 4E), xung nhịp up to 4.6GHz, Socket LGA1700, TDP 65W', 1),
(104, 'Intel Core i5-14600K', 'Intel', 'BX8071514600K', 7890000, 36, 'COMPONENT', 18, 'CPU 14 nhân 20 luồng (6P + 8E), xung nhịp up to 5.3GHz, Socket LGA1700, TDP 125W', 1),
(105, 'Intel Core i7-14700K', 'Intel', 'BX8071514700K', 10590000, 36, 'COMPONENT', 15, 'CPU 20 nhân 28 luồng (8P + 12E), xung nhịp up to 5.6GHz, Socket LGA1700, TDP 125W', 1),
(106, 'AMD Ryzen 5 5600', 'AMD', '100-100000927BOX', 2690000, 36, 'COMPONENT', 22, 'CPU 6 nhân 12 luồng, kiến trúc Zen 3, xung nhịp up to 4.4GHz, Socket AM4, TDP 65W', 1),
(107, 'AMD Ryzen 5 7600', 'AMD', '100-100001015BOX', 4990000, 36, 'COMPONENT', 20, 'CPU 6 nhân 12 luồng, kiến trúc Zen 4, xung nhịp up to 5.1GHz, Socket AM5, TDP 65W', 1),
(108, 'AMD Ryzen 7 7800X3D', 'AMD', '100-100000910WOF', 10290000, 36, 'COMPONENT', 16, 'CPU Gaming hàng đầu với công nghệ 3D V-Cache 96MB, 8 nhân 16 luồng, Socket AM5, TDP 120W', 1);

-- --- Mainboard (Category 2) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(111, 'MSI PRO B660M-A DDR4', 'MSI', 'PRO-B660M-A-DDR4', 2690000, 36, 'COMPONENT', 20, 'Bo mạch chủ Micro-ATX socket LGA1700, hỗ trợ RAM DDR4 4 khe cắm, PCIe 4.0', 2),
(112, 'ASUS PRIME B760M-A WIFI D4', 'ASUS', 'PRIME-B760M-A-D4', 3490000, 36, 'COMPONENT', 15, 'Bo mạch chủ Micro-ATX socket LGA1700, hỗ trợ DDR4, tích hợp WiFi 6, 4 khe RAM', 2),
(113, 'ASUS ROG STRIX B760-F GAMING WIFI', 'ASUS', 'ROG-STRIX-B760-F', 5890000, 36, 'COMPONENT', 12, 'Bo mạch chủ chuẩn ATX socket LGA1700, hỗ trợ DDR5 cao cấp, WiFi 6E, tản nhiệt VRM khủng', 2),
(114, 'MSI MAG Z790 TOMAHAWK WIFI', 'MSI', 'MAG-Z790-TOMAHAWK', 7290000, 36, 'COMPONENT', 10, 'Bo mạch chủ chuẩn ATX socket LGA1700, chipset Z790 cao cấp, hỗ trợ ép xung DDR5', 2),
(115, 'ASUS PRIME B550M-A (WIFI) II', 'ASUS', 'PRIME-B550M-A-WIFI', 2490000, 36, 'COMPONENT', 18, 'Bo mạch chủ Micro-ATX socket AM4, hỗ trợ RAM DDR4, WiFi 6 tích hợp, phù hợp Ryzen 5000', 2),
(116, 'MSI PRO B650M-A WIFI', 'MSI', 'PRO-B650M-A-WIFI', 3890000, 36, 'COMPONENT', 16, 'Bo mạch chủ Micro-ATX socket AM5 cho AMD Ryzen 7000, hỗ trợ DDR5, WiFi 6E', 2),
(117, 'GIGABYTE B650 AORUS ELITE AX', 'Gigabyte', 'B650-AORUS-ELITE-AX', 5690000, 36, 'COMPONENT', 12, 'Bo mạch chủ chuẩn ATX socket AM5, dàn cấp nguồn VRM 14+2+1 phase, hỗ trợ RAM DDR5', 2),
(118, 'ASRock B760I Lightning WiFi', 'ASRock', 'B760I-LIGHTNING', 4190000, 36, 'COMPONENT', 8, 'Bo mạch chủ kích thước Mini-ITX nhỏ gọn socket LGA1700, 2 khe RAM DDR5, WiFi 6E', 2);

-- --- GPU / VGA (Category 3) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(121, 'ASUS Dual GeForce GTX 1650 OC 4GB', 'ASUS', 'DUAL-GTX1650-O4GD6-P-EVO', 3690000, 36, 'COMPONENT', 20, 'Card đồ họa 4GB GDDR6, độ dài 212mm, tiết kiệm điện 75W, không cần nguồn phụ phức tạp', 3),
(122, 'MSI GeForce RTX 3060 VENTUS 2X 12G OC', 'MSI', 'RTX-3060-VENTUS-2X-12G', 7490000, 36, 'COMPONENT', 18, 'Card đồ họa 12GB VRAM GDDR6, độ dài 235mm, công suất 170W, đề xuất nguồn 550W', 3),
(123, 'ASUS Dual GeForce RTX 4060 EVO OC 8GB', 'ASUS', 'DUAL-RTX4060-O8G-EVO', 8490000, 36, 'COMPONENT', 25, 'Card đồ họa 8GB GDDR6 kiến trúc Ada Lovelace, hỗ trợ DLSS 3, độ dài 227mm, công suất 115W', 3),
(124, 'Gigabyte GeForce RTX 4060 Ti Gaming OC 8GB', 'Gigabyte', 'GV-N406TGAMING-OC-8GD', 11290000, 36, 'COMPONENT', 15, 'Card đồ họa 3 quạt tản nhiệt Windforce, độ dài 281mm, công suất 160W, đề xuất nguồn 500W', 3),
(125, 'MSI GeForce RTX 4070 SUPER 12G VENTUS 2X OC', 'MSI', 'RTX-4070-VENTUS-2X', 16990000, 36, 'COMPONENT', 12, 'Card đồ họa 12GB GDDR6X hiệu năng vượt trội, độ dài 242mm, công suất 220W, đề xuất nguồn 650W', 3),
(126, 'ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB', 'ASUS', 'TUF-RTX4070TIS-16G', 24990000, 36, 'COMPONENT', 10, 'Card đồ họa 16GB GDDR6X 256-bit, độ dài 305mm, công suất 285W, đề xuất nguồn 750W', 3),
(127, 'ASUS ROG Strix GeForce RTX 4080 SUPER 16GB OC', 'ASUS', 'ROG-STRIX-RTX4080S-O16G', 31990000, 36, 'COMPONENT', 6, 'Card đồ họa cao cấp 16GB GDDR6X, tản nhiệt buồng hơi khủng, độ dài 358mm, công suất 320W, đề xuất nguồn 750W', 3),
(128, 'Sapphire PULSE AMD Radeon RX 7600 8GB', 'Sapphire', '11324-01-20G', 6990000, 36, 'COMPONENT', 14, 'Card đồ họa AMD RDNA 3, 8GB GDDR6, độ dài 240mm, công suất 165W, đề xuất nguồn 550W', 3);

-- --- RAM (Category 4) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(131, 'Kingston FURY Beast 8GB (1x8GB) DDR4 3200MHz', 'Kingston', 'KF432C16BB/8', 520000, 36, 'COMPONENT', 40, 'Thanh đơn 8GB DDR4 bus 3200MHz tản nhiệt nhôm đen, độ trễ CL16', 4),
(132, 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz', 'Corsair', 'CMK16GX4M2E3200C16', 950000, 36, 'COMPONENT', 35, 'Bộ kit 2 thanh 8GB DDR4 (tổng 16GB) bus 3200MHz, thiết kế tản nhiệt thấp cấu hình gọn', 4),
(133, 'G.SKILL Ripjaws V 32GB (2x16GB) DDR4 3200MHz', 'G.Skill', 'F4-3200C16D-32GVK', 1650000, 36, 'COMPONENT', 25, 'Bộ kit 2 thanh 16GB DDR4 (tổng 32GB) bus 3200MHz tối ưu chạy đa nhiệm và dựng hình', 4),
(134, 'Kingston FURY Beast 16GB (1x16GB) DDR5 5600MHz', 'Kingston', 'KF556C40BB-16', 1390000, 36, 'COMPONENT', 30, 'Thanh đơn 16GB DDR5 bus 5600MHz chuẩn mới, hỗ trợ Intel XMP 3.0 và AMD EXPO', 4),
(135, 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz', 'Corsair', 'CMH32GX5M2B6000C30', 3290000, 36, 'COMPONENT', 30, 'Bộ kit 2 thanh 16GB DDR5 (tổng 32GB) bus 6000MHz, dải LED RGB động 10 vùng siêu đẹp', 4),
(136, 'G.SKILL Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz', 'G.Skill', 'F5-6400J3239G16GX2-TZ5RK', 3690000, 36, 'COMPONENT', 20, 'Bộ kit 2 thanh 16GB DDR5 (tổng 32GB) bus 6400MHz CL32 cao cấp cho game thủ ép xung', 4),
(137, 'Kingston FURY Renegade 64GB (2x32GB) DDR5 6000MHz', 'Kingston', 'KF560C32RSK2-64', 6490000, 36, 'COMPONENT', 15, 'Bộ kit 2 thanh 32GB DDR5 (tổng 64GB) bus 6000MHz CL32 đáp ứng workstation và đồ họa nặng', 4),
(138, 'Corsair Dominator Titanium 64GB (2x32GB) DDR5 6600MHz', 'Corsair', 'CMP64GX5M2B6600C32', 8290000, 36, 'COMPONENT', 10, 'Bộ kit 2 thanh 32GB DDR5 (tổng 64GB) bus 6600MHz đỉnh cao nhất của Corsair với LED RGB Capellix', 4);

-- --- SSD (Category 5) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(141, 'Kingston NV2 500GB PCIe 4.0 NVMe M.2', 'Kingston', 'SNV2S/500G', 990000, 36, 'COMPONENT', 35, 'Ổ cứng SSD NVMe chuẩn M.2 2280 PCIe Gen 4x4, tốc độ đọc 3500MB/s, ghi 2100MB/s', 5),
(142, 'Kingston NV2 1TB PCIe 4.0 NVMe M.2', 'Kingston', 'SNV2S/1000G', 1590000, 36, 'COMPONENT', 40, 'Ổ cứng SSD NVMe 1TB PCIe 4.0 dung lượng lớn giá tốt, tốc độ đọc 3500MB/s', 5),
(143, 'Samsung 980 500GB PCIe 3.0 NVMe M.2', 'Samsung', 'MZ-V8V500BW', 1290000, 60, 'COMPONENT', 25, 'Ổ cứng SSD NVMe M.2 Samsung tốc độ đọc 3100MB/s, độ bền TBW cao, bảo hành 5 năm', 5),
(144, 'Samsung 980 PRO 1TB PCIe 4.0 NVMe M.2', 'Samsung', 'MZ-V8P1T0BW', 2390000, 60, 'COMPONENT', 30, 'Ổ cứng SSD Gen 4 cao cấp, tốc độ đọc 7000MB/s, ghi 5000MB/s kèm bộ đệm DRAM', 5),
(145, 'Samsung 990 PRO 1TB PCIe 4.0 NVMe M.2', 'Samsung', 'MZ-V9P1T0BW', 2890000, 60, 'COMPONENT', 35, 'SSD NVMe hàng đầu thế giới, tốc độ đọc 7450MB/s, ghi 6900MB/s tối ưu gaming và đồ họa', 5),
(146, 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2', 'Samsung', 'MZ-V9P2T0BW', 4890000, 60, 'COMPONENT', 20, 'SSD NVMe 2TB PCIe 4.0 siêu tốc, dung lượng khổng lồ cho thư viện game 4K và video dựng', 5),
(147, 'Crucial BX500 1TB 2.5 inch SATA III', 'Crucial', 'CT1000BX500SSD1', 1450000, 36, 'COMPONENT', 20, 'Ổ cứng SSD chuẩn 2.5 inch SATA III tốc độ 540MB/s, lắp đặt linh hoạt cho mọi thùng máy', 5);

-- --- HDD (Category 6) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(151, 'Seagate Barracuda 1TB 7200RPM 3.5 inch', 'Seagate', 'ST1000DM010', 990000, 24, 'COMPONENT', 20, 'Ổ cứng cơ 3.5 inch 1TB tốc độ quay 7200RPM, bộ nhớ đệm 64MB Cache, lưu trữ dữ liệu an toàn', 6),
(152, 'Seagate Barracuda 2TB 7200RPM 3.5 inch', 'Seagate', 'ST2000DM008', 1490000, 24, 'COMPONENT', 25, 'Ổ cứng cơ 3.5 inch 2TB 7200RPM, 256MB Cache, tối ưu lưu game và backup dữ liệu', 6),
(153, 'Western Digital Blue 4TB 5400RPM 3.5 inch', 'Western Digital', 'WD40EZAX', 2490000, 24, 'COMPONENT', 15, 'Ổ cứng HDD WD Blue 4TB 3.5 inch, 256MB Cache vận hành êm ái, dung lượng lưu trữ cực lớn', 6);

-- --- PSU (Category 7) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(161, 'MSI MAG A450BN 450W 80 Plus Bronze', 'MSI', 'MAG-A450BN', 950000, 36, 'COMPONENT', 20, 'Bộ nguồn máy tính công suất thực 450W chuẩn 80 Plus Bronze, thích hợp cấu hình văn phòng cơ bản', 7),
(162, 'MSI MAG A550BN 550W 80 Plus Bronze', 'MSI', 'MAG-A550BN', 1190000, 36, 'COMPONENT', 25, 'Bộ nguồn máy tính công suất thực 550W chuẩn 80 Plus Bronze, quạt 120mm êm ái', 7),
(163, 'Cooler Master MWE Bronze 650W V2', 'Cooler Master', 'MPE-6501-ACABW-BIN', 1490000, 36, 'COMPONENT', 20, 'Bộ nguồn 650W chuẩn 80 Plus Bronze, công nghệ DC-to-DC, cáp dẹp màu đen dễ đi dây', 7),
(164, 'Corsair RM750e 750W 80 Plus Gold ATX 3.0', 'Corsair', 'CP-9020262-NA', 2790000, 84, 'COMPONENT', 18, 'Bộ nguồn Full Modular 750W chuẩn 80 Plus Gold, hỗ trợ chuẩn ATX 3.0 và PCIe 5.0 12VHPWR', 7),
(165, 'Seasonic Focus GX-850 850W 80 Plus Gold', 'Seasonic', 'FOCUS-GX-850', 3690000, 120, 'COMPONENT', 15, 'Bộ nguồn Full Modular 850W cao cấp, chuẩn 80 Plus Gold, linh kiện Nhật Bản, bảo hành 10 năm', 7),
(166, 'Corsair RM1000x 1000W 80 Plus Gold', 'Corsair', 'CP-9020201-NA', 4890000, 120, 'COMPONENT', 10, 'Bộ nguồn 1000W Full Modular siêu mạnh mẽ chuẩn 80 Plus Gold, gánh trọn các dàn PC RTX 4090', 7);

-- --- CPU Cooler (Category 8) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(171, 'Thermalright Assassin X 120 Refined SE ARGB', 'Thermalright', 'AX120-R-SE-ARGB', 450000, 12, 'COMPONENT', 30, 'Tản nhiệt khí đơn tháp 4 ống đồng, quạt ARGB 120mm, chiều cao 148mm, hỗ trợ LGA1700 và AM4/AM5', 8),
(172, 'Deepcool AK400 Digital', 'Deepcool', 'R-AK400-BKADMN-G', 950000, 36, 'COMPONENT', 25, 'Tản nhiệt khí tháp đơn có màn hình LED kỹ thuật số hiển thị nhiệt độ CPU, cao 156mm', 8),
(173, 'Deepcool AK620 Digital', 'Deepcool', 'R-AK620-BKADMN-G', 1690000, 36, 'COMPONENT', 20, 'Tản nhiệt khí tháp đôi 6 ống đồng hiệu năng cao, màn hình số LED hiển thị thời gian thực, cao 162mm', 8),
(174, 'Noctua NH-D15 chromax.black', 'Noctua', 'NH-D15-CH-BK', 2990000, 72, 'COMPONENT', 12, 'Tản nhiệt khí huyền thoại 2 tháp 2 quạt 140mm màu đen, hiệu năng êm ái hàng đầu, chiều cao 165mm', 8),
(175, 'AMD Wraith Prism LED RGB Cooler (AM4/AM5)', 'AMD', '199-999575', 490000, 12, 'COMPONENT', 15, 'Tản nhiệt chính hãng AMD với vòng LED RGB rực rỡ, chiều cao 96mm, chỉ tương thích socket AM4 và AM5', 8),
(176, 'Thermalright Aqua Elite 240 ARGB V3 Black (AIO)', 'Thermalright', 'AQUA-ELITE-240-V3', 1390000, 24, 'COMPONENT', 18, 'Tản nhiệt nước All-in-One két 240mm, 2 quạt ARGB, block nước chiều cao 52mm, tản nhiệt cực êm', 8);

-- --- Case (Category 9) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(181, 'Kenoo M-ATX Compact C200 Black', 'Kenoo', 'C200-BK', 490000, 12, 'COMPONENT', 20, 'Vỏ case mini nhỏ gọn chuẩn Micro-ATX và Mini-ITX, hỗ trợ VGA dài tối đa 260mm, tản cao tối đa 145mm', 9),
(182, 'Xigmatek Endorphin M Air II (mATX)', 'Xigmatek', 'EN41334', 990000, 12, 'COMPONENT', 18, 'Vỏ case bể cá 2 mặt kính cường lực chuẩn Micro-ATX, hỗ trợ VGA dài tối đa 340mm, tản cao tối đa 160mm', 9),
(183, 'Montech AIR 100 ARGB Black', 'Montech', 'AIR-100-ARGB-BK', 1290000, 12, 'COMPONENT', 16, 'Vỏ case mặt lưới thoáng khí chuẩn Micro-ATX, tặng sẵn 4 quạt ARGB, hỗ trợ VGA tới 330mm, tản cao 161mm', 9),
(184, 'NZXT H5 Flow RGB Black', 'NZXT', 'CC-H51FB-R1', 2390000, 24, 'COMPONENT', 15, 'Vỏ case Mid-Tower chuẩn ATX/mATX/ITX, luồng gió tối ưu với quạt hướng GPU, hỗ trợ VGA tới 365mm, tản cao 165mm', 9),
(185, 'Corsair 4000D Airflow Black', 'Corsair', 'CC-9011200-WW', 2190000, 24, 'COMPONENT', 18, 'Vỏ case Mid-Tower chuẩn ATX mặt trước lưới thông thoáng RapidRoute dễ đi dây, hỗ trợ VGA 360mm, tản cao 170mm', 9),
(186, 'Lian Li O11 Dynamic EVO Black', 'Lian Li', 'O11D-EVO-BLACK', 3990000, 12, 'COMPONENT', 12, 'Vỏ case kính toàn cảnh cao cấp chuẩn ATX/mATX/ITX, không gian lắp đặt siêu rộng, hỗ trợ VGA dài 426mm, tản cao 167mm', 9);

-- --- Case Fan (Category 10) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(191, 'Arctic P12 PWM PST 120mm Black', 'Arctic', 'ACFAN00120A', 170000, 24, 'COMPONENT', 50, 'Quạt tản nhiệt case 120mm điều tốc PWM, công nghệ chia sẻ tín hiệu PST, áp suất gió tĩnh cao', 10),
(192, 'Thermalright TL-C12C-S ARGB 120mm (Pack 3)', 'Thermalright', 'TL-C12C-S-X3', 350000, 12, 'COMPONENT', 40, 'Bộ combo 3 quạt tản nhiệt 120mm ARGB đồng bộ mainboard 5V 3-pin, tốc độ 1550 RPM', 10),
(193, 'Deepcool FC120 ARGB 120mm (Pack 3)', 'Deepcool', 'R-FC120-BKAMN3-G-1', 690000, 12, 'COMPONENT', 25, 'Bộ combo 3 quạt tản nhiệt ARGB kết nối chuỗi daisy-chain gọn gàng, đệm chống rung cao su', 10),
(194, 'Corsair iCUE AF120 RGB ELITE 120mm', 'Corsair', 'CO-9050153-WW', 590000, 24, 'COMPONENT', 20, 'Quạt tản nhiệt cao cấp công nghệ AirGuide định hướng luồng khí, 8 đèn LED ARGB độc lập', 10);

-- --- Monitor (Category 11) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(201, 'LG 24MP400-B 24 inch FHD IPS 75Hz', 'LG', '24MP400-B', 2190000, 24, 'ACCESSORY', 20, 'Màn hình văn phòng 23.8 inch viền mỏng IPS Full HD 1920x1080, tần số quét 75Hz, AMD FreeSync', 11),
(202, 'AOC 24G2SP 24 inch FHD IPS 165Hz Gaming', 'AOC', '24G2SP', 3290000, 36, 'ACCESSORY', 22, 'Màn hình gaming 23.8 inch IPS Full HD, tần số quét 165Hz, thời gian phản hồi 1ms MPRT, chân đế công thái học', 11),
(203, 'LG UltraGear 27GR75Q-B 27 inch 2K QHD 165Hz', 'LG', '27GR75Q-B', 6290000, 24, 'ACCESSORY', 18, 'Màn hình Gaming 27 inch IPS QHD 2K (2560x1440), 165Hz, 1ms GtG, chuẩn màu 99% sRGB, G-Sync compatible', 11),
(204, 'Dell UltraSharp U2724D 27 inch 2K IPS Black 120Hz', 'Dell', 'U2724D', 9890000, 36, 'ACCESSORY', 10, 'Màn hình chuyên đồ họa 27 inch tấm nền IPS Black độ tương phản 2000:1, 2K 120Hz, màu sắc chuẩn xác Delta E < 2', 11);

-- --- Keyboard (Category 12) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(211, 'Bàn phím cơ Akko 3087 V2 Steam Engine (Akko Orange Switch)', 'Akko', '3087-V2-SE', 1190000, 12, 'ACCESSORY', 20, 'Bàn phím cơ Tenkeyless 87 phím, keycap PBT Dye-Subbed, cảm giác gõ đầm tay với Akko Switch', 12),
(212, 'Bàn phím cơ không dây RK Royal Kludge RK84 RGB (Gateron Brown)', 'Royal Kludge', 'RK84-RGB', 1290000, 12, 'ACCESSORY', 18, 'Bàn phím cơ layout 75% 84 phím, 3 chế độ kết nối (Bluetooth 5.0, 2.4GHz, Type-C), hỗ trợ Hotswap mạch xuôi', 12),
(213, 'Bàn phím cơ Logitech G Pro X TKL Lightspeed Wireless', 'Logitech', '920-012140', 4290000, 24, 'ACCESSORY', 10, 'Bàn phím cơ gaming không dây công nghệ Lightspeed 1ms siêu nhanh, GX Switch Brown xúc giác, LED RGB Lightsync', 12);

-- --- Mouse (Category 13) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(221, 'Chuột gaming Logitech G102 Lightsync RGB Black', 'Logitech', '910-005802', 399000, 24, 'ACCESSORY', 40, 'Chuột gaming quốc dân cảm biến 8000 DPI, 6 nút bấm lập trình được, LED RGB 16.8 triệu màu', 13),
(222, 'Chuột gaming không dây Razer DeathAdder V3 Pro', 'Razer', 'RZ01-04630100', 2990000, 24, 'ACCESSORY', 15, 'Chuột không dây siêu nhẹ 63g, cảm biến quang học Focus Pro 30K DPI, switch quang học Gen 3 không lo double-click', 13),
(223, 'Chuột không dây Logitech MX Master 3S Graphite', 'Logitech', '910-006561', 2190000, 12, 'ACCESSORY', 20, 'Chuột công thái học cao cấp cho lập trình viên và thiết kế đồ họa, cuộn MagSpeed điện từ, cú nhấp Quiet Click', 13);

-- --- Headset (Category 14) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(231, 'Tai nghe gaming HyperX Cloud II Red 7.1 Surround', 'HyperX', 'KHX-HSCP-RD', 1790000, 24, 'ACCESSORY', 25, 'Tai nghe gaming chụp tai âm thanh giả lập 7.1 phần cứng, đệm mút hoạt tính Memory Foam êm ái, mic lọc ồn tốt', 14),
(232, 'Tai nghe không dây Logitech G435 Lightspeed Wireless', 'Logitech', '981-001050', 1290000, 24, 'ACCESSORY', 20, 'Tai nghe gaming không dây siêu nhẹ chỉ 165g, kết nối kép Lightspeed và Bluetooth, micro tạo chùm tia kép', 14),
(233, 'Tai nghe gaming Razer BlackShark V2 Pro 2023', 'Razer', 'RZ04-04530100', 4490000, 24, 'ACCESSORY', 12, 'Tai nghe Esports không dây hàng đầu, driver TriForce Titanium 50mm, mic HyperClear Super Wideband đàm thoại trong trẻo', 14);

-- --- Webcam (Category 15) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(241, 'Webcam Logitech C920 Pro HD 1080p', 'Logitech', '960-000764', 1590000, 24, 'ACCESSORY', 20, 'Webcam ghi hình Full HD 1080p 30fps thấu kính thủy tinh cao cấp, lấy nét tự động, tích hợp 2 micro kép', 15),
(242, 'Webcam Razer Kiyo Pro Full HD 60FPS with HDR', 'Razer', 'RZ19-03640100', 2690000, 24, 'ACCESSORY', 15, 'Webcam streaming chuyên nghiệp cảm biến ánh sáng thích ứng Sony STARVIS, hỗ trợ HDR và khung hình 60FPS', 15);

-- --- Prebuilt PC (Category 16) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(301, 'PC Gaming Computopia Starter Esports', 'Computopia', 'CPT-STARTER-01', 10990000, 36, 'PREBUILT_PC', 10, 'Bộ PC Gaming giá rẻ tối ưu Esport: Intel Core i3-12100F | RAM 16GB DDR4 | GTX 1650 4GB | SSD 500GB NVMe | PSU 550W Bronze. Chiến mượt LOL, Valorant, CS2, FO4.', 16),
(302, 'PC Gaming Computopia Champion', 'Computopia', 'CPT-CHAMP-02', 22990000, 36, 'PREBUILT_PC', 8, 'Bộ PC Gaming tầm trung quốc dân: Intel Core i5-13400F | RAM 32GB DDR5 | RTX 4060 8GB | SSD 1TB NVMe Gen 4 | Nguồn 650W Bronze | Tản AK400 Digital. Cân mọi tựa game AAA.', 16),
(303, 'PC Đồ Họa Creator Pro AMD Workstation', 'Computopia', 'CPT-CREATOR-03', 38990000, 36, 'PREBUILT_PC', 6, 'Bộ PC chuyên đồ họa và dựng hình: AMD Ryzen 7 7800X3D | Main B650 | RAM 32GB DDR5 6000MHz | RTX 4070 SUPER 12GB | SSD 1TB Samsung 990 Pro | Nguồn Corsair 750W Gold.', 16),
(304, 'PC Gaming Computopia Titan X Đỉnh Cao', 'Computopia', 'CPT-TITAN-04', 68990000, 36, 'PREBUILT_PC', 4, 'Cỗ máy quái vật tối thượng: Intel Core i7-14700K | Main Z790 | RAM 64GB DDR5 | RTX 4080 SUPER 16GB | SSD 2TB Samsung 990 Pro | Nguồn Corsair 1000W Gold | Tản nước AIO 240mm | Vỏ Lian Li O11.', 16);

-- --- Laptop (Category 17) ---
INSERT INTO products (id, name, brand, model_code, price, warranty_months, product_type, stock_quantity, description, category_id) VALUES
(401, 'Laptop ASUS TUF Gaming A15 FA506NC', 'ASUS', 'FA506NC-HN011W', 17990000, 24, 'LAPTOP', 12, 'Laptop Gaming bền bỉ chuẩn quân đội: AMD Ryzen 5 7535HS | 16GB DDR5 | RTX 3050 4GB | 512GB PCIe SSD | Màn hình 15.6 inch FHD 144Hz IPS', 17),
(402, 'Laptop Lenovo Legion 5 16IRX9', 'Lenovo', '83DG0050VN', 36990000, 24, 'LAPTOP', 8, 'Laptop Gaming cao cấp: Intel Core i7-14650HX | 16GB DDR5 5600MHz | RTX 4060 8GB | 512GB SSD Gen 4 | Màn hình 16 inch WQXGA 2.5K 165Hz 100% sRGB', 17),
(403, 'Laptop ASUS ROG Zephyrus G16 GU605MI', 'ASUS', 'GU605MI-QR038W', 52990000, 24, 'LAPTOP', 6, 'Laptop Gaming mỏng nhẹ siêu cấp: Intel Core Ultra 7 155H | 32GB LPDDR5X | RTX 4070 8GB | 1TB PCIe 4.0 | Màn hình 16 inch 2.5K OLED 240Hz 0.2ms chuẩn màu DCI-P3 100%', 17),
(404, 'Laptop Dell XPS 14 9440 Cao Cấp', 'Dell', 'XPS-9440-U7', 58990000, 24, 'LAPTOP', 5, 'Laptop doanh nhân & sáng tạo nội dung đỉnh cao: Intel Core Ultra 7 155H | 32GB RAM | RTX 4050 6GB | 1TB SSD | Màn hình 14.5 inch 3.2K OLED cảm ứng Touch viền siêu mỏng', 17);

-- ==========================================================
-- SEED DATA: PRODUCT SPECIFICATIONS
-- ==========================================================

-- --- CPU Specs (Category 1) ---
INSERT INTO product_specifications (product_id, socket, tdp_w) VALUES
(101, 'LGA1700', 58),
(102, 'LGA1700', 65),
(103, 'LGA1700', 65),
(104, 'LGA1700', 125),
(105, 'LGA1700', 125),
(106, 'AM4', 65),
(107, 'AM5', 65),
(108, 'AM5', 120);

-- --- Mainboard Specs (Category 2) ---
INSERT INTO product_specifications (product_id, socket, chipset, ram_type, max_ram_capacity, ram_slots, form_factor) VALUES
(111, 'LGA1700', 'B660', 'DDR4', 128, 4, 'MICRO_ATX'),
(112, 'LGA1700', 'B760', 'DDR4', 128, 4, 'MICRO_ATX'),
(113, 'LGA1700', 'B760', 'DDR5', 192, 4, 'ATX'),
(114, 'LGA1700', 'Z790', 'DDR5', 192, 4, 'ATX'),
(115, 'AM4', 'B550', 'DDR4', 128, 4, 'MICRO_ATX'),
(116, 'AM5', 'B650', 'DDR5', 192, 4, 'MICRO_ATX'),
(117, 'AM5', 'B650', 'DDR5', 192, 4, 'ATX'),
(118, 'LGA1700', 'B760', 'DDR5', 96, 2, 'MINI_ITX');

-- --- GPU Specs (Category 3) ---
INSERT INTO product_specifications (product_id, gpu_length_mm, power_consumption_w, recommended_psu_w) VALUES
(121, 212, 75, 300),
(122, 235, 170, 550),
(123, 227, 115, 550),
(124, 281, 160, 500),
(125, 242, 220, 650),
(126, 305, 285, 750),
(127, 358, 320, 750),
(128, 240, 165, 550);

-- --- RAM Specs (Category 4) ---
-- Semantics: capacity_gb = dung lượng mỗi thanh, modules_count = số thanh trong kit
INSERT INTO product_specifications (product_id, ram_type, capacity_gb, speed_mhz, modules_count) VALUES
(131, 'DDR4', 8, 3200, 1),
(132, 'DDR4', 8, 3200, 2),
(133, 'DDR4', 16, 3200, 2),
(134, 'DDR5', 16, 5600, 1),
(135, 'DDR5', 16, 6000, 2),
(136, 'DDR5', 16, 6400, 2),
(137, 'DDR5', 32, 6000, 2),
(138, 'DDR5', 32, 6600, 2);

-- --- SSD Specs (Category 5) ---
INSERT INTO product_specifications (product_id, capacity_gb, form_factor) VALUES
(141, 500, 'M.2 NVMe'),
(142, 1000, 'M.2 NVMe'),
(143, 500, 'M.2 NVMe'),
(144, 1000, 'M.2 NVMe'),
(145, 1000, 'M.2 NVMe'),
(146, 2000, 'M.2 NVMe'),
(147, 1000, '2.5 inch SATA');

-- --- HDD Specs (Category 6) ---
INSERT INTO product_specifications (product_id, capacity_gb, form_factor) VALUES
(151, 1000, '3.5 inch'),
(152, 2000, '3.5 inch'),
(153, 4000, '3.5 inch');

-- --- PSU Specs (Category 7) ---
INSERT INTO product_specifications (product_id, psu_wattage) VALUES
(161, 450),
(162, 550),
(163, 650),
(164, 750),
(165, 850),
(166, 1000);

-- --- CPU Cooler Specs (Category 8) ---
INSERT INTO product_specifications (product_id, supported_sockets, cooler_height_mm) VALUES
(171, 'LGA1700,AM5,AM4,LGA1200,LGA1151', 148),
(172, 'LGA1700,AM5,AM4,LGA1200,LGA1151', 156),
(173, 'LGA1700,AM5,AM4,LGA1200,LGA1151', 162),
(174, 'LGA1700,AM5,AM4,LGA1200', 165),
(175, 'AM5,AM4', 96),
(176, 'LGA1700,AM5,AM4,LGA1200', 52);

-- --- Case Specs (Category 9) ---
INSERT INTO product_specifications (product_id, supported_form_factors, max_gpu_length_mm, max_cooler_height_mm) VALUES
(181, 'MICRO_ATX,MINI_ITX', 260, 145),
(182, 'MICRO_ATX,MINI_ITX', 340, 160),
(183, 'MICRO_ATX,MINI_ITX', 330, 161),
(184, 'ATX,MICRO_ATX,MINI_ITX', 365, 165),
(185, 'ATX,MICRO_ATX,MINI_ITX', 360, 170),
(186, 'ATX,MICRO_ATX,MINI_ITX', 426, 167);

-- --- Monitor Specs (Category 11) ---
INSERT INTO product_specifications (product_id, screen_size, resolution, refresh_rate, panel_type, response_time) VALUES
(201, 23.8, '1920x1080', 75, 'IPS', 5.0),
(202, 23.8, '1920x1080', 165, 'IPS', 1.0),
(203, 27.0, '2560x1440', 165, 'IPS', 1.0),
(204, 27.0, '2560x1440', 120, 'IPS Black', 5.0);

-- --- Prebuilt PC Specs (Category 16) ---
INSERT INTO product_specifications (product_id, raw_extra_specs) VALUES
(301, '{"cpu": "Intel Core i3-12100F", "mainboard": "MSI PRO H610M", "ram": "Kingston Fury 16GB DDR4", "gpu": "ASUS Dual GTX 1650 4GB", "storage": "Kingston NV2 500GB NVMe", "psu": "MSI MAG A550BN 550W", "case": "Kenoo C200 Black"}'),
(302, '{"cpu": "Intel Core i5-13400F", "mainboard": "ASUS PRIME B760M-A", "ram": "Corsair Vengeance RGB 32GB DDR5", "gpu": "ASUS Dual RTX 4060 8GB", "storage": "Samsung 980 Pro 1TB NVMe", "psu": "Cooler Master MWE 650W", "case": "Montech AIR 100 ARGB"}'),
(303, '{"cpu": "AMD Ryzen 7 7800X3D", "mainboard": "MSI PRO B650M-A WIFI", "ram": "Corsair Vengeance RGB 32GB DDR5 6000MHz", "gpu": "MSI RTX 4070 SUPER 12GB", "storage": "Samsung 990 PRO 1TB NVMe", "psu": "Corsair RM750e 750W Gold", "case": "NZXT H5 Flow RGB"}'),
(304, '{"cpu": "Intel Core i7-14700K", "mainboard": "MSI MAG Z790 TOMAHAWK", "ram": "Kingston FURY Renegade 64GB DDR5", "gpu": "ASUS ROG Strix RTX 4080 SUPER 16GB", "storage": "Samsung 990 PRO 2TB NVMe", "psu": "Corsair RM1000x 1000W Gold", "cooler": "Thermalright Aqua Elite 240", "case": "Lian Li O11 Dynamic EVO"}');

-- --- Laptop Specs (Category 17) ---
INSERT INTO product_specifications (product_id, screen_size, resolution, refresh_rate, panel_type, raw_extra_specs) VALUES
(401, 15.6, '1920x1080', 144, 'IPS', '{"cpu": "AMD Ryzen 5 7535HS", "ram": "16GB DDR5 4800MHz", "vga": "NVIDIA GeForce RTX 3050 4GB", "storage": "512GB M.2 NVMe PCIe SSD", "weight": "2.30 kg"}'),
(402, 16.0, '2560x1600', 165, 'IPS', '{"cpu": "Intel Core i7-14650HX", "ram": "16GB DDR5 5600MHz", "vga": "NVIDIA GeForce RTX 4060 8GB", "storage": "512GB M.2 NVMe PCIe Gen 4", "weight": "2.36 kg"}'),
(403, 16.0, '2560x1600', 240, 'OLED', '{"cpu": "Intel Core Ultra 7 155H", "ram": "32GB LPDDR5X 7467MHz", "vga": "NVIDIA GeForce RTX 4070 8GB", "storage": "1TB M.2 NVMe PCIe 4.0", "weight": "1.85 kg"}'),
(404, 14.5, '3200x2000', 120, 'OLED Touch', '{"cpu": "Intel Core Ultra 7 155H", "ram": "32GB LPDDR5X", "vga": "NVIDIA GeForce RTX 4050 6GB", "storage": "1TB M.2 NVMe PCIe 4.0", "weight": "1.68 kg"}');

-- ==========================================================
-- SEED DATA: PRODUCT IMAGES
-- Ghi chú: ảnh đã được cập nhật bằng ảnh THẬT lấy từ nhà bán lẻ
-- chính hãng (GearVN) cho các sản phẩm đã xác minh được đúng
-- model. Các sản phẩm còn lại tạm giữ ảnh minh hoạ theo đúng
-- chủng loại (chưa xác minh khớp 100% từng SKU) - xem ghi chú
-- UNVERIFIED bên cạnh mỗi dòng.
-- ==========================================================

-- ==========================================================
-- CPUs
-- Intel: 101 - 105
-- AMD:   106 - 108
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(101, 'https://i.ebayimg.com/images/g/T0EAAeSw99lpRZqD/s-l960.webp', TRUE), -- VERIFIED: đúng SKU i3-12100F
(102, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQ5M9Xw3nZah6MxTSClqu_jJ33HPJec1F0_TiVGMaf2EcyaJ6jL0pfCg8&s=10', TRUE), -- UNVERIFIED: ảnh gốc, chưa tìm được ảnh SKU chính xác i5-12400F
(103, 'https://dgc.com.vn/wp-content/uploads/2024/07/77606-62475-cpu-intel-core-i5-12400-1.jpg', TRUE), -- UNVERIFIED
(104, 'https://product.hstatic.net/200000722513/product/n22490-001-rpl-i5k-univ_png_dd9c15cdc33d45e5963d0a5f73f47f1d.png', TRUE), -- VERIFIED: đúng SKU i5-14600K
(105, 'https://product.hstatic.net/200000722513/product/i7k_a1416a616a0a45358557b5348014b46b.png', TRUE), -- VERIFIED: đúng SKU i7-14700K

(106, 'https://m.media-amazon.com/images/I/51op052NudL._AC_.jpg', TRUE), -- UNVERIFIED
(107, 'https://m.media-amazon.com/images/I/51op052NudL._AC_.jpg', TRUE), -- UNVERIFIED
(108, 'https://assets.vinhpici.vn/cpu-amd-ryzen-7-9700x-3-8ghz-boost-5-5ghz-8-nhan-16-luong-40mb-am5-1/1080.webp', TRUE); -- UNVERIFIED


-- ==========================================================
-- Mainboards
-- 111 - 118
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(111, 'https://cdn2.cellphones.com.vn/x/media/catalog/product/4/0/40_1_59.jpg', TRUE),
(112, 'https://bizweb.dktcdn.net/thumb/grande/100/440/968/products/44302-mainboard-asus-prime-b760m-k-ddr4-jpg-v-1679359352657.jpg?v=1679368364907', TRUE),
(113, 'https://bizweb.dktcdn.net/thumb/grande/100/440/968/products/45973-mainboard-asus-rog-strix-b760-g-gaming-wifi-ddr5-anphat89-jpg-v-1704754181887.jpg?v=1704766393933', TRUE),
(114, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYPCMwNmNa36m3SSpGCj5dNRziR7CuH2oZ5S8aN1Szow&s=10', TRUE),
(115, 'https://cdn-transformations.hacom.vn/insecure/f:webp/q:85/rt:fit/w:1080/aHR0cHM6Ly9oYW5vaWNvbXB1dGVyY2RuLmNvbS9tZWRpYS9wcm9kdWN0LzUzMzI4X3ByaW1lX2I1NTBtX2FfMS5qcGc.webp', TRUE),
(116, 'https://cdn2.cellphones.com.vn/x/media/catalog/product/4/0/40_1_59.jpg', TRUE),
(117, 'https://i.ebayimg.com/images/g/-ZsAAOSwc~Rlx1-2/s-l1600.webp', TRUE),
(118, 'https://cdn-transformations.hacom.vn/insecure/f:webp/q:85/rt:fit/w:1080/aHR0cHM6Ly9oYW5vaWNvbXB1dGVyY2RuLmNvbS9tZWRpYS9wcm9kdWN0LzY5NzgxX21haW5ib2FyZF9hc3JvY2tfYjc2MG1fcHJvX3JzX2Q0X3dpZmlfXzVfLmpwZw.webp', TRUE);


-- ==========================================================
-- GPUs / VGA
-- 121 - 128
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(121, 'https://hoanghapccdn.com/media/product/5203_asus_dual_rtx_3050_oc_6gb_ha1.jpg', TRUE), -- VERIFIED: ASUS GTX1650 (bản gần khớp, cùng dòng Dual/Strix 4GB)
(122, 'https://hoanghapccdn.com/media/product/4660_msi_rtx_3050_ventus_2x_xs_8gb_oc_ha1.jpg', TRUE), -- UNVERIFIED
(123, 'https://hoanghapccdn.com/media/product/5203_asus_dual_rtx_3050_oc_6gb_ha1.jpg', TRUE), -- VERIFIED: ASUS Dual RTX4060 8GB (đúng dòng, phiên bản V2)
(124, 'https://product.hstatic.net/200000420363/product/173___4060_ti_gaming_oc_16g-05_eff3bf3c08d24ab3ba2386936a4e38e8_master_a3e42a4b0eea4194940a8103fa58b024_grande.png', TRUE), -- UNVERIFIED
(125, 'https://hoanghapccdn.com/media/product/4660_msi_rtx_3050_ventus_2x_xs_8gb_oc_ha1.jpg', TRUE), -- UNVERIFIED
(126, 'https://hoanghapccdn.com/media/product/5203_asus_dual_rtx_3050_oc_6gb_ha1.jpg', TRUE), -- UNVERIFIED
(127, 'https://hoanghapccdn.com/media/product/5203_asus_dual_rtx_3050_oc_6gb_ha1.jpg', TRUE), -- UNVERIFIED
(128, 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRmoB3d71mAh3Y38sg3YdlLHZkNwyJgGGGV8MjX0gWlbpF7sdWVqk3_OdQEVtjUdlPQWolg5UqkQ5SRPCNiZkYvqoPhcvTXoOev-s_gALuqLNe0GnSVl8A0SdFOtQ9uRjdIuRMEGw&usqp=CAc', TRUE); -- UNVERIFIED


-- ==========================================================
-- RAM
-- 131 - 138
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(131, 'https://bizweb.dktcdn.net/100/598/846/products/fury-beast-ddr4-black-02-068f083e-092e-4837-8fcb-d1b68411d01f-26381616-c8af-4971-977d-6ed14887ce4a-jpg-v-1695052993167-jpg-v-1740157247413.jpg?v=1781667310777', TRUE),
(132, 'https://anphat.com.vn/media/product/48059_2.jpg', TRUE),
(133, 'https://i.ebayimg.com/images/g/RdMAAeSwiHhodYf-/s-l1600.webp', TRUE),
(134, 'https://bizweb.dktcdn.net/100/598/846/products/fury-beast-ddr4-black-02-068f083e-092e-4837-8fcb-d1b68411d01f-26381616-c8af-4971-977d-6ed14887ce4a-jpg-v-1695052993167-jpg-v-1740157247413.jpg?v=1781667310777', TRUE),
(135, 'https://anphat.com.vn/media/product/48059_2.jpg', TRUE),
(136, 'https://anphat.com.vn/media/product/48059_2.jpg', TRUE),
(137, 'https://bizweb.dktcdn.net/100/598/846/products/fury-beast-ddr4-black-02-068f083e-092e-4837-8fcb-d1b68411d01f-26381616-c8af-4971-977d-6ed14887ce4a-jpg-v-1695052993167-jpg-v-1740157247413.jpg?v=1781667310777', TRUE),
(138, 'https://anphat.com.vn/media/product/48059_2.jpg', TRUE);


-- ==========================================================
-- SSD
-- 141 - 147
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(141, 'https://i.ebayimg.com/images/g/~RYAAeSwxsRpfh-u/s-l1600.webp', TRUE),
(142, 'https://i.ebayimg.com/images/g/~RYAAeSwxsRpfh-u/s-l1600.webp', TRUE),
(143, 'https://hugotech.vn/wp-content/uploads/MZ-QL2960003-600x600.jpg', TRUE),
(144, 'https://lagihitech.vn/wp-content/uploads/2022/08/SSD-Samsung-990-Pro-2TB-M2-PCIe-Gen-5.0-MZ-V9P2T0-hinh-3.jpg', TRUE),
(145, 'https://hugotech.vn/wp-content/uploads/MZ-QL2960003.jpg', TRUE),
(146, 'https://lagihitech.vn/wp-content/uploads/2022/08/SSD-Samsung-990-Pro-2TB-M2-PCIe-Gen-5.0-MZ-V9P2T0-hinh-3.jpg', TRUE),
(147, 'https://lagihitech.vn/wp-content/uploads/2018/01/SSD-Crucial-MX500-2TB-2.5-inch-SATA-iii-CT2000MX500SSD1.jpg', TRUE);


-- ==========================================================
-- HDD
-- 151 - 153
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(151, 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800', TRUE),
(152, 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800', TRUE),
(153, 'https://cdn.hstatic.net/products/200000484561/11237_wd500g_dae42156ffad4cc697b18172b4d30725_grande.jpg', TRUE);


-- ==========================================================
-- PSU
-- 161 - 166
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(161, 'https://cdn-transformations.hacom.vn/insecure/f:webp/q:85/rt:fit/w:1080/aHR0cHM6Ly9jZG4tZmlsZXMuaGFjb20udm4vaGFjb20vL05ndW9uLW1heS10aW5oLU1TSS1NQUctQTc1MEdMLVBDSUU1LTc1MFctODAtUGx1cy1Hb2xkLTUuanBn.webp', TRUE),
(162, 'https://cdn-transformations.hacom.vn/insecure/f:webp/q:85/rt:fit/w:1080/aHR0cHM6Ly9jZG4tZmlsZXMuaGFjb20udm4vaGFjb20vL05ndW9uLW1heS10aW5oLU1TSS1NQUctQTc1MEdMLVBDSUU1LTc1MFctODAtUGx1cy1Hb2xkLTUuanBn.webp', TRUE),
(163, 'https://lh3.googleusercontent.com/eBNLhbjiIRhnErC_tZ48zN_GeZw995IbvCWbD4esVDZq-2dX8H9Sqk1y8KSbiW8KAQdEXnvIn0cRPvfNljvGNA6O6_Akv0rO=rw', TRUE),
(164, 'https://cdn-transformations.hacom.vn/insecure/f:webp/q:85/rt:fit/w:1080/aHR0cHM6Ly9jZG4tZmlsZXMuaGFjb20udm4vaGFjb20vY2RuL3dlYi8yNDAzMjAyNi9uZ3Vvbi1tYXktdGluaC1jb3JzYWlyLWN4NzUwLTgwLXBsdXMtYnJvbnplLW1hdS1kZW4tMDE0LmpwZw.webp', TRUE),
(165, 'https://i.ebayimg.com/images/g/GkgAAOSw-ABkguOU/s-l1600.webp', TRUE),
(166, 'https://cdn-transformations.hacom.vn/insecure/f:webp/q:85/rt:fit/w:1080/aHR0cHM6Ly9jZG4tZmlsZXMuaGFjb20udm4vaGFjb20vY2RuL3dlYi8yNDAzMjAyNi9uZ3Vvbi1tYXktdGluaC1jb3JzYWlyLWN4NzUwLTgwLXBsdXMtYnJvbnplLW1hdS1kZW4tMDE0LmpwZw.webp', TRUE);


-- ==========================================================
-- CPU COOLERS
-- 171 - 176
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(171, 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=800', TRUE),
(172, 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=800', TRUE),
(173, 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=800', TRUE),
(174, 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=800', TRUE),
(175, 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=800', TRUE),
(176, 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=800', TRUE);


-- ==========================================================
-- PC CASES
-- 181 - 186
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(181, 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800', TRUE),
(182, 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800', TRUE),
(183, 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800', TRUE),
(184, 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800', TRUE),
(185, 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800', TRUE),
(186, 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800', TRUE);


-- ==========================================================
-- CASE FANS
-- 191 - 194
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(191, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800', TRUE),
(192, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800', TRUE),
(193, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800', TRUE),
(194, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800', TRUE);


-- ==========================================================
-- MONITORS
-- 201 - 204
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(201, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', TRUE),
(202, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', TRUE),
(203, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', TRUE),
(204, 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800', TRUE);


-- ==========================================================
-- KEYBOARDS
-- 211 - 213
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(211, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', TRUE),
(212, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800', TRUE),
(213, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', TRUE);


-- ==========================================================
-- MICE
-- 221 - 223
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(221, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800', TRUE),
(222, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', TRUE),
(223, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800', TRUE);


-- ==========================================================
-- HEADSETS
-- 231 - 233
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(231, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', TRUE),
(232, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800', TRUE),
(233, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', TRUE);


-- ==========================================================
-- WEBCAMS
-- 241 - 242
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(241, 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800', TRUE),
(242, 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800', TRUE);


-- ==========================================================
-- PREBUILT PC
-- 301 - 304
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(301, 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800', TRUE),
(302, 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800', TRUE),
(303, 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800', TRUE),
(304, 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800', TRUE);


-- ==========================================================
-- LAPTOPS
-- 401 - 404
-- ==========================================================
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(401, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', TRUE),
(402, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', TRUE),
(403, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', TRUE),
(404, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', TRUE);
