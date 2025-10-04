@extends('layouts.app')

@section('content')
<h2>Login</h2>
@if(session('error'))
    <div style="color:red">{{ session('error') }}</div>
@endif
<form method="POST" action="{{ route('auth.login.post') }}">
    @csrf
    <label>Email</label><br>
    <input type="email" name="email" required><br>
    <label>Password</label><br>
    <input type="password" name="password" required><br>
    <button type="submit">Login</button>
</form>
@endsection
