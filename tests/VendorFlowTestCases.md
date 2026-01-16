# VendorFlow - Comprehensive Test Cases

## Table of Contents
1. [Authentication & Authorization (Module 1)](#module-1-authentication--authorization)
2. [Vendor Lifecycle Management (Module 2)](#module-2-vendor-lifecycle-management)
3. [Document Management (Module 3)](#module-3-document-management)
4. [Compliance Engine (Module 4)](#module-4-compliance-engine)
5. [Performance Scoring (Module 5)](#module-5-performance-scoring)
6. [Payment Workflow (Module 6)](#module-6-payment-workflow)
7. [Notifications & Alerts (Module 7)](#module-7-notifications--alerts)
8. [Audit Logs (Module 8)](#module-8-audit-logs)
9. [Integration Tests](#integration-tests)
10. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## Module 1: Authentication & Authorization

### 1.1 User Registration Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| AUTH-001 | Register with valid data | None | 1. Navigate to `/register` 2. Fill valid name, email, password 3. Submit form | User created, redirect to dashboard | High |
| AUTH-002 | Register with existing email | Email already exists | 1. Navigate to `/register` 2. Use existing email 3. Submit | Error: "Email already exists" | High |
| AUTH-003 | Register with weak password | None | 1. Navigate to `/register` 2. Use password < 8 chars 3. Submit | Validation error for password | High |
| AUTH-004 | Register with invalid email format | None | 1. Use invalid email format 2. Submit | Error: "Invalid email format" | Medium |
| AUTH-005 | Register with empty fields | None | 1. Leave required fields empty 2. Submit | Validation errors displayed | Medium |

### 1.2 User Login Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| AUTH-006 | Login with valid credentials | User exists | 1. Navigate to `/login` 2. Enter valid credentials 3. Submit | Login successful, redirect to dashboard | High |
| AUTH-007 | Login with invalid password | User exists | 1. Enter valid email, wrong password 2. Submit | Error: "Invalid credentials" | High |
| AUTH-008 | Login with non-existent email | None | 1. Enter non-existent email 2. Submit | Error: "Invalid credentials" | High |
| AUTH-009 | Login with empty fields | None | 1. Submit without entering data | Validation errors | Medium |
| AUTH-010 | Logout successfully | User logged in | 1. Click logout 2. Confirm | Session ended, redirect to home | High |

### 1.3 Role-Based Access Control Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| RBAC-001 | Vendor cannot access admin dashboard | Logged in as Vendor | 1. Try to access `/admin/dashboard` | 403 Forbidden or redirect | Critical |
| RBAC-002 | Vendor cannot view other vendor data | Logged in as Vendor | 1. Try to access another vendor's profile | 403 Forbidden | Critical |
| RBAC-003 | Ops Manager can access vendor list | Logged in as Ops Manager | 1. Navigate to `/admin/vendors` | View list of vendors | High |
| RBAC-004 | Finance Manager cannot modify documents | Logged in as Finance Manager | 1. Try to verify a document | 403 Forbidden | High |
| RBAC-005 | Ops Manager cannot approve payments | Logged in as Ops Manager | 1. Try to approve finance payment | 403 Forbidden | Critical |
| RBAC-006 | Super Admin has full access | Logged in as Super Admin | 1. Access all routes | All pages accessible | High |
| RBAC-007 | Guest cannot access protected routes | Not logged in | 1. Try to access `/dashboard` | Redirect to login | Critical |
| RBAC-008 | Vendor redirected to vendor dashboard | Logged in as Vendor | 1. Navigate to `/dashboard` | Redirect to `/vendor/dashboard` | High |
| RBAC-009 | Admin redirected to admin dashboard | Logged in as Admin | 1. Navigate to `/dashboard` | Redirect to `/admin/dashboard` | High |

---

## Module 2: Vendor Lifecycle Management

### 2.1 Vendor Onboarding Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| VND-001 | Complete Step 1 - Basic Info | Vendor logged in | 1. Go to `/vendor/onboarding` 2. Fill company name, registration number, tax ID, PAN 3. Next | Data saved to session, proceed to Step 2 | High |
| VND-002 | Complete Step 2 - Bank Details | Step 1 complete | 1. Fill bank name, account number, IFSC, branch 2. Next | Data saved to session, proceed to Step 3 | High |
| VND-003 | Complete Step 3 - Documents | Step 2 complete | 1. Upload required documents (registration, tax cert) 2. Next | Files uploaded to temp storage | High |
| VND-004 | Submit Complete Application | All steps complete | 1. Review all data 2. Submit | Vendor created with status 'submitted' | Critical |
| VND-005 | Step 1 validation - missing required fields | Vendor logged in | 1. Leave company name empty 2. Next | Validation error displayed | High |
| VND-006 | Step 1 validation - invalid PAN format | Vendor logged in | 1. Enter invalid PAN number 2. Next | Error: "Invalid PAN format" | Medium |
| VND-007 | Step 1 validation - invalid GST format | Vendor logged in | 1. Enter invalid GST number 2. Next | Error: "Invalid GST format" | Medium |
| VND-008 | Step 2 validation - invalid IFSC | Step 1 complete | 1. Enter invalid IFSC code 2. Next | Error: "Invalid IFSC format" | Medium |
| VND-009 | Step 3 - Upload file too large | Step 2 complete | 1. Upload file > max size 2. Submit | Error: "File size exceeds limit" | Medium |
| VND-010 | Step 3 - Upload invalid file type | Step 2 complete | 1. Upload executable file 2. Submit | Error: "Invalid file type" | High |

### 2.2 Vendor State Transition Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| VST-001 | Draft → Submitted | Vendor in Draft | 1. Complete onboarding 2. Submit | Status = 'submitted', submitted_at set | Critical |
| VST-002 | Submitted → Under Review | Vendor submitted | 1. Admin reviews vendor | Status = 'under_review' | High |
| VST-003 | Under Review → Approved | Vendor under review | 1. Admin approves with comment 2. Confirm | Status = 'approved', approved_at set | Critical |
| VST-004 | Approved → Active | Vendor approved, docs verified | 1. Admin activates vendor | Status = 'active', activated_at set | Critical |
| VST-005 | Active → Suspended | Vendor active | 1. Admin suspends with comment | Status = 'suspended', suspended_at set | High |
| VST-006 | Suspended → Active | Vendor suspended | 1. Admin reactivates | Status = 'active' | High |
| VST-007 | Active → Terminated | Vendor active | 1. Admin terminates | Status = 'terminated', terminated_at set | High |
| VST-008 | Invalid: Draft → Active | Vendor in Draft | 1. Try to activate directly | Error: Invalid transition | Critical |
| VST-009 | Invalid: Terminated → Active | Vendor terminated | 1. Try to reactivate | Error: Invalid transition (terminal state) | Critical |
| VST-010 | Rejection requires comment | Vendor submitted | 1. Admin rejects without comment | Error: Comment required | High |

### 2.3 Vendor Profile Management

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| VPR-001 | View own profile | Vendor logged in | 1. Navigate to `/vendor/profile` | Profile page displayed with vendor data | High |
| VPR-002 | Update contact details | Vendor logged in | 1. Edit contact email/phone 2. Save | Profile updated successfully | High |
| VPR-003 | Update bank details | Vendor logged in | 1. Edit bank account info 2. Save | Bank info updated | Medium |
| VPR-004 | Cannot edit critical fields after approval | Vendor approved | 1. Try to edit company name 2. Save | Error: Cannot modify after approval | High |
| VPR-005 | Admin can update internal notes | Admin logged in | 1. View vendor 2. Add internal notes 3. Save | Notes saved, not visible to vendor | High |

---

## Module 3: Document Management

### 3.1 Document Upload Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| DOC-001 | Upload valid PDF document | Vendor logged in | 1. Go to `/vendor/documents` 2. Select document type 3. Upload valid PDF 4. Submit | Document uploaded, status 'pending' | High |
| DOC-002 | Upload valid image (JPG/PNG) | Vendor logged in | 1. Select doc type 2. Upload image 3. Submit | Document uploaded successfully | High |
| DOC-003 | Upload with expiry date | Vendor logged in | 1. Upload document 2. Set expiry date 3. Submit | Document saved with expiry | High |
| DOC-004 | Reject invalid file type | Vendor logged in | 1. Try to upload .exe file | Error: "Invalid file type" | High |
| DOC-005 | Reject oversized file | Vendor logged in | 1. Try to upload file > 10MB | Error: "File size exceeds limit" | Medium |
| DOC-006 | Re-upload document (versioning) | Document exists | 1. Upload new version of same doc type | New version created, old maintained | Medium |

### 3.2 Document Verification Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| DOC-007 | Admin views pending documents | Ops Manager logged in | 1. Navigate to `/admin/documents` 2. Filter by 'pending' | List of pending documents shown | High |
| DOC-008 | Verify document | Ops Manager logged in | 1. View document 2. Click verify 3. Add notes | Status = 'verified', verified_by set, audit log created | Critical |
| DOC-009 | Reject document | Ops Manager logged in | 1. View document 2. Click reject 3. Provide reason | Status = 'rejected', reason saved, audit log created | High |
| DOC-010 | Reject without reason fails | Ops Manager logged in | 1. Try to reject without reason | Error: "Reason is required" | High |
| DOC-011 | Download document | Authorized user | 1. Click download on document | File downloaded | High |
| DOC-012 | View document inline | Authorized user | 1. Click view/preview | Document displayed in viewer | Medium |
| DOC-013 | Vendor cannot verify documents | Vendor logged in | 1. Try to access verify endpoint | 403 Forbidden | Critical |
| DOC-014 | Vendor can only see own documents | Vendor logged in | 1. Try to access another vendor's doc | 403 Forbidden | Critical |

### 3.3 Document Expiry Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| DOC-015 | Identify expired documents | Document has past expiry | 1. Run compliance check | Document flagged as expired | High |
| DOC-016 | Expiry warning before 15 days | Document expires in 10 days | 1. Run expiry check | Alert generated | High |
| DOC-017 | Expired doc blocks vendor | Critical doc expired | 1. Check vendor status | Vendor compliance = 'at_risk' or 'blocked' | High |

---

## Module 4: Compliance Engine

### 4.1 Compliance Rule Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| CMP-001 | View compliance dashboard | Admin logged in | 1. Navigate to `/admin/compliance` | Dashboard with stats displayed | High |
| CMP-002 | View all compliance rules | Admin logged in | 1. Navigate to `/admin/compliance/rules` | List of all rules displayed | High |
| CMP-003 | Update rule - toggle active | Super Admin logged in | 1. Find rule 2. Toggle is_active 3. Save | Rule status updated | Medium |
| CMP-004 | Update rule penalty points | Super Admin logged in | 1. Edit penalty_points 2. Save | Points updated | Medium |
| CMP-005 | Update rule - blocks payment | Super Admin logged in | 1. Set blocks_payment = true 2. Save | Rule updated | High |

### 4.2 Compliance Evaluation Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| CMP-006 | Evaluate single vendor | Vendor active | 1. Go to vendor compliance 2. Click Evaluate | Compliance results calculated, score updated | High |
| CMP-007 | Evaluate all vendors | Multiple vendors exist | 1. Click "Evaluate All" | All vendors evaluated, message shows count | High |
| CMP-008 | Missing mandatory doc = non-compliant | Vendor missing required doc | 1. Run evaluation | Status = 'non_compliant', penalty applied | Critical |
| CMP-009 | Expired doc = at risk | Vendor has expired doc | 1. Run evaluation | Status = 'at_risk' | High |
| CMP-010 | All docs verified = compliant | All docs verified | 1. Run evaluation | Status = 'compliant', score = 100 | High |
| CMP-011 | 2+ unresolved flags = blocked | Vendor has 3+ failures | 1. Run evaluation | Status = 'blocked' | High |

### 4.3 Vendor Compliance View Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| CMP-012 | Vendor views own compliance | Vendor logged in | 1. Navigate to `/vendor/compliance` | Own compliance status and results shown | High |
| CMP-013 | Vendor cannot see other compliance | Vendor logged in | 1. Try to access other vendor compliance | 403 Forbidden | Critical |
| CMP-014 | Compliance score displayed on dashboard | Any user logged in | 1. View dashboard | Compliance score badge visible | High |

---

## Module 5: Performance Scoring

### 5.1 Performance Dashboard Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| PER-001 | View performance dashboard | Admin logged in | 1. Navigate to `/admin/performance` | Dashboard with top/low performers shown | High |
| PER-002 | View all active vendors performance | Admin logged in | 1. View dashboard | List of active vendors with scores | High |
| PER-003 | View performance metrics list | Admin logged in | 1. View dashboard | Metrics displayed | Medium |

### 5.2 Performance Rating Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| PER-004 | Rate vendor performance | Admin logged in | 1. Go to `/admin/performance/{vendor}/rate` 2. Fill ratings for each metric 3. Submit | Scores recorded, vendor score updated | High |
| PER-005 | Rate with valid period | Admin logged in | 1. Set valid period_start and period_end 2. Submit | Period saved | High |
| PER-006 | Reject invalid period (end < start) | Admin logged in | 1. Set period_end before period_start 2. Submit | Error: "End date must be after start" | Medium |
| PER-007 | Reject score out of range | Admin logged in | 1. Enter score > 10 or < 0 2. Submit | Validation error | Medium |
| PER-008 | View vendor performance history | Admin logged in | 1. Navigate to `/admin/performance/{vendor}` | Historical scores displayed | High |

### 5.3 Vendor Performance View Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| PER-009 | Vendor views own performance | Vendor logged in | 1. Navigate to `/vendor/performance` | Own performance metrics shown | High |
| PER-010 | Performance score on dashboard | Vendor logged in | 1. View vendor dashboard | Performance score displayed | High |
| PER-011 | Historical trend displayed | Vendor logged in | 1. View performance page | Score history chart/list shown | Medium |

---

## Module 6: Payment Workflow

### 6.1 Payment Request Tests (Vendor)

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| PAY-001 | Create payment request | Vendor active & compliant | 1. Go to `/vendor/payments` 2. Click "New Request" 3. Enter amount, description 4. Submit | Request created, status 'requested' | High |
| PAY-002 | Vendor views own payment requests | Vendor logged in | 1. Navigate to `/vendor/payments` | List of own payment requests | High |
| PAY-003 | Cannot request if not compliant | Vendor non-compliant | 1. Try to create payment request | Error: "Compliance required for payments" | Critical |
| PAY-004 | Cannot request if not active | Vendor suspended | 1. Try to create payment request | Error: "Vendor must be active" | Critical |
| PAY-005 | Validation - amount required | Vendor active | 1. Submit without amount | Validation error | High |
| PAY-006 | Validation - amount positive | Vendor active | 1. Enter negative amount 2. Submit | Error: "Amount must be positive" | Medium |
| PAY-007 | Duplicate detection | Same amount/date exists | 1. Create duplicate request | Warning: Flagged as potential duplicate | Medium |

### 6.2 Payment Approval Workflow Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| PAY-008 | Ops validates payment | Payment 'requested' | 1. Ops Manager approves 2. Add comment | Status = 'pending_finance' | Critical |
| PAY-009 | Ops rejects payment | Payment 'requested' | 1. Ops Manager rejects 2. Add comment | Status = 'rejected', reason saved | High |
| PAY-010 | Finance approves payment | Payment 'pending_finance' | 1. Finance Manager approves | Status = 'approved' | Critical |
| PAY-011 | Finance rejects payment | Payment 'pending_finance' | 1. Finance Manager rejects | Status = 'rejected' | High |
| PAY-012 | Mark payment as paid | Payment 'approved' | 1. Finance enters reference number 2. Mark as paid | Status = 'paid', reference saved | Critical |
| PAY-013 | Ops cannot approve finance | Payment pending_finance | 1. Ops tries to approve | 403 Forbidden | Critical |
| PAY-014 | Finance cannot validate ops | Payment 'requested' | 1. Finance tries to validate | 403 Forbidden | Critical |
| PAY-015 | Payment reference required for paid | Payment approved | 1. Try to mark paid without reference | Error: "Reference required" | High |

### 6.3 Payment Blocking Rules Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| PAY-016 | Block if vendor non-compliant | Vendor non-compliant | 1. Try to approve payment | Error: "Vendor compliance required" | Critical |
| PAY-017 | Block if vendor suspended | Vendor suspended | 1. Try to process payment | Error: "Vendor is suspended" | High |
| PAY-018 | Block if missing documents | Required doc missing | 1. Try to approve | Error: "Required documents missing" | High |

---

## Module 7: Notifications & Alerts

### 7.1 Notification Display Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| NTF-001 | View notifications list | User logged in | 1. Navigate to `/notifications` | List of notifications displayed | High |
| NTF-002 | Unread count displayed | Has unread notifications | 1. View header/sidebar | Unread badge count shown | High |
| NTF-003 | Mark notification as read | Has unread notification | 1. Click on notification | Notification marked as read | High |
| NTF-004 | Mark all as read | Multiple unread | 1. Click "Mark all as read" | All notifications marked as read | Medium |

### 7.2 Alert Generation Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| NTF-005 | Alert on document expiry (15 days) | Document expires in 10 days | 1. Run expiry reminder cron | Alert created for vendor | High |
| NTF-006 | Alert on compliance violation | Compliance check fails | 1. Run compliance evaluation | Alert created | High |
| NTF-007 | Alert on pending approval | Payment pending | 1. Payment created | Alert for approvers | High |
| NTF-008 | Alert on payment status change | Payment approved/rejected | 1. Process payment | Vendor receives notification | High |

---

## Module 8: Audit Logs

### 8.1 Audit Log Recording Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| AUD-001 | Log vendor state change | Admin changes vendor status | 1. Approve vendor | Audit log created with actor, timestamp, reason | Critical |
| AUD-002 | Log document verification | Ops verifies document | 1. Verify document | Audit log created | High |
| AUD-003 | Log document rejection | Ops rejects document | 1. Reject document | Audit log with reason created | High |
| AUD-004 | Log payment approval | Finance approves payment | 1. Approve payment | Audit log created | High |
| AUD-005 | Log score update | Admin rates performance | 1. Submit rating | Audit log created | Medium |
| AUD-006 | IP address captured | Any auditable action | 1. Perform action | IP address stored in log | High |

### 8.2 Audit Log View Tests

| Test ID | Test Case | Precondition | Test Steps | Expected Result | Priority |
|---------|-----------|--------------|------------|-----------------|----------|
| AUD-007 | Admin views audit logs | Admin logged in | 1. Navigate to `/admin/audit` | Paginated list of audit logs | High |
| AUD-008 | Vendor cannot view audit logs | Vendor logged in | 1. Try to access audit page | 403 Forbidden | Critical |
| AUD-009 | Audit logs show actor name | Logs exist | 1. View audit logs | Actor name displayed (not just ID) | Medium |
| AUD-010 | Audit logs are read-only | Admin logged in | 1. Try to modify audit log | No edit option available | Critical |

---

## Integration Tests

### 9.1 End-to-End Flow Tests

| Test ID | Test Case | Test Steps | Expected Result | Priority |
|---------|-----------|------------|-----------------|----------|
| E2E-001 | Complete Vendor Onboarding Flow | 1. Register as vendor 2. Complete 3-step onboarding 3. Submit 4. Admin reviews 5. Admin approves 6. Vendor activated | Vendor active, can access dashboard | Critical |
| E2E-002 | Complete Payment Flow | 1. Vendor creates request 2. Ops validates 3. Finance approves 4. Finance marks paid | Payment status = 'paid' | Critical |
| E2E-003 | Document Expiry to Compliance Block | 1. Upload doc with expiry 2. Wait for expiry 3. Run compliance | Vendor blocked, payment blocked | High |
| E2E-004 | Performance Rating Workflow | 1. Admin rates vendor 2. View vendor performance | Score updated, history visible | High |

### 9.2 Cross-Module Integration Tests

| Test ID | Test Case | Test Steps | Expected Result | Priority |
|---------|-----------|------------|-----------------|----------|
| INT-001 | Compliance affects payments | 1. Vendor becomes non-compliant 2. Try payment | Payment blocked | Critical |
| INT-002 | Document status affects compliance | 1. Reject critical document 2. Run compliance | Vendor non-compliant | High |
| INT-003 | Vendor status restricts actions | 1. Suspend vendor 2. Try any action | Relevant actions blocked | High |
| INT-004 | State change creates audit log | 1. Perform any state change | Audit log automatically created | High |

---

## Edge Cases & Error Handling

### 10.1 Error Handling Tests

| Test ID | Test Case | Test Steps | Expected Result | Priority |
|---------|-----------|------------|-----------------|----------|
| ERR-001 | 404 for non-existent vendor | 1. Access `/admin/vendors/99999` | 404 error page displayed | High |
| ERR-002 | 404 for non-existent document | 1. Access `/documents/99999/view` | 404 error page | High |
| ERR-003 | 403 for unauthorized access | 1. Vendor accesses admin route | 403 error page | High |
| ERR-004 | Invalid route fallback | 1. Access `/random-page` | Redirect to appropriate dashboard | High |
| ERR-005 | Session timeout handling | 1. Session expires 2. Perform action | Redirect to login | High |
| ERR-006 | File not found on download | 1. Download document where file missing | 404 with proper message | Medium |

### 10.2 Boundary Tests

| Test ID | Test Case | Test Steps | Expected Result | Priority |
|---------|-----------|------------|-----------------|----------|
| BND-001 | Maximum file size upload | 1. Upload file exactly at max size | Upload succeeds | Medium |
| BND-002 | Compliance score boundary (0) | 1. Vendor with all failures | Score = 0, status = blocked | Medium |
| BND-003 | Compliance score boundary (100) | 1. Vendor fully compliant | Score = 100, status = compliant | Medium |
| BND-004 | Performance score boundary (0-10) | 1. Rate with 0 and 10 | Both scores saved correctly | Medium |
| BND-005 | Empty state handling | 1. View page with no data | "No data" message displayed properly | Medium |

### 10.3 Concurrent Access Tests

| Test ID | Test Case | Test Steps | Expected Result | Priority |
|---------|-----------|------------|-----------------|----------|
| CON-001 | Simultaneous vendor approval | 1. Two admins try to approve same vendor | One succeeds, other gets error | Medium |
| CON-002 | Simultaneous payment processing | 1. Ops and Finance process same payment | Proper state management | Medium |

---

## Test Data Requirements

### Required Test Users
1. **Super Admin** - admin@vendorflow.com
2. **Ops Manager** - ops@vendorflow.com
3. **Finance Manager** - finance@vendorflow.com
4. **Vendor 1 (Active, Compliant)** - vendor1@test.com
5. **Vendor 2 (Suspended)** - vendor2@test.com
6. **Vendor 3 (Non-compliant)** - vendor3@test.com

### Required Test Documents
- Valid PDF document (< 5MB)
- Valid image (JPG/PNG < 5MB)
- Invalid file type (.exe)
- Oversized file (> 10MB)

### Seeded Data
- Document Types (Company Registration, Tax Certificate, Insurance, NDA)
- Compliance Rules (at least 5 active rules)
- Performance Metrics (Delivery, Quality, Response Time, Contract Adherence)

---

## Running Tests

### PHPUnit Tests
```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/VendorTest.php

# Run with coverage
php artisan test --coverage
```

### Manual Testing Checklist
1. [ ] Start Laravel server: `php artisan serve`
2. [ ] Start Vite: `npm run dev`
3. [ ] Access application at `http://localhost:8000`
4. [ ] Login with each user role and verify access
5. [ ] Execute priority Critical test cases first
6. [ ] Document any failures with screenshots

---

## Test Summary

| Module | Total Tests | Critical | High | Medium |
|--------|-------------|----------|------|--------|
| Authentication & Authorization | 18 | 5 | 9 | 4 |
| Vendor Lifecycle Management | 20 | 5 | 12 | 3 |
| Document Management | 17 | 4 | 10 | 3 |
| Compliance Engine | 14 | 3 | 9 | 2 |
| Performance Scoring | 11 | 0 | 8 | 3 |
| Payment Workflow | 18 | 6 | 9 | 3 |
| Notifications & Alerts | 8 | 0 | 6 | 2 |
| Audit Logs | 10 | 3 | 6 | 1 |
| Integration Tests | 8 | 3 | 5 | 0 |
| Edge Cases & Error Handling | 13 | 0 | 7 | 6 |
| **TOTAL** | **137** | **29** | **81** | **27** |

---

## Document Information
- **Project**: VendorFlow
- **Version**: 1.0
- **Created**: 2026-01-16
- **Author**: Auto-generated from project analysis
