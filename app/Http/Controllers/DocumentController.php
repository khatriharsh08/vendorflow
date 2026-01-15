<?php

namespace App\Http\Controllers;

use App\Models\VendorDocument;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DocumentController extends Controller
{
    /**
     * Display all documents pending verification.
     */
    /**
     * Display all documents (Admin Index).
     */
    public function adminIndex(Request $request)
    {
        $query = VendorDocument::with(['vendor', 'documentType']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('verification_status', $request->status);
        }

        // Search by vendor name
        if ($request->has('search') && $request->search) {
            $query->whereHas('vendor', function ($q) use ($request) {
                $q->where('business_name', 'like', '%' . $request->search . '%');
            });
        }

        $documents = $query->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Documents/Index', [
            'documents' => $documents,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Display all documents pending verification.
     */
    public function pendingVerification()
    {
        $documents = VendorDocument::with(['vendor', 'documentType'])
            ->where('verification_status', 'pending')
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Documents/Index', [
            'documents' => $documents,
        ]);
    }

    /**
     * Verify a document.
     */
    public function verify(Request $request, VendorDocument $document)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $oldStatus = $document->verification_status;

        $document->update([
            'verification_status' => 'verified',
            'verified_by' => Auth::id(),
            'verified_at' => now(),
            'verification_notes' => $request->notes,
        ]);

        // Log the verification
        AuditLog::log(
            AuditLog::EVENT_VERIFIED,
            $document,
            ['verification_status' => $oldStatus],
            ['verification_status' => 'verified'],
            $request->notes
        );

        return back()->with('success', 'Document verified successfully.');
    }

    /**
     * Reject a document.
     */
    public function reject(Request $request, VendorDocument $document)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $oldStatus = $document->verification_status;

        $document->update([
            'verification_status' => 'rejected',
            'verified_by' => Auth::id(),
            'verified_at' => now(),
            'verification_notes' => $request->reason,
        ]);

        // Log the rejection
        AuditLog::log(
            AuditLog::EVENT_REJECTED,
            $document,
            ['verification_status' => $oldStatus],
            ['verification_status' => 'rejected'],
            $request->reason
        );

        return back()->with('success', 'Document rejected.');
    }

    /**
     * Download a document.
     */
    public function download(VendorDocument $document)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Check if user can access this document
        if ($user->isVendor() && $document->vendor->user_id !== $user->id) {
            abort(403);
        }

        $path = storage_path('app/private/' . $document->file_path);

        if (!file_exists($path)) {
            abort(404, 'Document not found.');
        }

        return response()->download($path, $document->file_name);
    }

    /**
     * View a document inline (for popup preview).
     */
    public function view(VendorDocument $document)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Check if user can access this document
        // Vendors can only see their own documents, staff can see all
        if ($user->isVendor() && $document->vendor->user_id !== $user->id) {
            abort(403, 'You do not have permission to view this document.');
        }

        $path = storage_path('app/private/' . $document->file_path);

        // If file doesn't exist, return a placeholder response
        if (!file_exists($path)) {
            // Return a simple HTML page indicating file not found
            return response()->view('errors.document-not-found', [
                'document' => $document
            ], 404);
        }

        $mimeType = mime_content_type($path);

        return response()->file($path, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $document->file_name . '"',
        ]);
    }
}
