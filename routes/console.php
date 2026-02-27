<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ==========================================
// SCHEDULED JOBS (Cron)
// ==========================================

// Nightly compliance evaluation at 2:00 AM
Schedule::command('vendors:evaluate-compliance')
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/compliance.log'));

// Document expiry reminders at 8:00 AM
Schedule::command('vendors:expiry-reminders')
    ->dailyAt('08:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/reminders.log'));

// Weekly summary every Monday at 9:00 AM
Schedule::command('vendors:weekly-summary')
    ->weeklyOn(1, '09:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/summary.log'));

// Monthly performance score generation on the 1st at 3:00 AM
Schedule::command('vendors:generate-performance-scores')
    ->monthlyOn(1, '03:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/performance.log'));

// Daily payment workflow alerts (approval backlog + payment delays) at 10:00 AM
Schedule::command('vendors:payment-alerts')
    ->dailyAt('10:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/payment-alerts.log'));
