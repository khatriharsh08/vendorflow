<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Document Not Found</title>
    <style>
        :root {
            --bg-primary: #f8fbff;
            --surface: #ffffff;
            --surface-soft: #eef5fb;
            --text-primary: #0f172a;
            --text-secondary: #64748b;
            --border: #dbe5ef;
            --brand: #0f766e;
            --brand-soft: #ccfbf1;
            --shadow: 0 20px 28px -12px rgba(15, 23, 42, 0.16), 0 8px 12px -10px rgba(15, 23, 42, 0.12);
        }

        html[data-theme='midnight'] {
            --bg-primary: #0c1728;
            --surface: #0f1b2e;
            --surface-soft: #16253a;
            --text-primary: #e2e8f0;
            --text-secondary: #94a3b8;
            --border: #223752;
            --brand: #22d3ee;
            --brand-soft: rgba(34, 211, 238, 0.16);
            --shadow: 0 20px 28px -12px rgba(2, 6, 23, 0.72), 0 8px 12px -10px rgba(2, 6, 23, 0.64);
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: Manrope, 'Segoe UI', sans-serif;
            display: grid;
            place-items: center;
            background:
                radial-gradient(circle at 10% 10%, color-mix(in srgb, var(--brand) 16%, transparent), transparent 45%),
                var(--bg-primary);
            color: var(--text-primary);
            padding: 24px;
        }

        .card {
            width: min(560px, 100%);
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            box-shadow: var(--shadow);
            padding: 36px;
            text-align: center;
        }

        .icon {
            width: 68px;
            height: 68px;
            margin: 0 auto 20px;
            border-radius: 18px;
            background: var(--brand-soft);
            color: var(--brand);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            letter-spacing: 0.04em;
            font-size: 18px;
        }

        h1 {
            margin: 0 0 10px;
            font-size: clamp(1.35rem, 2vw, 1.7rem);
            line-height: 1.3;
        }

        p {
            margin: 0;
            color: var(--text-secondary);
            line-height: 1.6;
        }

        .filename {
            margin-top: 16px;
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid var(--border);
            background: var(--surface-soft);
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: 0.85rem;
            color: var(--text-secondary);
            word-break: break-all;
        }
    </style>
    <script>
        (function() {
            try {
                var theme = localStorage.getItem('vendorflow-theme') || 'aurora';
                document.documentElement.dataset.theme = theme;
            } catch (e) {}
        })();
    </script>
</head>

<body>
<div class="card">
    <div class="icon">DOC</div>
    <h1>Document File Not Found</h1>
    <p>The requested document is unavailable on the server right now.</p>
    @if(isset($document))
        <div class="filename">{{ $document->file_name ?? 'Unknown' }}</div>
    @endif
</div>
</body>

</html>
