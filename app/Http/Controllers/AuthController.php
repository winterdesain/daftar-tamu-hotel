<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $email = $request->input('email');
        $password = $request->input('password');

        $user = DB::table('users')->where('email', $email)->first();
        if ($user && password_verify($password, $user->password)) {
            session(['user' => (array) $user]);
            return redirect()->route('home');
        }

        return back()->with('error', 'Email atau password salah');
    }

    public function logout()
    {
        session()->forget('user');
        return redirect()->route('home');
    }
}
