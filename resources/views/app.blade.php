<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'VendorFlow') }}</title>

    <!-- Preload critical resources -->
    <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
    <link rel="dns-prefetch" href="https://fonts.bunny.net">

    <!-- Fonts with display swap for faster rendering -->
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

    <!-- Prevent FOUC -->
    <style>
        html {
            background: #020617;
        }

        .page-loader {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #020617;
            z-index: 9999;
            transition: opacity 0.5s ease-out, visibility 0.5s ease-out;
        }

        .page-loader.fade-out {
            opacity: 0;
            visibility: hidden;
        }

        .page-loader::after {
            content: '';
            width: 40px;
            height: 40px;
            border: 2px solid rgba(99, 102, 241, 0.3);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    </style>

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>

<body class="font-sans antialiased bg-slate-950 text-slate-100">
    <div id="page-loader" class="page-loader"></div>
    @inertia
</body>
<script>
    // Fallback: Remove loader after 3s if React fails/hangs
    /* setTimeout(function() {
        var loader = document.getElementById('page-loader');
        if (loader && !loader.classList.contains('fade-out')) {
           // loader.classList.add('fade-out'); // Optional: force remove? Better to let user see blank if broken?
        }
    }, 5000); */
</script>
</body>

</html>