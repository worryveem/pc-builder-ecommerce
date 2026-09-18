# 🖥️ PC Builder E-commerce Platform

> A full-stack e-commerce platform for PC components featuring a **Custom PC Builder** that helps customers create compatible PC configurations based on their requirements, budget, and usage needs.

---

## 📸 Overview

Building a custom PC can be challenging for customers who are not familiar with hardware specifications and compatibility requirements.

**PC Builder E-commerce** addresses this problem by combining a hardware-focused e-commerce platform with a custom PC configuration system.

Customers can specify their requirements, select and customize components, and build a complete PC while the system continuously validates hardware compatibility and power requirements.

### Core User Flow

```text
Customer Requirements
        │
        ▼
Component Recommendation
        │
        ▼
Component Selection
        │
        ▼
Compatibility Validation
        │
        ▼
Complete PC Configuration
        │
        ├───────────────┐
        ▼               ▼
 Save & Share       Add to Cart
```

---

# ⭐ Custom PC Builder

The **Custom PC Builder** is the core feature of the platform.

Instead of requiring customers to manually verify whether individual components are compatible, the system continuously validates the configuration and filters unsuitable products.

The builder supports customer-driven PC configuration with context-aware component recommendations and server-side compatibility validation.

## How It Works

```text
1. Customer specifies requirements
          │
          ▼
2. System identifies suitable components
          │
          ▼
3. Customer selects / modifies components
          │
          ▼
4. System dynamically filters compatible products
          │
          ▼
5. Compatibility & power validation
          │
          ▼
6. Final PC configuration
          │
          ├── Save
          ├── Share / Clone
          └── Add to Cart
```

### Example

A customer may want:

```text
Budget:        $1,000
Purpose:       Gaming
Target:        1440p
Priority:      GPU performance
Requirement:   Future upgradeability
```

The system can then guide the customer toward a suitable configuration while ensuring that the selected components are compatible with each other.

---

# 🧠 Hardware Compatibility Engine

The backend contains a dedicated `CompatibilityService` that acts as the **single source of truth** for hardware compatibility.

Compatibility validation is performed on the server side to prevent invalid configurations from being added to the cart.

| Compatibility Rule     | Validation                                                         |
| ---------------------- | ------------------------------------------------------------------ |
| **CPU ↔ Motherboard**  | CPU socket compatibility                                           |
| **RAM ↔ Motherboard**  | DDR generation, maximum capacity, and slot count                   |
| **Motherboard ↔ Case** | Supported motherboard form factors                                 |
| **GPU ↔ Case**         | GPU length must fit the case's maximum GPU clearance               |
| **CPU Cooler ↔ Case**  | Cooler height must fit the case's maximum cooler clearance         |
| **Cooler ↔ CPU**       | CPU socket must be supported by the cooler                         |
| **System ↔ PSU**       | Estimated power consumption must meet the recommended PSU capacity |

### PSU Recommendation

The system calculates the estimated power consumption of the selected components and applies a configurable safety margin.

```text
Recommended PSU Wattage
        =
Estimated System Power × 1.25
```

The PSU validation helps prevent customers from selecting an insufficient power supply for their configuration.

> The 25% margin is a project-defined calculation rule and is not intended to represent a universal hardware standard.

---

# 🔎 Context-Aware Component Filtering

The builder dynamically filters products based on components that have already been selected.

For example:

```text
Selected CPU
     │
     ▼
Filter compatible Motherboards
     │
     ▼
Selected Motherboard
     │
     ▼
Filter compatible RAM
     │
     ▼
Selected Case
     │
     ▼
Filter compatible GPU & Cooler
```

The filtering system can consider:

* Component type
* Brand
* Price range
* Existing build configuration
* Hardware compatibility requirements

This reduces invalid choices and makes the PC building process easier for customers.

---

# 🧩 Component System

The builder separates components into required and optional categories.

### Core Components

A complete PC build requires:

* CPU
* Motherboard
* RAM
* GPU
* SSD
* PSU

### Optional Components

Customers can additionally configure:

* CPU Cooler
* Case
* Case Fans

### Peripherals

The platform also supports optional peripherals:

* Monitor
* Keyboard
* Mouse
* Headset
* Webcam

