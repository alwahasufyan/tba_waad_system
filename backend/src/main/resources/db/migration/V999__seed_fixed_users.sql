-- ==============================================================================================
-- TBA-WAAD System - Fixed Users Seed Script
-- Enterprise Mode: VPN-based Internal System
-- ==============================================================================================
-- 
-- USAGE:
-- 1. All users use DEFAULT password: Waad@2025
-- 2. Users MUST change password on first login
-- 3. OTP required for:
--    - First login
--    - Approval actions
-- 4. NO public registration UI
-- 
-- Password Hash: BCrypt of "Waad@2025"
-- Generated with: BCrypt.hashpw("Waad@2025", BCrypt.gensalt(10))
-- 
-- ==============================================================================================

-- Default password for all users (BCrypt hash)
-- Password: Waad@2025
SET @default_password = '$2a$10$rXYJKZH7XvQOBXQwO1P8.OqYGMZvV3ELKZEYzHqWLNzYHzQwO1P8.';

-- ==============================================================================================
-- 1. SUPER_ADMIN - System Owner (You)
-- ==============================================================================================

INSERT INTO users (username, password, email, full_name, role, is_active, force_password_change, created_at, updated_at)
VALUES 
('sufyan', @default_password, 'sufyan@tba-waad.local', 'Sufyan HR - System Administrator', 'SUPER_ADMIN', true, true, NOW(), NOW());

-- ==============================================================================================
-- 2. TBA_ADMIN - WAAD Internal Staff (~12 users)
-- ==============================================================================================

INSERT INTO users (username, password, email, full_name, role, is_active, force_password_change, created_at, updated_at)
VALUES 
-- Management
('ahmed.manager', @default_password, 'ahmed.manager@tba-waad.local', 'Ahmed Al-Manager - Operations Manager', 'TBA_ADMIN', true, true, NOW(), NOW()),
('fatima.director', @default_password, 'fatima.director@tba-waad.local', 'Fatima Al-Director - Medical Director', 'TBA_ADMIN', true, true, NOW(), NOW()),

-- Claims Processing Team
('omar.claims', @default_password, 'omar.claims@tba-waad.local', 'Omar Al-Claims - Senior Claims Processor', 'TBA_ADMIN', true, true, NOW(), NOW()),
('sara.claims', @default_password, 'sara.claims@tba-waad.local', 'Sara Al-Claims - Claims Processor', 'TBA_ADMIN', true, true, NOW(), NOW()),
('khalid.claims', @default_password, 'khalid.claims@tba-waad.local', 'Khalid Al-Claims - Claims Processor', 'TBA_ADMIN', true, true, NOW(), NOW()),

-- Network & Contracts Team
('nora.network', @default_password, 'nora.network@tba-waad.local', 'Nora Al-Network - Network Coordinator', 'TBA_ADMIN', true, true, NOW(), NOW()),
('yousef.contracts', @default_password, 'yousef.contracts@tba-waad.local', 'Yousef Al-Contracts - Contracts Manager', 'TBA_ADMIN', true, true, NOW(), NOW()),

-- Member Services
('layla.service', @default_password, 'layla.service@tba-waad.local', 'Layla Al-Service - Member Services Rep', 'TBA_ADMIN', true, true, NOW(), NOW()),
('hassan.service', @default_password, 'hassan.service@tba-waad.local', 'Hassan Al-Service - Member Services Rep', 'TBA_ADMIN', true, true, NOW(), NOW()),

-- Finance & Audit
('mona.finance', @default_password, 'mona.finance@tba-waad.local', 'Mona Al-Finance - Finance Controller', 'TBA_ADMIN', true, true, NOW(), NOW()),
('tariq.audit', @default_password, 'tariq.audit@tba-waad.local', 'Tariq Al-Audit - Internal Auditor', 'TBA_ADMIN', true, true, NOW(), NOW()),

-- IT Support
('waleed.tech', @default_password, 'waleed.tech@tba-waad.local', 'Waleed Al-Tech - IT Support Specialist', 'TBA_ADMIN', true, true, NOW(), NOW());

