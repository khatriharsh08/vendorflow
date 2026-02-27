<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\StaffUserController;
use App\Http\Controllers\Admin\SystemHealthController;
use App\Http\Controllers\Admin\VendorManagementController;
use App\Http\Controllers\ComplianceController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\VendorOnboardingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Static pages
Route::get('/about', fn() => Inertia::render('About'))->name('about');
Route::get('/contact', fn() => Inertia::render('Contact'))->name('contact');
Route::post('/contact', [\App\Http\Controllers\ContactController::class, 'store'])
    ->middleware('throttle:contact-form')
    ->name('contact.store');
Route::get('/privacy', fn() => Inertia::render('Privacy'))->name('privacy');
Route::get('/terms', fn() => Inertia::render('Terms'))->name('terms');

Route::middleware('auth')->group(function () {
    // Default Dashboard - redirects based on role
    Route::get('/dashboard', DashboardRedirectController::class)->middleware(['verified'])->name('dashboard');

    // ==========================================
    // NOTIFICATION ROUTES (All authenticated users)
    // ==========================================
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');

    // ==========================================
    // DOCUMENT ROUTES (All authenticated users)
    // ==========================================
    Route::get('/documents/{document}/view', [DocumentController::class, 'view'])
        ->middleware('throttle:document-access')
        ->name('documents.view');
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])
        ->middleware('throttle:document-access')
        ->name('documents.download');

    // ==========================================
    // VENDOR ROUTES
    // ==========================================
    Route::middleware(['role:vendor'])->prefix('vendor')->name('vendor.')->group(function () {
        // Vendor Onboarding
        Route::prefix('onboarding')->name('onboarding')->group(function () {
            Route::get('/', [VendorOnboardingController::class, 'show']);
            Route::post('/step1', [VendorOnboardingController::class, 'storeStep1'])->name('.step1');
            Route::post('/step2', [VendorOnboardingController::class, 'storeStep2'])->name('.step2');
            Route::post('/step3', [VendorOnboardingController::class, 'storeStep3'])->name('.step3');
            Route::post('/submit', [VendorOnboardingController::class, 'submit'])->name('.submit');
            Route::get('/document/{typeId}', [VendorOnboardingController::class, 'viewDocument'])->name('.document');
        });
        Route::get('/dashboard', [VendorController::class, 'index'])->name('dashboard');

        // Profile routes
        Route::get('/profile', [VendorController::class, 'profile'])->name('profile');
        Route::put('/profile', [VendorController::class, 'updateProfile'])->name('profile.update');

        // Documents routes
        Route::get('/documents', [VendorController::class, 'documents'])->name('documents');
        Route::post('/documents/upload', [VendorController::class, 'uploadDocument'])->name('documents.upload');

        // Compliance route
        Route::get('/compliance', [VendorController::class, 'compliance'])->name('compliance');

        // Performance route
        Route::get('/performance', [VendorController::class, 'performance'])->name('performance');

        // Payments routes
        Route::get('/payments', [VendorController::class, 'payments'])->name('payments');
        Route::post('/payments/request', [VendorController::class, 'createPaymentRequest'])->name('payments.request');

        // Notifications routes
        Route::get('/notifications', [VendorController::class, 'notifications'])->name('notifications');
        Route::patch('/notifications/{id}/read', [VendorController::class, 'markNotificationAsRead'])->name('notifications.read');
        Route::patch('/notifications/read-all', [VendorController::class, 'markAllNotificationsAsRead'])->name('notifications.read-all');
    });

    // ==========================================
    // STAFF ROUTES (Ops Manager / Finance Manager / Super Admin)
    // ==========================================
    Route::middleware(['role:ops_manager,finance_manager,super_admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Shared read-only vendor/payment/report access
        Route::get('/vendors', [VendorManagementController::class, 'index'])->name('vendors.index');
        Route::get('/vendors/{vendor}', [VendorManagementController::class, 'show'])->name('vendors.show');
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');

        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/payment', [ReportController::class, 'paymentReport'])->name('reports.payment');
        Route::get('/reports/vendor-summary', [ReportController::class, 'vendorSummaryReport'])->name('reports.vendor-summary');
        Route::get('/reports/performance', [ReportController::class, 'performanceReport'])->name('reports.performance');
        Route::get('/reports/compliance', [ReportController::class, 'complianceReport'])->name('reports.compliance');
        Route::get('/reports/document-expiry', [ReportController::class, 'documentExpiryReport'])->name('reports.document-expiry');
        Route::get('/reports/export/{type}', [ReportController::class, 'exportCsv'])->name('reports.export');
        Route::get('/system-health', [SystemHealthController::class, 'index'])->name('system-health.index');
    });

    // ==========================================
    // OPS + SUPER ADMIN ROUTES
    // ==========================================
    Route::middleware(['role:ops_manager,super_admin'])->prefix('admin')->name('admin.')->group(function () {
        // Vendor lifecycle actions
        Route::post('/vendors/{vendor}/approve', [VendorManagementController::class, 'approve'])->name('vendors.approve');
        Route::post('/vendors/{vendor}/reject', [VendorManagementController::class, 'reject'])->name('vendors.reject');
        Route::post('/vendors/{vendor}/activate', [VendorManagementController::class, 'activate'])->name('vendors.activate');
        Route::post('/vendors/{vendor}/suspend', [VendorManagementController::class, 'suspend'])->name('vendors.suspend');
        Route::post('/vendors/{vendor}/terminate', [VendorManagementController::class, 'terminate'])->name('vendors.terminate');
        Route::post('/vendors/{vendor}/notes', [VendorManagementController::class, 'notes'])->name('vendors.notes');

        // Contact messages
        Route::resource('contact-messages', \App\Http\Controllers\ContactController::class)->only(['index', 'show', 'update', 'destroy'])->names('contact-messages');

        // Document management
        Route::get('/documents', [DocumentController::class, 'adminIndex'])->name('documents.index');
        Route::get('/documents/{document}/preview', [DocumentController::class, 'preview'])->name('documents.preview');
        Route::post('/documents/{document}/verify', [DocumentController::class, 'verify'])->name('documents.verify');
        Route::post('/documents/{document}/reject', [DocumentController::class, 'reject'])->name('documents.reject');

        // Compliance operations
        Route::get('/compliance', [ComplianceController::class, 'dashboard'])->name('compliance.dashboard');
        Route::get('/compliance/rules', [ComplianceController::class, 'rules'])->name('compliance.rules');
        Route::get('/compliance/vendor/{vendor}', [ComplianceController::class, 'vendorCompliance'])->name('compliance.vendor');
        Route::post('/compliance/evaluate/{vendor}', [ComplianceController::class, 'evaluate'])->name('compliance.evaluate');
        Route::post('/compliance/evaluate-all', [ComplianceController::class, 'evaluateAll'])->name('compliance.evaluate-all');

        // Performance operations
        Route::get('/performance', [PerformanceController::class, 'index'])->name('performance.index');
        Route::get('/performance/{vendor}', [PerformanceController::class, 'show'])->name('performance.show');
        Route::get('/performance/{vendor}/rate', [PerformanceController::class, 'rateForm'])->name('performance.rate-form');
        Route::post('/performance/{vendor}/rate', [PerformanceController::class, 'rate'])->name('performance.rate');

        // Ops payment validation only
        Route::post('/payments/{payment}/validate-ops', [PaymentController::class, 'validateOps'])->name('payments.validate-ops');
    });

    // ==========================================
    // FINANCE + SUPER ADMIN ROUTES
    // ==========================================
    Route::middleware(['role:finance_manager,super_admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::post('/payments/{payment}/approve-finance', [PaymentController::class, 'approveFinance'])->name('payments.approve-finance');
        Route::post('/payments/{payment}/mark-paid', [PaymentController::class, 'markPaid'])->name('payments.mark-paid');
    });

    // ==========================================
    // SUPER ADMIN ONLY ROUTES
    // ==========================================
    Route::middleware(['role:super_admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/audit', [AuditLogController::class, 'index'])->name('audit.index');
        Route::patch('/compliance/rules/{rule}', [ComplianceController::class, 'updateRule'])->name('compliance.rules.update');
        Route::get('/staff-users', [StaffUserController::class, 'index'])->name('staff-users.index');
        Route::post('/staff-users', [StaffUserController::class, 'store'])->name('staff-users.store');
    });

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

// Fallback route for undefined routes - redirects to appropriate dashboard
Route::fallback(function () {
    $user = auth()->user();

    if (! $user) {
        return redirect('/');
    }

    if ($user->isVendor()) {
        return redirect()->route('vendor.dashboard')->with('error', 'The page you were looking for was not found.');
    }

    return redirect()->route('admin.dashboard')->with('error', 'The page you were looking for was not found.');
});
