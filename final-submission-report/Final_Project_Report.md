# VendorFlow - Advanced Vendor Management System
## Final Project Report
**Academic Year 2025-2026 | MCA Semester 4**

---

## 1. Executive Summary
**VendorFlow** is a comprehensive, enterprise-grade Vendor Management System (VMS) designed to streamline the end-to-end process of vendor onboarding, compliance tracking, performance evaluation, and payment processing. Built with modern web technologies, it provides a centralized platform for organizations to manage their supplier relationships efficiently, ensuring regulatory compliance and operational excellence.

## 2. System Overview
The system facilitates collaboration between multiple stakeholders through a robust Role-Based Access Control (RBAC) system:

*   **Super Admin**: Complete system control, user management, and configuration.
*   **Ops Manager**: Handles day-to-day vendor operations, document verification, and initial payment validation.
*   **Finance Manager**: Manages final payment approvals and disbursements.
*   **Vendor**: Self-service portal for onboarding, document submission, and payment tracking.

## 3. Technology Stack

### Backend
*   **Framework**: Laravel 11 (PHP)
*   **Database**: MySQL 8.0
*   **Authentication**: Laravel Breeze / Scantum
*   **Architecture**: MVC (Model-View-Controller) with Service Repository Pattern

### Frontend
*   **Framework**: React.js 18
*   **Adapter**: Inertia.js (Seamless Server-Side Rendering)
*   **Styling**: Tailwind CSS (Utility-first framework)
*   **UI Components**: Custom Design System with HeroIcons

### Tools & Dev Ops
*   **Build Tool**: Vite
*   **Version Control**: Git
*   **Package Managers**: Composer (PHP), NPM (JS)

## 4. Key Features Implemented

### 4.1 Vendor Onboarding & Management
*   **Multi-step Wizard**: Streamlined registration process capturing company details, contact info, and banking data.
*   **Document Uploads**: Secure drag-and-drop interface for mandatory documents (GST, PAN, Incorporation Certs).
*   **Profile Management**: Vendors can manage their profiles; automated sync ensures contact details remain up-to-date across the system.

### 4.2 Document Management System (DMS)
*   **Verification Workflow**: Ops Managers review documents with Approve/Reject actions and comment capabilities.
*   **Expiry Tracking**: Automated tracking of document validity dates.
*   **Notifications**: Alerts for expiring or rejected documents.

### 4.3 Compliance & Performance Engine
*   **Automated Scoring**: Vendors are assigned Compliance and Performance scores (0-100) based on automated rules and manual evaluations.
*   **Rule Engine**: Configurable compliance rules (e.g., "GST Certificate Required", "Bank Details Verified").
*   **Performance Metrics**: Numerical rating system for Quality, Timeliness, and Communication.

### 4.4 Financial Operations
*   **Payment Requests**: Vendors can submit digital invoices and payment requests.
*   **Approval Facade**: Two-tier approval process (Operations Validation → Finance Approval).
*   **Transaction History**: Complete log of all financial movements and status changes.

### 4.5 Advanced Reporting & Analytics
A comprehensive reporting suite for data-driven decision making:
*   **Vendor Summary Report**: Holistic view of vendor ecosystem, status distribution, and health metrics.
*   **Payment Report**: Detailed breakdown of cash flow, pending approvals, and historical disbursements.
*   **Performance Report**: Comparative analysis of vendor performance to identify top partners.
*   **Compliance Report**: Identification of non-compliant vendors and specific rule violations.
*   **Document Expiry Report**: Proactive visibility into upcoming document expirations to prevent non-compliance.
*   **Audit Trail**: Immutable log of all system actions (Login, Update, Delete) with IP tracking, user attribution, and **sticky-header scrollable view** for easy navigation.
*   **CSV Exports**: One-click data export for all reports to facilitate offline analysis.

## 5. System Architecture Highlights

### 5.1 Database Schema
The system utilizes a relational schema with key entities:
*   `users` & `vendors`: Core identity and profile data.
*   `documents` & `document_types`: Polymorphic document handling.
*   `compliance_rules` & `vendor_compliance`: Dynamic rule evaluation.
*   `payment_requests`: Financial transaction records.
*   `audit_logs`: System-wide activity tracking.

### 5.2 Security
*   **CSRF Protection**: Native Laravel token verification.
*   **XSS Prevention**: React auto-escaping and request sanitization.
*   **Authorization**: Granular Policy and Gate definitions for every action.
*   **Input Validation**: Strict server-side validation using Form Requests.

## 6. Conclusion
VendorFlow represents a modern solution to legacy vendor management challenges. By integrating onboarding, compliance, and finance into a single cohesive platform, it reduces administrative overhead, minimizes risk, and fosters stronger vendor relationships.

---
*Generated by VendorFlow Development Team*
