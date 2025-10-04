<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>CRM - Laravel</title>
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>
    <!-- <nav>
        <a href="{{ url('/') }}">Home</a> |
        <a href="{{ route('customers.index') }}">Customers</a> |
        @if(session('user'))
            <span>Hai, {{ session('user.name') }}</span>
            <a href="{{ route('auth.logout') }}">Logout</a>
        @else
            <a href="{{ route('auth.login') }}">Login</a>
        @endif
    </nav> -->
    <main>
        @yield('content')
    </main>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