---

# 💾 Saved PC Configurations

Customers can save multiple PC configurations to their accounts.

Example configurations:

* `1440p Gaming PC`
* `3D Rendering Workstation`
* `Budget Office PC`
* `Future Upgrade Build`

Saved configurations can be:

* Viewed
* Updated
* Deleted
* Loaded back into the builder

---

# 🔗 Public Sharing & Clone

Each saved configuration can be shared through a unique public token.

```text
/builder/share/{token}
```

Anyone with the link can view the shared configuration, including:

* Selected components
* Product prices
* Total configuration price
* Compatibility status

A shared configuration can also be **cloned and customized**, allowing customers to use an existing PC build as a starting point.

```text
Shared Build
     │
     ▼
View Configuration
     │
     ▼
Clone / Customize
     │
     ▼
Personal PC Build
```

---

# 🛒 Atomic Add-to-Cart

Customers can add an entire PC configuration to the shopping cart with a single action.

Before adding the configuration, the backend performs:

1. Compatibility validation
2. Product availability validation
3. Inventory checks
4. Configuration grouping

The operation is handled transactionally using Spring's `@Transactional`.

If one component fails validation or is unavailable, the transaction is rolled back instead of leaving the cart with only part of the PC configuration.

Each component belonging to a PC configuration is associated with a `configuration_id`, allowing the system to distinguish between individually purchased products and products belonging to a complete PC build.

---

# 🛍️ E-commerce Features

In addition to the PC Builder, the platform provides standard e-commerce functionality.

## Authentication & Authorization

* User registration and login
* Stateless JWT authentication
* Role-based access control
* `ROLE_CUSTOMER`
* `ROLE_ADMIN`

## Product Catalog

* Product search
* Category filtering
* Price filtering
* Brand filtering
* Pagination
* Product details
* Hardware specifications
* Product image gallery

## Shopping Cart

* Add products
* Remove products
* Update quantities
* Clear cart
* Support for individual products
* Support for complete PC configurations

## Orders

* COD checkout
* Order history
* Order details
* Order cancellation
* Order status tracking

Example order lifecycle:

```text
PENDING
   ↓
CONFIRMED
   ↓
SHIPPING
   ↓
COMPLETED
```

Orders can be cancelled while they are still in the pending state.

## Vouchers

The platform supports:

* Percentage-based discounts
* Fixed-amount discounts
* Minimum order requirements
* Server-side voucher validation

## Wishlist

Customers can:

* Add products to their wishlist
* Remove products
* View saved products

## Ratings & Reviews

Customers can:

* Rate products from 1–5 stars
* Write reviews
* View product rating summaries

---

# 👨‍💼 Admin Dashboard

Administrators have access to a dedicated management dashboard.

## Dashboard

* Revenue statistics
* Order statistics
* User statistics
* Low-stock products

## Product Management

* Create products
* Update products
* Delete products
* Manage product specifications

## Category Management

Builder-specific category configuration includes:

* `builder_supported`
* `builder_component_type`
* `display_order`

## Order Management

* View orders
* View order details
* Update order status

## User Management

* View users
* Enable / disable accounts

## Voucher Management

* Create vouchers
* Update vouchers
* Manage active promotions

---

# 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│                                                          │
│ Builder │ Products │ Cart │ Orders │ Admin               │
└──────────────────────────┬───────────────────────────────┘
                           │
                           │ REST API
                           │ JWT Bearer Token
                           ▼
