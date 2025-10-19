import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, Link, router } from '@inertiajs/react';

export default function Deactivated({ users, currentUser }) {
    const getRoleLabel = (role) => {
        switch (role) {
            case 'teacher': return 'Tanár';
            case 'manager': return 'Menedzser';
            case 'admin': return 'Admin';
            default: return role;
        }
    };

    const handleReactivate = (user) => {
        if (confirm(`Biztosan újraaktiválni szeretnéd a felhasználót "${user.name}"?`)) {
            router.post(route('felhasznalok.reactivate', user.id));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Deaktivált felhasználók" />
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

                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Deaktivált felhasználók
                    </h1>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Deaktivált felhasználók listája
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Itt láthatod azokat a felhasználókat, akiket deaktiváltak. 
                                Csak admin jogosultsággal tudod őket újraaktiválni.
                            </p>
                        </div>

                        {users.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {user.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                        {getRoleLabel(user.role)}
                                                    </span>
                                                    {user.manager && (
                                                        <span className="text-xs text-gray-500">
                                                            Menedzser: {user.manager.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Szabadság napok: {user.total_leave_days} | 
                                                    Utolsó módosítás: {formatDate(user.updated_at)}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Link
                                                    href={route('felhasznalok.show', user.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                >
                                                    Részletek
                                                </Link>
                                                <button
                                                    onClick={() => handleReactivate(user)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    Újraaktiválás
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <p className="text-gray-500">Nincsenek deaktivált felhasználók.</p>
                            </div>
                        )}
                    </div>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
