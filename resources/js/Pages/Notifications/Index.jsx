import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ notifications, currentUser }) {
    const [selectedFilter, setSelectedFilter] = useState('all');

    const handleFilterChange = (type) => {
        setSelectedFilter(type);
        router.get(route('ertesitesek.index'), { type: type === 'all' ? null : type }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const markAsRead = (notificationId) => {
        router.post(route('ertesitesek.read', notificationId), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Dispatch custom event to update navbar counter
                window.dispatchEvent(new CustomEvent('notification-read'));
            }
        });
    };

    const markAllAsRead = () => {
        router.post(route('ertesitesek.read-all'), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Dispatch custom event to update navbar counter
                window.dispatchEvent(new CustomEvent('notifications-read-all'));
            }
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

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'profile_updated':
                return '👤';
            case 'password_changed':
                return '🔒';
            case 'account_deleted':
                return '🗑️';
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
            default:
                return '📢';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'profile_updated':
                return 'bg-blue-50 border-blue-200';
            case 'password_changed':
                return 'bg-yellow-50 border-yellow-200';
            case 'account_deleted':
                return 'bg-red-50 border-red-200';
            case 'user_created':
                return 'bg-green-50 border-green-200';
            case 'user_updated':
                return 'bg-blue-50 border-blue-200';
            case 'user_deleted':
                return 'bg-red-50 border-red-200';
            case 'login':
                return 'bg-indigo-50 border-indigo-200';
            case 'logout':
                return 'bg-gray-50 border-gray-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getNotificationTypeLabel = (type) => {
        switch (type) {
            case 'profile_updated':
                return 'Profil módosítva';
            case 'password_changed':
                return 'Jelszó módosítva';
            case 'account_deleted':
                return 'Fiók törölve';
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
            default:
                return type;
        }
    };

    const availableTypes = [
        { value: 'all', label: 'Összes' },
        { value: 'user_updated', label: 'Profil módosítva' },
        { value: 'password_changed', label: 'Jelszó módosítva' },
        { value: 'profile_updated', label: 'Saját profil módosítva' },
    ];

    const unreadCount = notifications.data.filter(n => !n.read_at).length;

    return (
        <AuthenticatedLayout>
            <Head title="Értesítések" />
            <PageContainer>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Értesítések</h1>
                    
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Személyes értesítések</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Itt láthatod a saját tevékenységeidről szóló értesítéseket.
                                        {unreadCount > 0 && (
                                            <span className="ml-2 text-indigo-600 font-medium">
                                                {unreadCount} olvasatlan értesítés
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <select
                                        value={selectedFilter}
                                        onChange={(e) => handleFilterChange(e.target.value)}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        {availableTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                                        >
                                            Összes olvasottnak jelöl
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="divide-y divide-gray-200">
                            {notifications.data.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                                        !notification.read_at ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <span className="text-lg">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        {notification.title}
                                                    </h4>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNotificationColor(notification.type)}`}>
                                                        {getNotificationTypeLabel(notification.type)}
                                                    </span>
                                                    {!notification.read_at && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Új
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(notification.created_at)}
                                                    </span>
                                                    {!notification.read_at && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
                                                        >
                                                            Olvasottnak jelöl
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {notifications.data.length === 0 && (
                            <div className="px-6 py-12 text-center">
                                <p className="text-gray-500">Még nincsenek értesítések.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {notifications.links && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        {notifications.from && notifications.to && (
                                            <span>
                                                {notifications.from}-{notifications.to} / {notifications.total} értesítés
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        {notifications.links.map((link, index) => (
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