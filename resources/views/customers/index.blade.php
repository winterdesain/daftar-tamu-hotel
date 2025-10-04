@extends('layouts.app')

@section('content')
<h2>Customers</h2>
<a href="{{ route('customers.create') }}">Tambah Customer</a>
<table border="1" cellpadding="6" cellspacing="0">
    <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
    @foreach($customers as $c)
    <tr>
        <td>{{ $c->id }}</td>
        <td>{{ $c->name }}</td>
        <td>{{ $c->email }}</td>
        <td>{{ $c->phone }}</td>
        <td>
            <a href="{{ route('customers.edit', $c->id) }}">Edit</a>
            <form action="{{ route('customers.destroy', $c->id) }}" method="POST" style="display:inline">
                @csrf
                <button type="submit">Delete</button>
            </form>
        </td>
    </tr>
    @endforeach
</table>
@endsection
