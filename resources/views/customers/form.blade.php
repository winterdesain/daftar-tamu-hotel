@extends('layouts.app')

@section('content')
<h2>{{ $customer ? 'Edit' : 'Tambah' }} Customer</h2>
<form method="POST" action="{{ $customer ? route('customers.update', $customer->id) : route('customers.store') }}">
    @csrf
    <label>Name</label><br>
    <input type="text" name="name" value="{{ $customer->name ?? '' }}" required><br>
    <label>Email</label><br>
    <input type="email" name="email" value="{{ $customer->email ?? '' }}"><br>
    <label>Phone</label><br>
    <input type="text" name="phone" value="{{ $customer->phone ?? '' }}"><br>
    <label>Address</label><br>
    <textarea name="address">{{ $customer->address ?? '' }}</textarea><br>
    <button type="submit">Simpan</button>
</form>
@endsection
