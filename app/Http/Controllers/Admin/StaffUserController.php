<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStaffUserRequest;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class StaffUserController extends Controller
{
    /**
     * Show staff management page.
     */
    public function index(): Response
    {
        $staffUsers = User::query()
            ->whereHas('roles', function ($query) {
                $query->whereIn('name', [
                    Role::SUPER_ADMIN,
                    Role::OPS_MANAGER,
                    Role::FINANCE_MANAGER,
                ]);
            })
            ->with('roles:id,name,display_name')
            ->select('id', 'name', 'email', 'created_at')
            ->latest()
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at?->toDateTimeString(),
                    'roles' => $user->roles->pluck('name')->values(),
                    'role_labels' => $user->roles->pluck('display_name')->values(),
                ];
            });

        return Inertia::render('Admin/Staff/Index', [
            'staffUsers' => $staffUsers,
            'availableRoles' => [
                ['value' => Role::SUPER_ADMIN, 'label' => 'Super Admin'],
                ['value' => Role::OPS_MANAGER, 'label' => 'Operations Manager'],
                ['value' => Role::FINANCE_MANAGER, 'label' => 'Finance Manager'],
            ],
        ]);
    }

    /**
     * Create an internal staff user (super admin only).
     */
    public function store(StoreStaffUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        AuditLog::log(
            AuditLog::EVENT_CREATED,
            $user,
            null,
            [
                'role' => $validated['role'],
                'created_by' => $request->user()->id,
            ],
            'Internal staff user created'
        );

        return back()->with('success', 'Internal user created successfully.');
    }
}
