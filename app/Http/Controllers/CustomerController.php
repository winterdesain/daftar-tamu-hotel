<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = DB::table('customers')->get();
        return view('customers.index', ['customers' => $customers]);
    }

    public function create()
    {
        return view('customers.form', ['customer' => null]);
    }

    public function store(Request $request)
    {
        DB::table('customers')->insert([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'address' => $request->input('address'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        return redirect()->route('customers.index');
    }

    public function edit($id)
    {
        $customer = DB::table('customers')->where('id', $id)->first();
        return view('customers.form', ['customer' => $customer]);
    }

    public function update(Request $request, $id)
    {
        DB::table('customers')->where('id', $id)->update([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'address' => $request->input('address'),
            'updated_at' => now(),
        ]);
        return redirect()->route('customers.index');
    }

    public function destroy($id)
    {
        DB::table('customers')->where('id', $id)->delete();
        return redirect()->route('customers.index');
    }
}
