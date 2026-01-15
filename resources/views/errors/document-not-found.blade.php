<!DOCTYPE html>
<html>

<head>
    <title>Document Not Found</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
            color: #333;
        }

        .container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }

        h1 {
            margin: 0 0 10px;
            font-size: 24px;
        }

        p {
            color: #666;
            margin: 0;
        }

        .filename {
            margin-top: 15px;
            padding: 10px 15px;
            background: #f0f0f0;
            border-radius: 6px;
            font-family: monospace;
            font-size: 14px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="icon">📄</div>
        <h1>Document File Not Found</h1>
        <p>The document file is not available on the server.</p>
        @if(isset($document))
        <div class="filename">{{ $document->file_name ?? 'Unknown' }}</div>
        @endif
    </div>
</body>

</html>