import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ user, currentUser, remainingLeaveDays, usedLeaveDays }) {
    const getRoleLabel = (role) => {
        switch (role) {
            case 'teacher': return 'Tanár';
            case 'manager': return 'Menedzser';
            case 'admin': return 'Admin';
            default: return role;
        }
    };

    const canEditUser = (user) => {
        // Cannot edit deactivated users
        if (!user.is_active) {
            return false;
        }
        
        // If it's the current user, they should use profile settings
        if (user.id === currentUser.id) {
            return false; // Redirect to profile instead
        }
        
        // If current user is admin, can edit all active users
        if (currentUser.role === 'admin') {
            return true;
        }
        
        // If current user is manager, can only edit their subordinates (teachers)
        if (currentUser.role === 'manager') {
            return user.role === 'teacher' && user.manager_id === currentUser.id;
        }
        
        // Teachers cannot edit anyone else
        return false;
    };

    const canReactivateUser = (user) => {
        // Only admins can reactivate users
        return currentUser.role === 'admin' && !user.is_active;
    };

    const canCreateLeaveForUser = (user) => {
        // Cannot create leave for deactivated users
        if (!user.is_active) {
            return false;
        }
        
        // If it's the current user, they should use the regular leave creation
        if (user.id === currentUser.id) {
            return false;
        }
        
        // If current user is admin, can create leave for all active users
        if (currentUser.role === 'admin') {
            return true;
        }
        
        // If current user is manager, can only create leave for their subordinates (teachers)
        if (currentUser.role === 'manager') {
            return user.role === 'teacher' && user.manager_id === currentUser.id;
        }
        
        // Teachers cannot create leave for anyone else
        return false;
    };

    const handleReactivate = () => {
        if (confirm(`Biztosan újraaktiválni szeretnéd a felhasználót "${user.name}"?`)) {
            router.post(route('felhasznalok.reactivate', user.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Felhasználó részletei" />
            <PageContainer>
                <div>
                    <div className="mb-6">
                        <Link
                            href={route('felhasznalok.index')}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                            ← Vissza a felhasználók listájához
                        </Link>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Felhasználó részletei</h1>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                                    {!user.is_active && (
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                            Deaktivált
                                        </span>
                                    )}
                                </div>
                                <div className="flex space-x-3">
                                    {canCreateLeaveForUser(user) && (
                                        <Link
                                            href={route('szabadsag.igenyles') + `?user_id=${user.id}`}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Szabadság kiírása
                                        </Link>
                                    )}
                                    {canEditUser(user) && (
                                        <Link
                                            href={route('felhasznalok.edit', user.id)}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Szerkesztés
                                        </Link>
                                    )}
                                    {canReactivateUser(user) && (
                                        <button
                                            onClick={handleReactivate}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Újraaktiválás
                                        </button>
                                    )}
                                    {user.id === currentUser.id && user.is_active && (
                                        <Link
                                            href={route('beallitasok.edit')}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Beállítások
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-6 py-4">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Név</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Szerepkör</dt>
                                    <dd className="mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Menedzser</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {user.manager ? user.manager.name : 'Nincs menedzser'}
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Szabadság napok száma</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        <div className="flex items-center space-x-4">
                                            <span>{user.total_leave_days} nap összesen</span>
                                            <span className="text-green-600 font-medium">{remainingLeaveDays || 0} nap maradt</span>
                                            <span className="text-gray-500">({usedLeaveDays || 0} nap felhasználva)</span>
                                        </div>
                                    </dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Regisztráció dátuma</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(user.created_at).toLocaleDateString('hu-HU')}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {user.subordinates && user.subordinates.length > 0 && (
                        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Beosztottak</h3>
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
                                                Szabadság napok
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {user.subordinates.map((subordinate) => (
                                            <tr key={subordinate.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {subordinate.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {subordinate.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        subordinate.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                        subordinate.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                        {getRoleLabel(subordinate.role)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {subordinate.total_leave_days}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* User's Leaves */}
                    {user.leaves && user.leaves.length > 0 && (
                        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Szabadság kérelmek</h3>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Kezdő dátum
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Befejező dátum
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Napok száma
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Státusz
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Beküldve
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Műveletek
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {user.leaves.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{leave.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(leave.start_date).toLocaleDateString('hu-HU')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(leave.end_date).toLocaleDateString('hu-HU')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {leave.days_requested} nap
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        leave.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {leave.status === 'pending' ? 'Függőben' :
                                                         leave.status === 'approved' ? 'Jóváhagyva' :
                                                         leave.status === 'rejected' ? 'Elutasítva' :
                                                         leave.status === 'cancelled' ? 'Érvénytelenítve' :
                                                         'Ismeretlen'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(leave.created_at).toLocaleDateString('hu-HU')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        href={route('szabadsag.show', leave.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Részletek
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* No leaves message */}
                    {(!user.leaves || user.leaves.length === 0) && (
                        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Szabadság kérelmek</h3>
                            </div>
                            <div className="px-6 py-4">
                                <p className="text-sm text-gray-500 text-center">
                                    {user.name} még nem nyújtott be szabadság kérelmet.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
