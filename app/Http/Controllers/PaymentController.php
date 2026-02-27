<?php

namespace App\Http\Controllers;

use App\Models\PaymentRequest;
use App\Services\PaymentService;
use App\Services\PaymentQueryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    protected PaymentQueryService $paymentQueryService;

    public function __construct(PaymentService $paymentService, PaymentQueryService $paymentQueryService)
    {
        $this->paymentService = $paymentService;
        $this->paymentQueryService = $paymentQueryService;
    }

    /**
     * Display all payment requests for admin.
     */
    public function index(Request $request)
    {
        $data = $this->paymentQueryService->adminIndexData($request);

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $data['payments'],
            'stats' => $data['stats'],
            'currentStatus' => $data['currentStatus'],
        ]);
    }

    /**
     * Show a specific payment request.
     */
    public function show(PaymentRequest $payment)
    {
        $this->authorize('view', $payment);

        $payment->load(['vendor', 'requester', 'approvals.user']);

        return Inertia::render('Admin/Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Ops validation action.
     */
    public function validateOps(Request $request, PaymentRequest $payment)
    {
        $this->authorize('validateOps', $payment);

        $request->validate([
            'action' => 'required|in:approve,reject',
            'comment' => 'required_if:action,reject|nullable|string|max:500',
        ]);

        try {
            $approve = $request->action === 'approve';
            $this->paymentService->validateByOps($payment, Auth::user(), $approve, $request->comment);

            return back()->with('success', $approve ? 'Payment validated successfully.' : 'Payment rejected.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Finance approval action.
     */
    public function approveFinance(Request $request, PaymentRequest $payment)
    {
        $this->authorize('approveFinance', $payment);

        $request->validate([
            'action' => 'required|in:approve,reject',
            'comment' => 'required_if:action,reject|nullable|string|max:500',
        ]);

        try {
            $approve = $request->action === 'approve';
            $this->paymentService->approveByFinance($payment, Auth::user(), $approve, $request->comment);

            return back()->with('success', $approve ? 'Payment approved successfully.' : 'Payment rejected.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Mark payment as paid.
     */
    public function markPaid(Request $request, PaymentRequest $payment)
    {
        $this->authorize('markPaid', $payment);

        $request->validate([
            'payment_reference' => 'required|string|max:100',
            'payment_method' => 'nullable|string|max:50',
        ]);

        try {
            $this->paymentService->markAsPaid(
                $payment,
                Auth::user(),
                $request->payment_reference,
                $request->payment_method
            );

            return back()->with('success', 'Payment marked as paid.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
