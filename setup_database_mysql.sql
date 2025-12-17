-- ====================================================================
-- TBA-WAAD System - MySQL Database Setup Script
-- ====================================================================
-- This script creates the database for MySQL
-- Run this ONCE before starting the backend

-- Create database
CREATE DATABASE IF NOT EXISTS tba_waad_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Use the database
USE tba_waad_db;

-- Show database info
SELECT 
  'Database created successfully!' AS status,
  DATABASE() AS current_database,
  @@character_set_database AS charset,
  @@collation_database AS collation;

-- ====================================================================
-- Next Steps:
-- ====================================================================
-- 1. Start Backend (will create tables automatically)
-- 2. Run: mysql -u root -p tba_waad_db < backend/database/seed_rbac_mysql.sql
-- ====================================================================
