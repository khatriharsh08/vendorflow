# VendorFlow | Enterprise Vendor Lifecycle Management (VLM)

**VendorFlow** is a next-generation Vendor Management System (VMS) engineered to optimize procurement lifecycles, enforce stringent regulatory governance, and unify supply chain operations. Built on a bleeding-edge technology stack, it facilitates frictionless collaboration between enterprises and their vendor ecosystems.

## Executive Summary

Navigating complex regulatory landscapes requires robust digital infrastructure. VendorFlow delivers a centralized governance framework that automates vendor onboarding, validates statutory compliance in real-time, and orchestrates multi-tier payment workflows—ensuring operational transparency and audit capability.

## Core Capabilities

### 🚀 Automated Onboarding & Governance
-   **Digital Onboarding Matrix**: A guided, multi-stage registration wizard capturing KYC, banking, and statutory data with validation gates.
-   **Automated Compliance Engine**: Real-time validation of critical documents (PAN, GST, MSME) with automated expiry tracking and status alerts.
-   **Due Diligence**: Integrated workflows for assessing vendor viability before activation.

### 🔐 Role-Based Access Control (RBAC)
-   **Granular Permission System**: Segregated environments for Super Admins, Operations Managers, Finance Controllers, and External Vendors.
-   **Secure Authentication**: Fortified login sessions ensuring data integrity and access security.

### 💳 Financial Orchestration
-   **Multi-Tier Approval Pipelines**: Configurable workflows requiring sequential validation from Operations (Proof of Work) and Finance (Disbursement) teams.
-   **Payment Lifecycle Tracking**: End-to-end visibility of payment requests from initiation -> validation -> approval -> settlement.
-   **Audit Trails**: Immutable logs of all financial transactions and status transitions for compliance audits.

### 📊 Intelligence & Analytics
-   **Executive Dashboards**: Real-time visualization of vendor health, compliance rates, and financial throughput.
-   **Performance Metrics**: Automated scoring of vendor reliability and service quality.

---

## Technical Architecture

VendorFlow is architected for high availability and scalability, utilizing the latest innovations in the ecosystem:

-   **Backend Core**: **Laravel 12.x** (Bleeding Edge) - Leveraging the latest PHP capabilities for robust, secure API architecture.
-   **Frontend Experience**: **React 19** + **Inertia.js 2.0** - Delivering a monolithic-like developer experience with Single Page Application (SPA) performance.
-   **Data Persistence**: **MySQL 8.0** - ACID-compliant relational storage for complex transactional integrity.
-   **UI/UX System**: **Tailwind CSS v4.0** - Utility-first design system for rapid, responsive interface development.

---

## Deployment & Configuration

### Prerequisites
-   PHP 8.2+
-   Composer 2.x
-   Node.js 18+ & NPM

### Installation Protocol

1.  **Repository Cloning**
    ```bash
    git clone https://github.com/khatriharsh08/vendorflow.git
    cd vendorflow
    ```

2.  **Dependency Resolution**
    ```bash
    composer install
    npm install
    ```

3.  **Environment Provisioning**
    ```bash
    cp .env.example .env
    php artisan key:generate
    # Configure DB_DATABASE, DB_USERNAME, DB_PASSWORD in .env
    ```

4.  **Database Seeding & Migration**
    ```bash
    php artisan migrate --seed
    ```

5.  **Application Launch**
    ```bash
    # Terminal 1: Asset Compilation (Hot Reload)
    npm run dev

    # Terminal 2: Application Server
    php artisan serve
    ```

---

## Access Credentials (Sandbox Environment)

The system is pre-configured with the following RBAC accounts for validation and UAT (User Acceptance Testing).

### Internal Stakeholders
| Role | Username | Password | Operational Scope |
|------|----------|----------|-------------------|
| **Super Admin** | `admin@vendorflow.com` | `password` | System-wide Audit & Control |
| **Ops Manager** | `ops@vendorflow.com` | `password` | Vendor Onboarding & Doc Verification |
| **Finance Controller** | `finance@vendorflow.com` | `password` | Payment Approvals & Disbursement |

### External Vendors (Mock Entities)
| Entity | Username | Password |
|--------|----------|----------|
| **Tech Solutions** | `rajesh@techsolutions.com` | `Password@123` |
| **Global Trade** | `priya@globaltrade.com` | `Password@123` |