-- ==============================================================================================
-- 3. INSURANCE_ADMIN - Insurance Company Admins (~5 users)
-- ==============================================================================================

INSERT INTO users (username, password, email, full_name, role, is_active, force_password_change, created_at, updated_at)
VALUES 
('medgulf.admin', @default_password, 'admin@medgulf.local', 'Medgulf Insurance - Administrator', 'INSURANCE_ADMIN', true, true, NOW(), NOW()),
('bupa.admin', @default_password, 'admin@bupa.local', 'Bupa Arabia - Administrator', 'INSURANCE_ADMIN', true, true, NOW(), NOW()),
('tawuniya.admin', @default_password, 'admin@tawuniya.local', 'Tawuniya Insurance - Administrator', 'INSURANCE_ADMIN', true, true, NOW(), NOW()),
('alrajhi.admin', @default_password, 'admin@alrajhi-takaful.local', 'Al Rajhi Takaful - Administrator', 'INSURANCE_ADMIN', true, true, NOW(), NOW()),
('saico.admin', @default_password, 'admin@saico.local', 'SAICO Insurance - Administrator', 'INSURANCE_ADMIN', true, true, NOW(), NOW());

-- ==============================================================================================
-- 4. EMPLOYER_ADMIN - Company HR Managers (~10 users)
-- ==============================================================================================

INSERT INTO users (username, password, email, full_name, role, employer_id, is_active, force_password_change, created_at, updated_at)
VALUES 
-- Tech Companies
('aramco.hr', @default_password, 'hr@aramco.local', 'Saudi Aramco - HR Manager', 'EMPLOYER_ADMIN', 1, true, true, NOW(), NOW()),
('sabic.hr', @default_password, 'hr@sabic.local', 'SABIC - HR Manager', 'EMPLOYER_ADMIN', 2, true, true, NOW(), NOW()),
('stc.hr', @default_password, 'hr@stc.local', 'STC - HR Manager', 'EMPLOYER_ADMIN', 3, true, true, NOW(), NOW()),

-- Finance Sector
('samba.hr', @default_password, 'hr@samba.local', 'Samba Bank - HR Manager', 'EMPLOYER_ADMIN', 4, true, true, NOW(), NOW()),
('riyad.hr', @default_password, 'hr@riyadbank.local', 'Riyad Bank - HR Manager', 'EMPLOYER_ADMIN', 5, true, true, NOW(), NOW()),

-- Healthcare Providers as Employers
('kfshrc.hr', @default_password, 'hr@kfshrc.local', 'King Faisal Hospital - HR Manager', 'EMPLOYER_ADMIN', 6, true, true, NOW(), NOW()),
('ncc.hr', @default_password, 'hr@ncc.local', 'National Care Center - HR Manager', 'EMPLOYER_ADMIN', 7, true, true, NOW(), NOW()),

-- Retail & Services
('almarai.hr', @default_password, 'hr@almarai.local', 'Almarai - HR Manager', 'EMPLOYER_ADMIN', 8, true, true, NOW(), NOW()),
('jarir.hr', @default_password, 'hr@jarir.local', 'Jarir Bookstore - HR Manager', 'EMPLOYER_ADMIN', 9, true, true, NOW(), NOW()),
('extra.hr', @default_password, 'hr@extra.local', 'eXtra Electronics - HR Manager', 'EMPLOYER_ADMIN', 10, true, true, NOW(), NOW());

-- ==============================================================================================
-- 5. PROVIDER_ADMIN - Hospital/Clinic Admins (~20 users)
-- ==============================================================================================

INSERT INTO users (username, password, email, full_name, role, provider_id, is_active, force_password_change, created_at, updated_at)
VALUES 
-- Major Hospitals
('kfsh.admin', @default_password, 'admin@kfsh.local', 'KFSH Riyadh - Administrator', 'PROVIDER_ADMIN', 1, true, true, NOW(), NOW()),
('kfmc.admin', @default_password, 'admin@kfmc.local', 'King Fahad Medical City - Administrator', 'PROVIDER_ADMIN', 2, true, true, NOW(), NOW()),
('kamc.admin', @default_password, 'admin@kamc.local', 'King Abdullah Medical City - Administrator', 'PROVIDER_ADMIN', 3, true, true, NOW(), NOW()),
('ksu.admin', @default_password, 'admin@ksuhospital.local', 'KSU Medical City - Administrator', 'PROVIDER_ADMIN', 4, true, true, NOW(), NOW()),

