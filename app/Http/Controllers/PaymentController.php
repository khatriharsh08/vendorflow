<?php

namespace App\Http\Controllers;

use App\Models\PaymentRequest;
use App\Models\Vendor;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Display all payment requests for admin.
     */
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');

        $query = PaymentRequest::with(['vendor', 'requester'])
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $payments = $query->paginate(15);

        $stats = [
            'pending' => PaymentRequest::whereIn('status', ['requested', 'pending_ops', 'pending_finance'])->count(),
            'approved' => PaymentRequest::where('status', 'approved')->count(),
            'paid' => PaymentRequest::where('status', 'paid')->sum('amount'),
            'total' => PaymentRequest::count(),
        ];

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'stats' => $stats,
            'currentStatus' => $status,
        ]);
    }

    /**
     * Show a specific payment request.
     */
    public function show(PaymentRequest $payment)
    {
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
        $request->validate([
            'action' => 'required|in:approve,reject',
            'comment' => 'nullable|string|max:500',
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
        $request->validate([
            'action' => 'required|in:approve,reject',
            'comment' => 'nullable|string|max:500',
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
