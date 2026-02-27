<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'VendorFlow') }}</title>

    <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
    <link rel="dns-prefetch" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=manrope:400,500,600,700,800&display=swap" rel="stylesheet" />

    <script>
        (function() {
            try {
                var theme = localStorage.getItem('vendorflow-theme') || 'aurora';
                document.documentElement.dataset.theme = theme;
                if (theme === 'midnight') {
                    document.documentElement.classList.add('dark');
                }
            } catch (e) {}
        })();
    </script>

    <style>
        html {
            background: #f6fbff;
        }

        .page-loader {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at 10% 10%, rgba(13, 148, 136, 0.16), transparent 45%), #f6fbff;
            z-index: 9999;
            transition: opacity 0.45s ease-out, visibility 0.45s ease-out;
        }

        .page-loader.fade-out {
            opacity: 0;
            visibility: hidden;
        }

        .page-loader::after {
            content: '';
            width: 38px;
            height: 38px;
            border: 2px solid rgba(15, 118, 110, 0.22);
            border-top-color: #0f766e;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    </style>

    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    <div id="page-loader" class="page-loader"></div>
    @inertia
</body>

</html>
