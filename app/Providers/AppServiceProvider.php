<?php

namespace App\Providers;

use App\Models\PaymentRequest;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorDocument;
use App\Policies\PaymentRequestPolicy;
use App\Policies\VendorDocumentPolicy;
use App\Policies\VendorPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Console\Events\CommandStarting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use RuntimeException;
use Symfony\Component\Console\Input\InputInterface;

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
        $this->registerDestructiveCommandGuard();

        RateLimiter::for('contact-form', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('guest-auth', function (Request $request) {
            return Limit::perHour(20)->by($request->ip());
        });

        RateLimiter::for('document-access', function (Request $request) {
            $userId = $request->user()?->id ?? 'guest';

            return Limit::perMinute(120)->by($userId.'|'.$request->ip());
        });

        Gate::policy(Vendor::class, VendorPolicy::class);
        Gate::policy(VendorDocument::class, VendorDocumentPolicy::class);
        Gate::policy(PaymentRequest::class, PaymentRequestPolicy::class);

        Gate::define('viewReports', fn (User $user) => $user->isStaff());
        Gate::define('exportReports', fn (User $user) => $user->isStaff());

        Gate::define('viewPerformance', fn (User $user) => $user->hasAnyRole([
            Role::OPS_MANAGER,
            Role::SUPER_ADMIN,
        ]));
        Gate::define('ratePerformance', fn (User $user) => $user->hasAnyRole([
            Role::OPS_MANAGER,
            Role::SUPER_ADMIN,
        ]));

        Gate::define('viewCompliance', fn (User $user) => $user->hasAnyRole([
            Role::OPS_MANAGER,
            Role::SUPER_ADMIN,
        ]));
        Gate::define('runCompliance', fn (User $user) => $user->hasAnyRole([
            Role::OPS_MANAGER,
            Role::SUPER_ADMIN,
        ]));
        Gate::define('manageComplianceRules', fn (User $user) => $user->hasRole(Role::SUPER_ADMIN));
        Gate::define('viewAuditLogs', fn (User $user) => $user->hasRole(Role::SUPER_ADMIN));

        Gate::before(function (User $user) {
            return $user->hasRole(Role::SUPER_ADMIN) ? true : null;
        });
    }

    private function registerDestructiveCommandGuard(): void
    {
        if (! $this->app->runningInConsole()
            || $this->app->runningUnitTests()
            || $this->app->environment('testing')
            || $this->isRunningPhpUnit()) {
            return;
        }

        Event::listen(CommandStarting::class, function (CommandStarting $event): void {
            $destructiveCommands = [
                'db:wipe',
                'migrate:fresh',
                'migrate:refresh',
                'migrate:reset',
            ];

            if (! in_array($event->command, $destructiveCommands, true)) {
                return;
            }

            if ($this->app->runningUnitTests() || $this->app->environment('testing') || $this->isRunningPhpUnit()) {
                return;
            }

            if ($this->isDestructiveCommandOverrideEnabled()) {
                return;
            }

            $connectionName = $this->resolveConnectionNameFromInput($event->input);
            if ($connectionName === '') {
                $connectionName = (string) config('database.default');
            }

            $connectionConfig = config("database.connections.{$connectionName}");
            if (! is_array($connectionConfig)) {
                return;
            }

            $driver = strtolower((string) ($connectionConfig['driver'] ?? ''));
            $database = strtolower((string) ($connectionConfig['database'] ?? ''));

            if ($this->isSafeDestructiveTarget($driver, $database)) {
                return;
            }

            throw new RuntimeException(
                "Blocked '{$event->command}' on connection '{$connectionName}' (database: '{$database}'). ".
                "Set ALLOW_DESTRUCTIVE_DB_COMMANDS=true to allow this intentionally."
            );
        });
    }

    private function isRunningPhpUnit(): bool
    {
        if (defined('PHPUNIT_COMPOSER_INSTALL') || defined('__PHPUNIT_PHAR__')) {
            return true;
        }

        $argv = $_SERVER['argv'] ?? [];

        if (! is_array($argv) || $argv === []) {
            return false;
        }

        $commandLine = strtolower(implode(' ', $argv));

        return str_contains($commandLine, 'phpunit')
            || str_contains($commandLine, 'pest')
            || str_contains($commandLine, 'artisan test');
    }

    private function resolveConnectionNameFromInput(InputInterface $input): string
    {
        if (! $input->hasOption('database')) {
            return '';
        }

        return (string) ($input->getOption('database') ?? '');
    }

    private function isDestructiveCommandOverrideEnabled(): bool
    {
        $value = env('ALLOW_DESTRUCTIVE_DB_COMMANDS', false);

        return filter_var($value, FILTER_VALIDATE_BOOLEAN) === true;
    }

    private function isSafeDestructiveTarget(string $driver, string $database): bool
    {
        if ($driver === 'sqlite') {
            return $database === ':memory:'
                || str_ends_with($database, '_test.sqlite')
                || str_ends_with($database, '_testing.sqlite');
        }

        return str_ends_with($database, '_test')
            || str_ends_with($database, '_testing');
    }
}
