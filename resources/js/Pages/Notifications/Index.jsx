import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ notifications, currentUser, selectedType, filters }) {
    const [selectedFilter, setSelectedFilter] = useState(filters?.type || 'all');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [sortBy, setSortBy] = useState(filters?.sort || 'newest');

    const handleFilterChange = (filterType, value) => {
        const newFilters = {
            type: selectedFilter,
            date_from: dateFrom,
            date_to: dateTo,
            search: searchTerm,
            sort: sortBy
        };
        
        if (filterType === 'type') {
            newFilters.type = value;
            setSelectedFilter(value);
        } else if (filterType === 'date_from') {
            newFilters.date_from = value;
            setDateFrom(value);
        } else if (filterType === 'date_to') {
            newFilters.date_to = value;
            setDateTo(value);
        } else if (filterType === 'sort') {
            newFilters.sort = value;
            setSortBy(value);
        }
        
        // Remove empty values from the query
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key] === 'all' || newFilters[key] === '') {
                delete newFilters[key];
            }
        });
        
        router.get(route('ertesitesek.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDateFromChange = (newFromDate) => {
        const prevFrom = dateFrom;
        const prevTo = dateTo;

        // If start date is cleared, also clear the end date
        if (!newFromDate) {
            setDateFrom('');
            setDateTo('');
            
            // Trigger filter with both dates cleared
            const newFilters = {
                type: selectedFilter !== 'all' ? selectedFilter : undefined,
                user: selectedUser !== 'all' ? selectedUser : undefined,
                search: searchTerm || undefined
            };
            
            router.get(route('ertesitesek.index'), newFilters, {
                preserveState: true,
                preserveScroll: true,
            });
            return;
        }

        // Compute previous duration if both dates existed and valid
        let preservedDays = 0;
        if (prevFrom && prevTo) {
            const prevFromDate = new Date(prevFrom);
            const prevToDate = new Date(prevTo);
            if (prevToDate >= prevFromDate) {
                // inclusive duration in days
                preservedDays = Math.ceil((prevToDate - prevFromDate) / (1000 * 60 * 60 * 24)) + 1;
            }
        }

        // Update from date first
        setDateFrom(newFromDate);

        // If no previous to date, just trigger filter and return
        if (!prevTo) {
            handleFilterChange('date_from', newFromDate);
            return;
        }

        // If new from date is after current to date, auto-shift to date to preserve duration
        const newFromDateObj = new Date(newFromDate);
        const currentToDateObj = new Date(prevTo);

        if (currentToDateObj < newFromDateObj) {
            // If we had a valid preservedDays, keep it; else default to 1 day
            const daysToApply = preservedDays > 0 ? preservedDays : 1;

            const adjustedTo = new Date(newFromDateObj);
            adjustedTo.setDate(adjustedTo.getDate() + (daysToApply - 1)); // inclusive

            const adjustedToStr = adjustedTo.toISOString().split('T')[0];
            setDateTo(adjustedToStr);
            
            // Trigger filter with both dates
            const newFilters = {
                type: selectedFilter !== 'all' ? selectedFilter : undefined,
                user: selectedUser !== 'all' ? selectedUser : undefined,
                date_from: newFromDate,
                date_to: adjustedToStr,
                search: searchTerm || undefined
            };
            
            router.get(route('ertesitesek.index'), newFilters, {
                preserveState: true,
                preserveScroll: true,
            });
        } else {
            // To date still valid, just trigger filter
            handleFilterChange('date_from', newFromDate);
        }
    };

    const handleDateToChange = (newToDate) => {
        setDateTo(newToDate);
        handleFilterChange('date_to', newToDate);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        
        // Debounce search to avoid too many requests
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            const newFilters = {
                type: selectedFilter !== 'all' ? selectedFilter : undefined,
                user: selectedUser !== 'all' ? selectedUser : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                search: value || undefined
            };
            
            router.get(route('ertesitesek.index'), newFilters, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 300);
    };

    const clearAllFilters = () => {
        setSelectedFilter('all');
        setDateFrom('');
        setDateTo('');
        setSearchTerm('');
        setSortBy('newest');
        
        // Clear any pending search timeout
        clearTimeout(window.searchTimeout);
        
        // Navigate to clean URL
        router.get(route('ertesitesek.index'), {}, {
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

    const markAsUnread = (notificationId) => {
        router.post(route('ertesitesek.unread', notificationId), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Dispatch custom event to update navbar counter
                window.dispatchEvent(new CustomEvent('notification-unread'));
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

    const getNotificationIcon = (type) => {
        switch (type) {
            // Leave notifications
            case 'leave_requested':
                return '⏳';
            case 'leave_approved':
                return '✅';
            case 'leave_rejected':
                return '❌';
            case 'leave_cancelled':
                return '⛔';
            case 'profile_updated':
                return '👤';
            case 'password_changed':
                return '🔒';
            case 'account_deleted': // backward compatibility
                return '🛑';
            case 'user_deactivated':
                return '🛑';
            case 'user_created':
                return '👤';
            case 'user_updated':
                return '✏️';
            case 'user_deleted':
                return '🗑️';
            case 'user_reactivated':
                return '✅';
            case 'login':
                return '🔐';
            case 'logout':
                return '🚪';
            default:
                return '📢';
        }
    };

    const getNotificationColor = (type) => {
        // Match Logs page styling: bg-*100 + text-*600 (no borders)
        switch (type) {
            // Pending
            case 'leave_requested':
                return 'bg-yellow-100 text-yellow-600';

            // Positive
            case 'user_reactivated':
            case 'user_created':
            case 'leave_approved':
                return 'bg-green-100 text-green-600';

            // Negative/destructive (except leave_cancelled which is neutral/grey)
            case 'account_deleted': // backward compatibility
            case 'user_deactivated':
            case 'user_deleted':
            case 'leave_rejected':
                return 'bg-red-100 text-red-600';

            // Neutral/cancelled
            case 'leave_cancelled':
                return 'bg-gray-100 text-gray-800';

            // General updates / info
            case 'profile_updated':
            case 'user_updated':
                return 'bg-blue-100 text-blue-600';
            case 'password_changed':
                return 'bg-blue-100 text-blue-600';

            // Auth and misc
            case 'login':
                return 'bg-indigo-100 text-indigo-600';
            case 'logout':
                return 'bg-gray-100 text-gray-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const getNotificationTypeLabel = (type) => {
        switch (type) {
            case 'account_deleted': // backward compatibility
                return 'Fiók deaktiválva';
            case 'leave_requested':
                return 'Szabadság kérvényezve';
            case 'leave_approved':
                return 'Szabadság jóváhagyva';
            case 'leave_rejected':
                return 'Szabadság elutasítva';
            case 'leave_cancelled':
                return 'Szabadság érvénytelenítve';
            case 'profile_updated':
                return 'Profil módosítva';
            case 'password_changed':
                return 'Jelszó módosítva';
            case 'user_deactivated':
                return 'Fiók deaktiválva';
            case 'user_created':
                return 'Felhasználó létrehozva';
            case 'user_updated':
                return 'Felhasználó módosítva';
            case 'user_deleted':
                return 'Felhasználó törölve';
            case 'user_reactivated':
                return 'Fiók újraaktiválva';
            case 'login':
                return 'Bejelentkezés';
            case 'logout':
                return 'Kijelentkezés';
            default:
                return type;
        }
    };

    const availableTypes = [
        { value: 'all', label: 'Összes értesítés' },
        // Leave events
        { value: 'leave_requested', label: 'Szabadság kérvényezve' },
        { value: 'leave_approved', label: 'Szabadság jóváhagyva' },
        { value: 'leave_rejected', label: 'Szabadság elutasítva' },
        { value: 'leave_cancelled', label: 'Szabadság érvénytelenítve' },
        // Account/User events
        { value: 'user_created', label: 'Felhasználó létrehozva' },
        { value: 'user_updated', label: 'Felhasználó módosítva' },
        { value: 'user_deleted', label: 'Felhasználó törölve' },
        { value: 'user_deactivated', label: 'Fiók deaktiválva' },
        { value: 'user_reactivated', label: 'Fiók újraaktiválva' },
        // Personal/account
        { value: 'profile_updated', label: 'Profil módosítva' },
        { value: 'password_changed', label: 'Jelszó módosítva' },
        // Auth
        { value: 'login', label: 'Bejelentkezés' },
        { value: 'logout', label: 'Kijelentkezés' },
    ];

    const availableSorts = [
        { value: 'newest', label: 'Legújabb először' },
        { value: 'oldest', label: 'Legrégebbi először' },
    ];

    const unreadCount = notifications.data.filter(n => !n.read_at).length;

    return (
        <AuthenticatedLayout>
            <Head title="Értesítések" />
            <PageContainer>
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Értesítések</h1>
                        <div className="flex items-center space-x-4">
                            {unreadCount > 0 && (
                                <span className="text-sm text-indigo-600 font-medium">
                                    {unreadCount} olvasatlan értesítés
                                </span>
                            )}
                            <button
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                    unreadCount > 0
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Összes olvasottnak jelöl
                            </button>
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
                                        placeholder="Keresés címben, leírásban, stb..."
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>

                                {/* Type Filter */}
                                <div className="lg:col-span-2">
                                    <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                        Típus
                                    </label>
                                    <select
                                        id="type-filter"
                                        value={selectedFilter}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        {availableTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date From Filter */}
                                <div className="lg:col-span-1">
                                    <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
                                        Dátumtól
                                    </label>
                                    <input
                                        type="date"
                                        id="date-from"
                                        value={dateFrom}
                                        onChange={(e) => handleDateFromChange(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>

                                {/* Date To Filter */}
                                <div className="lg:col-span-1">
                                    <label htmlFor="date-to" className={`block text-sm font-medium mb-1 ${
                                        !dateFrom ? 'text-gray-400' : 'text-gray-700'
                                    }`}>
                                        Dátumig
                                    </label>
                                    <input
                                        type="date"
                                        id="date-to"
                                        value={dateTo}
                                        onChange={(e) => handleDateToChange(e.target.value)}
                                        min={dateFrom || undefined}
                                        max={new Date().toISOString().split('T')[0]}
                                        disabled={!dateFrom}
                                        className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm ${
                                            !dateFrom ? 'bg-gray-100 cursor-not-allowed' : ''
                                        }`}
                                    />
                                </div>

                                {/* Sort Filter */}
                                <div className="lg:col-span-2">
                                    <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                        Rendezés
                                    </label>
                                    <select
                                        id="sort-filter"
                                        value={sortBy}
                                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        {availableSorts.map((sort) => (
                                            <option key={sort.value} value={sort.value}>
                                                {sort.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Clear filters button */}
                            {(selectedFilter !== 'all' || dateFrom || dateTo || searchTerm || sortBy !== 'newest') && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                                    >
                                        Összes szűrő törlése
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="divide-y divide-gray-200">
                            {notifications.data.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-6 py-4 hover:bg-gray-50 transition-colors group ${
                                        !notification.read_at ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <span className="text-lg">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0 relative">
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
                                                <span className="text-xs text-gray-500">
                                                    {notification.formatted_created_at}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-gray-600">
                                                {notification.message}
                                            </p>
                                            <div className={`mt-2 md:absolute md:bottom-0 md:right-0 md:mt-0 ${notification.read_at ? 'group-hover:block hidden' : 'block'}`}>
                                                <button
                                                    onClick={() => notification.read_at ? markAsUnread(notification.id) : markAsRead(notification.id)}
                                                    className="px-2 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                                                >
                                                    {notification.read_at ? 'Olvasatlannak jelöl' : 'Olvasottnak jelöl'}
                                                </button>
                                            </div>
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