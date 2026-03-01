<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\VendorDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
        $this->authorize('viewCompliance');

        $currentStatus = $request->string('status')->toString();
        if ($currentStatus === '') {
            $currentStatus = VendorDocument::STATUS_PENDING;
        }

        $query = VendorDocument::with(['vendor', 'documentType']);

        // Filter by status
        if ($currentStatus !== 'all') {
            $query->where('verification_status', $currentStatus);
        }

        // Search by vendor name
        if ($request->has('search') && $request->search) {
            $query->whereHas('vendor', function ($q) use ($request) {
                $q->where('company_name', 'like', '%'.$request->search.'%');
            });
        }

        $documents = $query->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Documents/Index', [
            'documents' => $documents,
            'filters' => $request->only(['status', 'search']),
            'currentStatus' => $currentStatus,
        ]);
    }

    /**
     * Display all documents pending verification.
     */
    public function pendingVerification()
    {
        $this->authorize('viewCompliance');

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
        $this->authorize('verify', $document);

        if (! $document->isPending()) {
            return back()->with('error', 'Only pending documents can be verified.');
        }

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

        $document->loadMissing('documentType');
        $documentType = $document->documentType?->display_name ?? 'Document';

        return back()->with('success', "{$documentType} verified successfully.");
    }

    /**
     * Reject a document.
     */
    public function reject(Request $request, VendorDocument $document)
    {
        $this->authorize('reject', $document);

        if (! $document->isPending()) {
            return back()->with('error', 'Only pending documents can be rejected.');
        }

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

        $document->loadMissing('documentType');
        $documentType = $document->documentType?->display_name ?? 'Document';

        return back()->with('success', "{$documentType} rejected.");
    }

    /**
     * Download a document.
     */
    public function preview(VendorDocument $document)
    {
        return $this->view($document);
    }

    /**
     * Download a document.
     */
    public function download(VendorDocument $document)
    {
        $this->authorize('download', $document);

        $path = $this->resolvePrivateDocumentPath($document);
        if ($path === null) {
            abort(404, 'Document not found.');
        }

        return response()->download($path, $document->file_name);
    }

    /**
     * View a document inline (for popup preview).
     */
    public function view(VendorDocument $document)
    {
        $this->authorize('view', $document);

        $path = $this->resolvePrivateDocumentPath($document);

        if ($path === null) {
            // Return a simple HTML page indicating file not found
            return response()->view('errors.document-not-found', [
                'document' => $document,
            ], 404);
        }

        $mimeType = mime_content_type($path);

        return response()->file($path, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="'.$document->file_name.'"',
        ]);
    }

    /**
     * Resolve a vendor document path safely inside the private disk root.
     */
    private function resolvePrivateDocumentPath(VendorDocument $document): ?string
    {
        $disk = Storage::disk('private');

        try {
            if (! $disk->exists($document->file_path)) {
                return null;
            }

            $absolutePath = $disk->path($document->file_path);
            $resolvedPath = realpath($absolutePath);
            $privateRoot = realpath($disk->path(''));
        } catch (\Throwable) {
            return null;
        }

        if (! $resolvedPath || ! $privateRoot) {
            return null;
        }

        // Prevent path traversal outside the private storage root.
        if (! str_starts_with($resolvedPath, $privateRoot.DIRECTORY_SEPARATOR) && $resolvedPath !== $privateRoot) {
            return null;
        }

        return $resolvedPath;
    }
}
