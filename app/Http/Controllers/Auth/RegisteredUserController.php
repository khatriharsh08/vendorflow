<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:vendor,ops_manager,finance_manager',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign role
        // Assign role
        $roleName = $request->role;
        $user->assignRole($roleName);

        // Verify role assignment
        if (! $user->hasRole($roleName)) {
            // Fallback: Manually attach if trait failed or role name case mismatch
            $role = \App\Models\Role::where('name', $roleName)->first();
            if ($role) {
                $user->roles()->attach($role);
            }
        }

        event(new Registered($user));

        // Refresh user to ensure relations are loaded if needed (though authenticatable usually reloads)
        $user = $user->fresh();

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
