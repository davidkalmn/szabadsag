import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ logs, currentUser, filters }) {
    const [selectedFilter, setSelectedFilter] = useState(filters?.action || 'all');

    const handleFilterChange = (action) => {
        setSelectedFilter(action);
        router.get(route('naplo.index'), { action: action === 'all' ? null : action }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'user_created':
                return '👤';
            case 'user_updated':
                return '✏️';
            case 'user_deleted':
                return '🗑️';
            case 'login':
                return '🔐';
            case 'logout':
                return '🚪';
            case 'profile_updated':
                return '👤';
            case 'password_changed':
                return '🔒';
            case 'account_deleted':
                return '🗑️';
            default:
                return '📝';
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'user_created':
                return 'text-green-600 bg-green-100';
            case 'user_updated':
                return 'text-blue-600 bg-blue-100';
            case 'user_deleted':
                return 'text-red-600 bg-red-100';
            case 'login':
                return 'text-indigo-600 bg-indigo-100';
            case 'logout':
                return 'text-gray-600 bg-gray-100';
            case 'profile_updated':
                return 'text-blue-600 bg-blue-100';
            case 'password_changed':
                return 'text-yellow-600 bg-yellow-100';
            case 'account_deleted':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getActionLabel = (action) => {
        switch (action) {
            case 'user_created':
                return 'Felhasználó létrehozva';
            case 'user_updated':
                return 'Felhasználó módosítva';
            case 'user_deleted':
                return 'Felhasználó törölve';
            case 'login':
                return 'Bejelentkezés';
            case 'logout':
                return 'Kijelentkezés';
            case 'profile_updated':
                return 'Profil módosítva';
            case 'password_changed':
                return 'Jelszó módosítva';
            case 'account_deleted':
                return 'Fiók törölve';
            default:
                return action;
        }
    };

    const availableActions = [
        { value: 'all', label: 'Összes' },
        { value: 'user_created', label: 'Felhasználó létrehozva' },
        { value: 'user_updated', label: 'Felhasználó módosítva' },
        { value: 'user_deleted', label: 'Felhasználó törölve' },
        { value: 'login', label: 'Bejelentkezés' },
        { value: 'logout', label: 'Kijelentkezés' },
        { value: 'profile_updated', label: 'Profil módosítva' },
        { value: 'password_changed', label: 'Jelszó módosítva' },
        { value: 'account_deleted', label: 'Fiók törölve' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Rendszer napló" />
            <PageContainer>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Rendszer napló</h1>
                    
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Tevékenységek naplója</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {currentUser.role === 'admin' 
                                            ? 'Itt láthatod a rendszerben végrehajtott összes műveletet.'
                                            : currentUser.role === 'manager'
                                            ? 'Itt láthatod a saját tevékenységeidet és beosztottaid műveleteit.'
                                            : 'Itt láthatod a saját tevékenységeidet.'
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="action-filter" className="text-sm font-medium text-gray-700">
                                        Szűrés:
                                    </label>
                                    <select
                                        id="action-filter"
                                        value={selectedFilter}
                                        onChange={(e) => handleFilterChange(e.target.value)}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        {availableActions.map((action) => (
                                            <option key={action.value} value={action.value}>
                                                {action.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tevékenység
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Leírás
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Felhasználó
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dátum
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-lg mr-2">
                                                        {getActionIcon(log.action)}
                                                    </span>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                                                        {getActionLabel(log.action)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {log.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.user ? log.user.name : 'Ismeretlen'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(log.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {logs.data.length === 0 && (
                            <div className="px-6 py-12 text-center">
                                <p className="text-gray-500">Még nincsenek naplóbejegyzések.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {logs.links && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        {logs.from && logs.to && (
                                            <span>
                                                {logs.from}-{logs.to} / {logs.total} bejegyzés
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        {logs.links.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.url}
                                                className={`px-3 py-2 text-sm rounded-md ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