┌──────────────────────────────────────────────────────────┐
│                  Spring Boot Backend                     │
│                                                          │
│ Controllers                                              │
│      │                                                   │
│      ▼                                                   │
│ Service Layer                                            │
│      │                                                   │
│      ├── PCBuilderService                                │
│      ├── CompatibilityService                            │
│      ├── ProductService                                  │
│      ├── CartService                                     │
│      ├── OrderService                                    │
│      ├── VoucherService                                  │
│      ├── RatingService                                   │
│      └── WishlistService                                 │
│      │                                                   │
│      ▼                                                   │
│ Spring Data JPA / Hibernate                              │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                       MySQL 8.0                          │
│                                                          │
│ products                                                 │
│ categories                                               │
│ product_specifications                                   │
│ pc_configurations                                        │
│ pc_configuration_items                                   │
│ carts / cart_items                                       │
│ orders / order_items                                     │
│ users / roles                                            │
│ vouchers / ratings / wishlist                            │
└──────────────────────────────────────────────────────────┘
```

---

# 🛠️ Tech Stack

## Backend

* **Java**
* **Spring Boot**
* **Spring Security**
* **JJWT**
* **Spring Data JPA**
* **Hibernate**
* **MySQL 8**
* **Maven**
* **Spring WebClient**

## Frontend

* **React**
* **Vite**
* **React Router DOM**
* **Axios**
* **React Context API**
* **Vanilla CSS**

## Infrastructure

* **Docker**
* **Docker Compose**

---

# 📡 API Highlights

The backend exposes RESTful APIs organized by business domain.

| Module     | Endpoint                                            | Description                       |
| ---------- | --------------------------------------------------- | --------------------------------- |
| PC Builder | `GET /api/builder/filter-products`                  | Context-aware component filtering |
| PC Builder | `POST /api/builder/validate`                        | Validate hardware compatibility   |
| PC Builder | `POST /api/builder/configurations`                  | Save a PC configuration           |
| PC Builder | `POST /api/builder/configurations/{id}/add-to-cart` | Add a complete PC build to cart   |
| Products   | `GET /api/products`                                 | Search and browse products        |
| Cart       | `GET /api/user/cart`                                | Retrieve current cart             |
| Orders     | `POST /api/order`                                   | Create an order                   |
| Ratings    | `POST /api/ratings`                                 | Submit a product review           |
| Wishlist   | `POST /api/wishlist/add/{productId}`                | Add a product to wishlist         |

> For the complete API reference, consider maintaining a separate API document or Swagger/OpenAPI specification instead of listing every endpoint in this README.

---

# 🧪 Testing

The backend includes automated tests covering core business logic and API behavior.

Test coverage includes:

* PC compatibility rules
* CPU / motherboard socket validation
* DDR4 / DDR5 compatibility
* GPU / case dimensions
* Cooler / case dimensions
* PSU power validation
* PC configuration lifecycle
* Add-to-cart transaction flow
* Voucher calculation
* Authentication and authorization
* Controller behavior
* Exception handling

Run backend tests with:

```bash
mvn test
```

Build the frontend for production:

```bash
cd frontend
npm install
npm run build
```

---

# 🚀 Getting Started

## Prerequisites

* Java 17+
* Node.js 18+
* MySQL 8.0
* Maven 3.8+
* Docker (optional)

> Make sure the Java version matches the version configured in the project's Maven configuration.

## 1. Clone the Repository

```bash
git clone https://github.com/worryveem/pc-builder-ecommerce.git
cd pc-builder-ecommerce
```

## 2. Configure the Database

Create a MySQL database for the application and configure the database connection in the backend environment configuration.

Example:

```text
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pc_builder
DB_USERNAME=root
DB_PASSWORD=your_password
```

Do not commit real credentials or secrets to the repository.

## 3. Start the Backend

Using Maven Wrapper:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

## 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

# 🐳 Docker

The project includes Docker Compose configuration for running the application services.

Start the application with:

```bash
docker compose up -d --build
```

Typical services:

```text
Frontend → :80
Backend  → :8080
MySQL    → :3306
```

---

# 👤 Demo Accounts

The following accounts can be used for local development and evaluation.

| Role     | Username    | Password      |
| -------- | ----------- | ------------- |
| Customer | `customer1` | `password123` |
| Admin    | `admin`     | `admin123`    |

> These credentials are intended only for the local/demo environment. Do not use them in production.

---

# 🔮 Future Improvements

Possible future improvements include:

* More advanced PC performance estimation
* Additional hardware compatibility rules
* Payment gateway integration
* Real-time inventory synchronization
* PC build performance benchmarking
* Automated deployment pipeline
* Expanded monitoring and observability

---

# 👨‍💻 Author

**Hoàng Đỗ**

GitHub: [@worryveem](https://github.com/worryveem)

---

# 📄 License

This project is developed for educational and portfolio purposes.
