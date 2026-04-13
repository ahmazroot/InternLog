Mata Kuliah: Software Development

# 🚀 InternLog

A modern Internship Log Management System built with **Laravel** (Backend) and **React/Next.js** (Frontend), fully containerized with **Docker**.

## 🛠 Tech Stack

- **Backend**: Laravel 11.x (PHP 8.3)
- **Frontend**: Next.js / Vite (React)
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose
- **Tools**: phpMyAdmin

## 🏗 Project Structure

```text
.
├── backend/            # Laravel API
├── frontend/           # React/Next.js Frontend
├── docker-compose.yml  # Docker Orchestration
├── .env                # Global Environment Variables
└── README.md           # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Git

### Installation & Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone git@github.com:ahmazroot/InternLog.git
   cd InternLog
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up --build -d
   ```

3. **Access the applications**:
   - **Backend**: [http://localhost:8000](http://localhost:8000)
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **phpMyAdmin**: [http://localhost:8080](http://localhost:8080)

## 🐳 Docker Services

- **backend**: PHP 8.3-cli running Artisan server.
- **frontend**: Development server for the frontend application.
- **db**: MySQL 8.0 instance.
- **phpmyadmin**: GUI for database management.

## 📝 Common Commands

- **Run Migrations**:
  ```bash
  docker-compose exec backend php artisan migrate
  ```
- **Install Composer Dependency**:
  ```bash
  docker-compose exec backend composer install
  ```
- **Stop Services**:
  ```bash
  docker-compose down
  ```

## 👥 The Team

- **Akhmas Asadulloh** - Project Manager
- **Andika Arya Putra** - Front-End Developer
- **Ahmad Gebyar Gumelar** - Back-End Developer

---