-- Private Hospitals
('kfshrc.provider', @default_password, 'provider@kfshrc.local', 'King Faisal Specialist Hospital - Provider Admin', 'PROVIDER_ADMIN', 5, true, true, NOW(), NOW()),
('smg.admin', @default_password, 'admin@smg.local', 'Saudi German Hospital - Administrator', 'PROVIDER_ADMIN', 6, true, true, NOW(), NOW()),
('dallah.admin', @default_password, 'admin@dallah.local', 'Dr. Sulaiman Al Habib - Administrator', 'PROVIDER_ADMIN', 7, true, true, NOW(), NOW()),
('mouwasat.admin', @default_password, 'admin@mouwasat.local', 'Mouwasat Hospital - Administrator', 'PROVIDER_ADMIN', 8, true, true, NOW(), NOW()),

-- Specialty Centers
('ncc.provider', @default_password, 'provider@ncc.local', 'National Care Center - Provider Admin', 'PROVIDER_ADMIN', 9, true, true, NOW(), NOW()),
('specialized.admin', @default_password, 'admin@specialized.local', 'Specialized Medical Center - Administrator', 'PROVIDER_ADMIN', 10, true, true, NOW(), NOW()),

-- Clinics
('andalusia.admin', @default_password, 'admin@andalusia.local', 'Andalusia Clinics - Administrator', 'PROVIDER_ADMIN', 11, true, true, NOW(), NOW()),
('almostaqbal.admin', @default_password, 'admin@almostaqbal.local', 'Al Mostaqbal Clinic - Administrator', 'PROVIDER_ADMIN', 12, true, true, NOW(), NOW()),
('tadawi.admin', @default_password, 'admin@tadawi.local', 'Tadawi Medical Group - Administrator', 'PROVIDER_ADMIN', 13, true, true, NOW(), NOW()),

-- Dental Centers
('almurjan.admin', @default_password, 'admin@almurjan-dental.local', 'Al Murjan Dental Center - Administrator', 'PROVIDER_ADMIN', 14, true, true, NOW(), NOW()),
('shams.admin', @default_password, 'admin@shams-dental.local', 'Shams Dental Clinic - Administrator', 'PROVIDER_ADMIN', 15, true, true, NOW(), NOW()),

-- Diagnostic Centers
('labco.admin', @default_password, 'admin@labco.local', 'LabCo Diagnostic Center - Administrator', 'PROVIDER_ADMIN', 16, true, true, NOW(), NOW()),
('scan.admin', @default_password, 'admin@scanlab.local', 'ScanLab Radiology - Administrator', 'PROVIDER_ADMIN', 17, true, true, NOW(), NOW()),

-- Pharmacies
('nahdi.admin', @default_password, 'admin@nahdi.local', 'Al Nahdi Pharmacy - Administrator', 'PROVIDER_ADMIN', 18, true, true, NOW(), NOW()),
('dawaa.admin', @default_password, 'admin@dawaa.local', 'Dawaa Pharmacy - Administrator', 'PROVIDER_ADMIN', 19, true, true, NOW(), NOW()),
('boots.admin', @default_password, 'admin@boots.local', 'Boots Pharmacy - Administrator', 'PROVIDER_ADMIN', 20, true, true, NOW(), NOW());

-- ==============================================================================================
-- Summary
-- ==============================================================================================
-- Total Users: ~50
-- - SUPER_ADMIN: 1
-- - TBA_ADMIN: 12
-- - INSURANCE_ADMIN: 5
-- - EMPLOYER_ADMIN: 10
-- - PROVIDER_ADMIN: 20
--
-- Default Password: Waad@2025 (all users)
-- Force Password Change: true (all users must reset on first login)
-- 
-- ==============================================================================================
