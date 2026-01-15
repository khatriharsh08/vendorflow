<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Use lazy evaluation to prevent unnecessary queries
        return [
            ...parent::share($request),
            'auth' => fn() => $this->getAuthData($user),
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * Get auth data with caching to prevent repeated queries.
     */
    protected function getAuthData($user): array
    {
        if (!$user) {
            return [
                'user' => null,
                'roles' => [],
                'permissions' => [],
                'can' => [],
            ];
        }

        // Cache user roles for 5 minutes to reduce DB queries
        $cacheKey = "user_{$user->id}_auth_data";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($user) {
            // Eager load roles and permissions in ONE query
            $user->load('roles.permissions');

            // Get role names as array
            $roleNames = $user->roles->pluck('name')->toArray();

            // Pre-compute role checks ONCE
            $isOpsManager = in_array('ops_manager', $roleNames);
            $isFinanceManager = in_array('finance_manager', $roleNames);
            $isSuperAdmin = in_array('super_admin', $roleNames);
            $isVendor = in_array('vendor', $roleNames);
            $isStaff = $isOpsManager || $isFinanceManager || $isSuperAdmin;

            // Get unique permissions
            $permissions = $user->roles
                ->flatMap(fn($role) => $role->permissions->pluck('name'))
                ->unique()
                ->values()
                ->toArray();

            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ],
                'roles' => $roleNames,
                'permissions' => $permissions,
                'can' => [
                    // Vendor actions
                    'approve_vendors' => $isOpsManager || $isSuperAdmin,
                    'reject_vendors' => $isOpsManager || $isSuperAdmin,
                    'activate_vendors' => $isOpsManager || $isSuperAdmin,
                    'suspend_vendors' => $isOpsManager || $isSuperAdmin,
                    'edit_vendor_notes' => $isOpsManager || $isSuperAdmin,

                    // Document actions
                    'verify_documents' => $isOpsManager || $isSuperAdmin,
                    'reject_documents' => $isOpsManager || $isSuperAdmin,

                    // Payment actions
                    'validate_payments' => $isOpsManager || $isSuperAdmin,
                    'approve_payments' => $isFinanceManager || $isSuperAdmin,
                    'mark_paid' => $isFinanceManager || $isSuperAdmin,

                    // Performance actions
                    'rate_vendors' => $isOpsManager || $isSuperAdmin,

                    // Compliance actions
                    'run_compliance' => $isOpsManager || $isSuperAdmin,
                    'edit_rules' => $isSuperAdmin,

                    // Admin access
                    'view_audit' => $isSuperAdmin,
                    'view_reports' => !$isVendor,
                    'is_staff' => $isStaff,

                    // View permissions for reports (using dot notation keys)
                    'vendors.view' => $isOpsManager || $isFinanceManager || $isSuperAdmin,
                    'payments.view' => $isFinanceManager || $isSuperAdmin,
                    'compliance.view' => $isOpsManager || $isSuperAdmin,
                    'documents.view' => $isOpsManager || $isSuperAdmin,
                    'audit.view' => $isSuperAdmin,
                    'reports.export' => $isOpsManager || $isFinanceManager || $isSuperAdmin,
                ],
            ];
        });
    }

    /**
     * Clear auth cache when user logs out or permissions change.
     */
    public static function clearAuthCache($userId): void
    {
        Cache::forget("user_{$userId}_auth_data");
    }
}
