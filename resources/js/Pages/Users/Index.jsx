import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ users, currentUser, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        
        // Debounce search to avoid too many requests
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            const newFilters = {
                search: value || undefined
            };
            
            router.get(route('felhasznalok.index'), newFilters, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 300);
    };
    const getRoleLabel = (role) => {
        switch (role) {
            case 'teacher': return 'Tanár';
            case 'manager': return 'Menedzser';
            case 'admin': return 'Admin';
            default: return role;
        }
    };

    const isCurrentUser = (user) => {
        return user.id === currentUser.id;
    };

    const getDetailsLink = (user) => {
        if (isCurrentUser(user)) {
            return route('beallitasok.edit');
        }
        return route('felhasznalok.show', user.id);
    };

    const getDetailsText = (user) => {
        return isCurrentUser(user) ? 'Beállítások' : 'Részletek';
    };

    const canViewUserDetails = (user) => {
        // If it's the current user, always allow (goes to settings)
        if (isCurrentUser(user)) {
            return true;
        }
        
        // If current user is admin, can view all
        if (currentUser.role === 'admin') {
            return true;
        }
        
        // If current user is manager, cannot view admin details
        if (currentUser.role === 'manager' && user.role === 'admin') {
            return false;
        }
        
        // If current user is teacher, cannot view anyone else's details
        if (currentUser.role === 'teacher') {
            return false;
        }
        
        return true;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Felhasználók" />
            <PageContainer>
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Felhasználók kezelése</h1>
                        <div className="flex space-x-3">
                            {currentUser.role === 'admin' && (
                                <Link
                                    href={route('felhasznalok.deactivated')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Deaktivált felhasználók
                                </Link>
                            )}
                            <Link
                                href={route('felhasznalok.create')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Új felhasználó
                            </Link>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4">
                                {/* Search Field */}
                                <div className="lg:col-span-4">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                        Keresés
                                    </label>
                                    <input
                                        type="text"
                                        id="search"
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        placeholder="Keresés név szerint..."
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Név
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Szerepkör
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Menedzser
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Szabadság napok
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Maradék napok
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Függőben lévő napok
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Műveletek
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className={`hover:bg-gray-50 ${isCurrentUser(user) ? 'bg-blue-50' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center">
                                                    {user.name}
                                                    {isCurrentUser(user) && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Te
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                    user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.manager ? user.manager.name : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.total_leave_days}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`font-medium ${
                                                    user.remaining_leaves_current_year > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {user.remaining_leaves_current_year || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`font-medium ${
                                                    user.pending_leaves_days > 0 ? 'text-yellow-600' : 'text-gray-500'
                                                }`}>
                                                    {user.pending_leaves_days || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {canViewUserDetails(user) ? (
                                                    <Link
                                                        href={getDetailsLink(user)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        {getDetailsText(user)}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
