"use client"
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Admindashboard from '../Components/Admindashboard';
import { Lock, User } from 'react-feather'; // You can use react-icons or similar for icons

const App = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [authorize, setAuthorize] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const ADMIN_ID = process.env.NEXT_PUBLIC_admin_id;
    const ADMIN_PASS = process.env.NEXT_PUBLIC_admin_pass;

    const onSubmit = async (data) => {
        setIsLoading(true);
        setMessage('');

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (data.username === ADMIN_ID && data.password === ADMIN_PASS) {
            setMessage('Login successful! Redirecting...');
            setTimeout(() => {
                setAuthorize(true);
                reset();
                setIsLoading(false);
            }, 1500);
        } else {
            setMessage('Login failed: Incorrect username or password.');
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setAuthorize(false);
        setMessage('You have been logged out successfully.');
    };

    return (
        <>
            {!authorize ? (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
                        <div className="text-center mb-8">
                            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Lock className="text-blue-600" size={28} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Admin Portal</h2>
                            <p className="text-gray-600 mt-2">Enter your credentials to access the dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="text-gray-400" size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        id="username"
                                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        placeholder="admin@example.com"
                                        {...register('username', {
                                            required: 'Username is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address"
                                            }
                                        })}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="text-gray-400" size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        placeholder="••••••••"
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 8,
                                                message: 'Password must be at least 8 characters'
                                            }
                                        })}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>

                            {message && (
                                <div className={`rounded-md p-3 ${message.includes('successful') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    <p className="text-sm text-center">{message}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : 'Sign in'}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">
                                        Need help?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 text-center text-sm text-gray-600">
                                <p>Contact support at <a href="mailto:vaibhavkhapra5@gmail.com" className="font-medium text-blue-600 hover:text-blue-500">vaibhavkhapra5@gmail.com</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <Admindashboard onLogout={handleLogout} />
            )}
        </>
    );
};

export default App;