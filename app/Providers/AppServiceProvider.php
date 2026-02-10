<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Interfaces\VendorRepositoryInterface::class,
            \App\Repositories\VendorRepository::class
        );
        $this->app->bind(
            \App\Interfaces\PaymentRepositoryInterface::class,
            \App\Repositories\PaymentRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Gate::before(function ($user, $ability) {
            return $user->hasRole('Super Admin') ? true : null;
        });
    }
}
