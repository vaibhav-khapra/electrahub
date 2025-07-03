"use client";
import React, { useState, useEffect } from 'react'; // Import useEffect
import { Home, Users, Package, ShoppingCart, Settings, LogOutIcon ,  Menu, PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

const Admindashboard = ({onLogout}) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [products, setProducts] = useState([]); // Initialize products as an empty array
    const [loadingProducts, setLoadingProducts] = useState(true); // Loading state for products
    const [errorProducts, setErrorProducts] = useState(null); // Error state for products fetch

    // Dummy data for dashboard statistics (remains local)
    const stats = [
        { name: 'Total Users', value: '1,234', icon: <Users className="w-6 h-6 text-blue-500" /> },
        { name: 'Total Products', value: '567', icon: <Package className="w-6 h-6 text-green-500" /> },
        { name: 'New Orders', value: '89', icon: <ShoppingCart className="w-6 h-6 text-yellow-500" /> },
        { name: 'Revenue', value: '$12,345', icon: <Home className="w-6 h-6 text-red-500" /> },
    ];

    // Dummy data for recent orders (remains local)
    const recentOrders = [
        { id: '#1001', customer: 'Alice Smith', total: '$250', status: 'Completed' },
        { id: '#1002', customer: 'Bob Johnson', total: '$120', status: 'Pending' },
        { id: '#1003', customer: 'Charlie Brown', total: '$500', status: 'Shipped' },
        { id: '#1004', customer: 'Diana Prince', total: '$80', status: 'Completed' },
        { id: '#1005', customer: 'Clark Kent', total: '$320', status: 'Pending' },
    ];

    // React Hook Form for Add Product
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const router = useRouter()

    // Function to fetch products from the API
    const fetchProducts = async () => {
        setLoadingProducts(true);
        setErrorProducts(null);
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setErrorProducts('Failed to load products.');
        } finally {
            setLoadingProducts(false);
        }
    };

    // Fetch products when the component mounts
    useEffect(() => {
        fetchProducts();
    }, []); // Empty dependency array means this runs once on mount

    const onSubmitNewProduct = async (data) => {
        // Prepare data to send to the backend, aligning with Mongoose schema
        const productToSend = {
            name: data.name,
            brand: data.brand,
            price: parseFloat(data.price),
            rating: parseFloat(data.rating),
            reviews: parseInt(data.reviews, 10),
            quantity: parseInt(data.quantity, 10), // Ensure quantity is an integer
            imageUrl: data.imageUrl,
            category: data.category,
            // 'stock' and 'date' will be handled by Mongoose defaults on the backend
            // 'isNew' is not in your Mongoose schema, so we won't send it unless added to schema
        };

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productToSend),
            });

            const result = await response.json();

            if (response.ok) {
                // If successful, add the new product (returned from backend) to local state
                setProducts((prevProducts) => [...prevProducts, result.product]);
                alert(result.message);
                reset(); // Clear the form
                 // Navigate to products tab
            } else {
                // Handle errors from the API
                console.error('Error from API:', result);
                alert(`Failed to add product: ${result.message || 'Unknown error'}`);
                if (result.errors) {
                    result.errors.forEach(err => console.error(`${err.field}: ${err.message}`));
                }
            }
        } catch (error) {
            console.error('Network or unexpected error:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                                    <div className="p-3 rounded-full bg-gray-100">
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">{stat.name}</p>
                                        <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Orders Table */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Order ID</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">User Management</h2>
                        <p className="text-gray-600">Details about users will go here.</p>
                        <div className="mt-4">
                            <ul className="divide-y divide-gray-200">
                                <li className="py-2 flex justify-between items-center">
                                    <span className="font-medium">John Doe</span>
                                    <span className="text-gray-500 text-sm">john.doe@example.com</span>
                                </li>
                                <li className="py-2 flex justify-between items-center">
                                    <span className="font-medium">Jane Smith</span>
                                    <span className="text-gray-500 text-sm">jane.smith@example.com</span>
                                </li>
                                <li className="py-2 flex justify-between items-center">
                                    <span className="font-medium">Peter Jones</span>
                                    <span className="text-gray-500 text-sm">peter.jones@example.com</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                );
            case 'products':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Catalog</h2>
                        <p className="text-gray-600">Manage your products here.</p>
                        {loadingProducts && <p className="text-blue-500">Loading products...</p>}
                        {errorProducts && <p className="text-red-500">{errorProducts}</p>}
                        {!loadingProducts && !errorProducts && products.length === 0 && (
                            <p className="text-gray-600">No products found. Add some!</p>
                        )}
                        {!loadingProducts && !errorProducts && products.length > 0 && (
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th> {/* Added Date Added column */}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {products.map((product) => (
                                            <tr key={product._id || product.id}> {/* Use _id from MongoDB */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <img src={product.imageUrl || `https://placehold.co/40x40/aabbcc/ffffff?text=${product.name?.substring(0, 2).toUpperCase()}`} alt={product.name} className="w-10 h-10 rounded-full object-cover" />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.brand}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {product.price?.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.rating} ({product.reviews})</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {product.stock ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </td> 
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.date ? new Date(product.date).toLocaleDateString("en-IN") : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            case 'add-product':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Product</h2>
                        <form onSubmit={handleSubmit(onSubmitNewProduct)} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    {...register("name", { required: "Product name is required" })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                                <input
                                    type="text"
                                    id="brand"
                                    {...register("brand", { required: "Brand is required" })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                />
                                {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                                <input
                                    type="number"
                                    id="price"
                                    step="0.01"
                                    {...register("price", { required: "Price is required", min: { value: 0, message: "Price must be positive" } })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                />
                                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating</label>
                                <input
                                    type="number"
                                    id="rating"
                                    step="0.1"
                                    {...register("rating", { required: "Rating is required", min: { value: 0, message: "Rating must be between 0 and 5" }, max: { value: 5, message: "Rating must be between 0 and 5" } })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                />
                                {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="reviews" className="block text-sm font-medium text-gray-700">Number of Reviews</label>
                                <input
                                    type="number"
                                    id="reviews"
                                    {...register("reviews", { required: "Number of reviews is required", min: { value: 0, message: "Reviews cannot be negative" } })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                />
                                {errors.reviews && <p className="mt-1 text-sm text-red-600">{errors.reviews.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity in Stock</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    {...register("quantity", { required: "Quantity is required", min: { value: 0, message: "Quantity cannot be negative" } })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                />
                                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
                                <input
                                    type="text"
                                    id="imageUrl"
                                    {...register("imageUrl")}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                    placeholder="Optional: Enter image URL"
                                />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                <input
                                    type="text"
                                    id="category"
                                    {...register("category", { required: "Category is required" })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                />
                                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                            </div>
                            {/* Removed stock and isNew from form as they are handled by Mongoose defaults or not in schema */}
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Add Product
                            </button>
                        </form>
                    </div>
                );
            case 'orders':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Management</h2>
                        <p className="text-gray-600">View and process orders.</p>
                        <div className="overflow-x-auto mt-4">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Order ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Settings</h2>
                        <p className="text-gray-600">Configure dashboard settings here.</p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">Site Name</label>
                                <input type="text" id="siteName" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" placeholder="My Admin Panel" />
                            </div>
                            <div>
                                <label htmlFor="emailNotifications" className="flex items-center">
                                    <input type="checkbox" id="emailNotifications" className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500" />
                                    <span className="ml-2 text-sm text-gray-700">Enable Email Notifications</span>
                                </label>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar for desktop and mobile */}
            <aside
                className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-4 z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
            >
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Close sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <nav>
                    <ul>
                        <li className="mb-2">
                            <button
                                onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                                className={`flex items-center w-full px-4 py-2 rounded-lg text-left transition-colors duration-200 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Home className="w-5 h-5 mr-3" />
                                Dashboard
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
                                className={`flex items-center w-full px-4 py-2 rounded-lg text-left transition-colors duration-200 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Users className="w-5 h-5 mr-3" />
                                Users
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); fetchProducts(); }} 
                                className={`flex items-center w-full px-4 py-2 rounded-lg text-left transition-colors duration-200 ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Package className="w-5 h-5 mr-3" />
                                Products
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                onClick={() => { setActiveTab('add-product'); setIsSidebarOpen(false); }}
                                className={`flex items-center w-full px-4 py-2 rounded-lg text-left transition-colors duration-200 ${activeTab === 'add-product' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <PlusCircle className="w-5 h-5 mr-3" />
                                Add Product
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
                                className={`flex items-center w-full px-4 py-2 rounded-lg text-left transition-colors duration-200 ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <ShoppingCart className="w-5 h-5 mr-3" />
                                Orders
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                                className={`flex items-center w-full px-4 py-2 rounded-lg text-left transition-colors duration-200 ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Settings className="w-5 h-5 mr-3" />
                                Settings
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                onClick={onLogout}
                                className={`flex items-center w-full px-4 py-2 rounded-lg text-left transition-colors duration-200 ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <LogOutIcon className="w-5 h-5 mr-3" />
                                Logout
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main content area */}
            <main className="flex-1 p-4 md:p-6">
                <header className="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none mr-4"
                            aria-label="Open sidebar"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-semibold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-gray-700">Admin User</span>
                        <img
                            src="https://placehold.co/40x40/aabbcc/ffffff?text=AU"
                            alt="User Avatar"
                            className="w-10 h-10 rounded-full border-2 border-blue-500"
                        />
                    </div>
                </header>
                {renderContent()}
            </main>
        </div>
    );
};

export default Admindashboard;
