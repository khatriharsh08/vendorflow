<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\ComplianceController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Static pages
Route::get('/about', fn () => Inertia::render('About'))->name('about');
Route::get('/contact', fn () => Inertia::render('Contact'))->name('contact');
Route::post('/contact', [\App\Http\Controllers\ContactController::class, 'store'])->name('contact.store');
Route::get('/privacy', fn () => Inertia::render('Privacy'))->name('privacy');
Route::get('/terms', fn () => Inertia::render('Terms'))->name('terms');

Route::middleware('auth')->group(function () {
    // Default Dashboard - redirects based on role
    Route::get('/dashboard', function () {
        $user = auth()->user();

        // Check for admin/staff roles first
        if ($user->hasAnyRole([\App\Models\Role::SUPER_ADMIN, \App\Models\Role::OPS_MANAGER, \App\Models\Role::FINANCE_MANAGER])) {
            return redirect()->route('admin.dashboard');
        }

        // Default to vendor dashboard for everyone else (including new registrations)
        return redirect()->route('vendor.dashboard');
    })->middleware(['verified'])->name('dashboard');

    // ==========================================
    // NOTIFICATION ROUTES (All authenticated users)
    // ==========================================
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');

    // ==========================================
    // DOCUMENT ROUTES (All authenticated users)
    // ==========================================
    Route::get('/documents/{document}/view', [DocumentController::class, 'view'])->name('documents.view');
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');

    // ==========================================
    // VENDOR ROUTES
    // ==========================================
    Route::middleware(['role:vendor'])->prefix('vendor')->name('vendor.')->group(function () {
        Route::get('/onboarding', [VendorController::class, 'showOnboarding'])->name('onboarding');
        Route::post('/onboarding/step1', [VendorController::class, 'storeStep1'])->name('onboarding.step1');
        Route::post('/onboarding/step2', [VendorController::class, 'storeStep2'])->name('onboarding.step2');
        Route::post('/onboarding/step3', [VendorController::class, 'storeStep3'])->name('onboarding.step3');
        Route::get('/onboarding/document/{typeId}', [VendorController::class, 'viewOnboardingDocument'])->name('onboarding.document');
        Route::post('/onboarding/submit', [VendorController::class, 'submitApplication'])->name('onboarding.submit');
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
    // STAFF ROUTES (Ops Manager & Finance Manager)
    // ==========================================
    Route::middleware(['role:ops_manager,finance_manager,super_admin'])->prefix('admin')->name('admin.')->group(function () {
        // Dashboard with real data
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Vendor Management - Optimized with selective loading
        Route::get('/vendors', function () {
            $status = request()->query('status', 'all');
            $search = request()->query('search', '');

            // Only select needed columns
            $query = \App\Models\Vendor::select([
                'id',
                'company_name',
                'contact_person',
                'contact_email',
                'status',
                'performance_score',
                'compliance_status',
                'created_at',
            ])
                ->latest();

            if ($status !== 'all') {
                $query->where('status', $status);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('company_name', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('contact_email', 'like', "%{$search}%");
                });
            }

            $vendors = $query->paginate(15);

            return Inertia::render('Admin/Vendors/Index', [
                'vendors' => $vendors->items(),
                'currentStatus' => $status,
                'search' => $search,
            ]);
        })->name('vendors.index');

        // Vendor Show - Lazy load relationships
        Route::get('/vendors/{vendor}', function (\App\Models\Vendor $vendor) {
            // Load only essential relationships first
            $vendor->load([
                'documents:id,vendor_id,document_type_id,file_name,verification_status,expiry_date,created_at' => [
                    'documentType:id,name,display_name',
                ],
                'stateLogs:id,vendor_id,user_id,from_status,to_status,comment,created_at' => [
                    'user:id,name',
                ],
            ]);

            // Compliance and performance - only if status is active/approved
            if (in_array($vendor->status, ['approved', 'active'])) {
                $vendor->load([
                    'complianceResults:id,vendor_id,compliance_rule_id,status,details,evaluated_at' => [
                        'rule:id,name,description',
                    ],
                    'performanceScores:id,vendor_id,performance_metric_id,score,period_start,period_end' => [
                        'metric:id,name,display_name',
                    ],
                ]);
            }

            return Inertia::render('Admin/Vendors/Show', ['vendor' => $vendor]);
        })->name('vendors.show');

        // Vendor Status Actions
        Route::post('/vendors/{vendor}/approve', function (\App\Models\Vendor $vendor, \Illuminate\Http\Request $request) {
            $vendor->update(['status' => 'active']);
            $vendor->stateLogs()->create([
                'user_id' => auth()->id(),
                'from_status' => 'submitted',
                'to_status' => 'active',
                'comment' => $request->comment ?? 'Vendor approved',
            ]);

            return back()->with('success', 'Vendor approved and activated!');
        })->name('vendors.approve');

        Route::post('/vendors/{vendor}/reject', function (\App\Models\Vendor $vendor, \Illuminate\Http\Request $request) {
            $vendor->update(['status' => 'rejected']);
            $vendor->stateLogs()->create([
                'user_id' => auth()->id(),
                'from_status' => 'submitted',
                'to_status' => 'rejected',
                'comment' => $request->comment ?? 'Vendor rejected',
            ]);

            return back()->with('success', 'Vendor rejected.');
        })->name('vendors.reject');

        Route::post('/vendors/{vendor}/activate', function (\App\Models\Vendor $vendor, \Illuminate\Http\Request $request) {
            $vendor->update(['status' => 'active']);
            $vendor->stateLogs()->create([
                'user_id' => auth()->id(),
                'from_status' => $vendor->status,
                'to_status' => 'active',
                'comment' => $request->comment ?? 'Vendor activated',
            ]);

            return back()->with('success', 'Vendor activated!');
        })->name('vendors.activate');

        Route::post('/vendors/{vendor}/suspend', function (\App\Models\Vendor $vendor, \Illuminate\Http\Request $request) {
            $vendor->update(['status' => 'suspended']);
            $vendor->stateLogs()->create([
                'user_id' => auth()->id(),
                'from_status' => 'active',
                'to_status' => 'suspended',
                'comment' => $request->comment ?? 'Vendor suspended',
            ]);

            return back()->with('success', 'Vendor suspended.');
        })->name('vendors.suspend');

        Route::post('/vendors/{vendor}/notes', function (\App\Models\Vendor $vendor, \Illuminate\Http\Request $request) {
            $vendor->update(['internal_notes' => $request->internal_notes]);

            return back()->with('success', 'Notes saved.');
        })->name('vendors.notes');

        // ==========================================
        // DOCUMENT ROUTES
        // Contact Messages
        Route::resource('contact-messages', \App\Http\Controllers\ContactController::class)->only(['index', 'show', 'update', 'destroy'])->names('contact-messages');

        // Documents Management (Admin view)
        Route::get('/documents', [DocumentController::class, 'adminIndex'])->name('documents.index');
        Route::get('/documents/{document}/preview', [DocumentController::class, 'preview'])->name('documents.preview');
        Route::post('/documents/{document}/verify', [DocumentController::class, 'verify'])->name('documents.verify');
        Route::post('/documents/{document}/reject', [DocumentController::class, 'reject'])->name('documents.reject');

        // ==========================================
        // COMPLIANCE ROUTES
        // ==========================================
        Route::get('/compliance', [ComplianceController::class, 'dashboard'])->name('compliance.dashboard');
        Route::get('/compliance/rules', [ComplianceController::class, 'rules'])->name('compliance.rules');
        Route::get('/compliance/vendor/{vendor}', [ComplianceController::class, 'vendorCompliance'])->name('compliance.vendor');
        Route::post('/compliance/evaluate/{vendor}', [ComplianceController::class, 'evaluate'])->name('compliance.evaluate');
        Route::post('/compliance/evaluate-all', [ComplianceController::class, 'evaluateAll'])->name('compliance.evaluate-all');
        Route::patch('/compliance/rules/{rule}', [ComplianceController::class, 'updateRule'])->name('compliance.rules.update');

        // ==========================================
        // PERFORMANCE ROUTES
        // ==========================================
        Route::get('/performance', [PerformanceController::class, 'index'])->name('performance.index');
        Route::get('/performance/{vendor}', [PerformanceController::class, 'show'])->name('performance.show');
        Route::get('/performance/{vendor}/rate', [PerformanceController::class, 'rateForm'])->name('performance.rate-form');
        Route::post('/performance/{vendor}/rate', [PerformanceController::class, 'rate'])->name('performance.rate');

        // ==========================================
        // PAYMENT ROUTES
        // ==========================================
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');

        // ==========================================
        // AUDIT LOG ROUTES - Cached for 1 minute
        // ==========================================
        Route::get('/audit', function () {
            $logs = Cache::remember('audit_logs_page_'.request('page', 1), 60, function () {
                return \App\Models\AuditLog::with('user:id,name')
                    ->select(['id', 'user_id', 'event', 'auditable_type', 'auditable_id', 'reason', 'ip_address', 'created_at'])
                    ->latest()
                    ->paginate(50);
            });

            return Inertia::render('Admin/Audit/Index', ['logs' => $logs->items()]);
        })->name('audit.index');

        // ==========================================
        // REPORTS ROUTES
        // ==========================================
        Route::get('/reports', function () {
            $stats = [
                'total_vendors' => \App\Models\Vendor::count(),
                'active_vendors' => \App\Models\Vendor::where('status', 'active')->count(),
                'compliance_rate' => round(\App\Models\Vendor::where('compliance_status', 'compliant')->count() / max(\App\Models\Vendor::count(), 1) * 100),
                'pending_payments' => \App\Models\PaymentRequest::whereIn('status', ['requested', 'pending_ops', 'pending_finance'])->count(),
                'total_paid' => \App\Models\PaymentRequest::where('status', 'paid')->sum('amount'),
            ];

            return Inertia::render('Admin/Reports/Index', ['stats' => $stats]);
        })->name('reports.index');

        // Report-specific routes
        Route::get('/reports/payment', [\App\Http\Controllers\Admin\ReportController::class, 'paymentReport'])->name('reports.payment');
        Route::get('/reports/vendor-summary', [\App\Http\Controllers\Admin\ReportController::class, 'vendorSummaryReport'])->name('reports.vendor-summary');
        Route::get('/reports/performance', [\App\Http\Controllers\Admin\ReportController::class, 'performanceReport'])->name('reports.performance');
        Route::get('/reports/compliance', [\App\Http\Controllers\Admin\ReportController::class, 'complianceReport'])->name('reports.compliance');
        Route::get('/reports/document-expiry', [\App\Http\Controllers\Admin\ReportController::class, 'documentExpiryReport'])->name('reports.document-expiry');
        Route::get('/reports/export/{type}', [\App\Http\Controllers\Admin\ReportController::class, 'exportCsv'])->name('reports.export');
    });

    // ==========================================
    // OPS MANAGER SPECIFIC ROUTES
    // ==========================================
    Route::middleware(['role:ops_manager,super_admin'])->prefix('admin')->name('admin.')->group(function () {
        // Ops Payment Validation
        Route::post('/payments/{payment}/validate-ops', [PaymentController::class, 'validateOps'])->name('payments.validate-ops');
    });

    // ==========================================
    // FINANCE MANAGER SPECIFIC ROUTES
    // ==========================================
    Route::middleware(['role:finance_manager,super_admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::post('/payments/{payment}/approve-finance', [PaymentController::class, 'approveFinance'])->name('payments.approve-finance');
        Route::post('/payments/{payment}/mark-paid', [PaymentController::class, 'markPaid'])->name('payments.mark-paid');
    });

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

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
