import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ logs, currentUser, filters, users }) {
    const [selectedFilter, setSelectedFilter] = useState(filters?.action || 'all');
    const [selectedUser, setSelectedUser] = useState(filters?.user || 'all');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [dateSort, setDateSort] = useState(filters?.date_sort || 'desc');

    const handleFilterChange = (type, value) => {
        const newFilters = {
            action: selectedFilter,
            user: selectedUser,
            date_from: dateFrom,
            date_to: dateTo,
            search: searchTerm,
            date_sort: dateSort
        };
        
        if (type === 'action') {
            newFilters.action = value;
            setSelectedFilter(value);
        } else if (type === 'user') {
            newFilters.user = value;
            setSelectedUser(value);
        } else if (type === 'date_from') {
            newFilters.date_from = value;
            setDateFrom(value);
        } else if (type === 'date_to') {
            newFilters.date_to = value;
            setDateTo(value);
        } else if (type === 'date_sort') {
            newFilters.date_sort = value;
            setDateSort(value);
        }
        
        // Remove empty values from the query
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key] === 'all' || newFilters[key] === '') {
                delete newFilters[key];
            }
        });
        
        router.get(route('naplo.index'), newFilters, {
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
                action: selectedFilter !== 'all' ? selectedFilter : undefined,
                user: selectedUser !== 'all' ? selectedUser : undefined,
                search: searchTerm || undefined
            };
            
            router.get(route('naplo.index'), newFilters, {
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
                action: selectedFilter !== 'all' ? selectedFilter : undefined,
                user: selectedUser !== 'all' ? selectedUser : undefined,
                date_from: newFromDate,
                date_to: adjustedToStr,
                search: searchTerm || undefined
            };
            
            router.get(route('naplo.index'), newFilters, {
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

    const handleDateSort = () => {
        const newSort = dateSort === 'desc' ? 'asc' : 'desc';
        handleFilterChange('date_sort', newSort);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        
        // Debounce search to avoid too many requests
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            const newFilters = {
                action: selectedFilter !== 'all' ? selectedFilter : undefined,
                user: selectedUser !== 'all' ? selectedUser : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                search: value || undefined
            };
            
            router.get(route('naplo.index'), newFilters, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 300);
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'user_created':
                return '👤';
            case 'user_updated':
                return '✏️';
            case 'user_deactivated':
                return '🚫';
            case 'user_reactivated':
                return '✅';
            case 'login':
                return '🔐';
            case 'logout':
                return '🚪';
            case 'profile_updated':
                return '👤';
            case 'password_changed':
                return '🔒';
            case 'leave_requested':
                return '📅';
            case 'leave_approved':
                return '✅';
            case 'leave_rejected':
                return '❌';
            case 'leave_cancelled':
                return '🚫';
            case 'created_for_user':
                return '👤';
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
            case 'user_deactivated':
                return 'text-red-600 bg-red-100';
            case 'user_reactivated':
                return 'text-green-600 bg-green-100';
            case 'login':
                return 'text-gray-400 bg-gray-100';
            case 'logout':
                return 'text-gray-400 bg-gray-100';
            case 'profile_updated':
                return 'text-blue-600 bg-blue-100';
            case 'password_changed':
                return 'text-blue-600 bg-blue-100';
            case 'leave_requested':
                return 'text-yellow-600 bg-yellow-100';
            case 'leave_approved':
                return 'text-green-600 bg-green-100';
            case 'leave_rejected':
                return 'text-red-600 bg-red-100';
            case 'leave_cancelled':
                return 'text-black bg-gray-200';
            case 'created_for_user':
                return 'text-blue-600 bg-blue-100';
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
            case 'user_deactivated':
                return 'Felhasználó deaktiválva';
            case 'user_reactivated':
                return 'Felhasználó újraaktiválva';
            case 'login':
                return 'Bejelentkezés';
            case 'logout':
                return 'Kijelentkezés';
            case 'profile_updated':
                return 'Profil módosítva';
            case 'password_changed':
                return 'Jelszó módosítva';
            case 'leave_requested':
                return 'Szabadság kérés benyújtva';
            case 'leave_approved':
                return 'Szabadság kérés jóváhagyva';
            case 'leave_rejected':
                return 'Szabadság kérés elutasítva';
            case 'leave_cancelled':
                return 'Szabadság kérés érvénytelenítve';
            case 'created_for_user':
                return 'Szabadság kérés létrehozva másnak';
            default:
                return action;
        }
    };

    const availableActions = [
        { value: 'all', label: 'Összes tevékenység' },
        { value: 'user_created', label: 'Felhasználó létrehozva' },
        { value: 'user_updated', label: 'Felhasználó módosítva' },
        { value: 'user_deactivated', label: 'Felhasználó deaktiválva' },
        { value: 'user_reactivated', label: 'Felhasználó újraaktiválva' },
        { value: 'login', label: 'Bejelentkezés' },
        { value: 'logout', label: 'Kijelentkezés' },
        { value: 'profile_updated', label: 'Profil módosítva' },
        { value: 'password_changed', label: 'Jelszó módosítva' },
        { value: 'leave_requested', label: 'Szabadság kérés benyújtva' },
        { value: 'leave_approved', label: 'Szabadság kérés jóváhagyva' },
        { value: 'leave_rejected', label: 'Szabadság kérés elutasítva' },
        { value: 'leave_cancelled', label: 'Szabadság kérés érvénytelenítve' },
        { value: 'created_for_user', label: 'Szabadság kérés létrehozva másnak' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Rendszer napló" />
            <PageContainer>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Rendszer napló</h1>
                    
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
                                        placeholder="Keresés tevékenységben, leírásban, felhasználóban, stb..."
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>

                                {/* Activity Filter */}
                                <div className="lg:col-span-2">
                                    <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tevékenység
                                    </label>
                                    <select
                                        id="action-filter"
                                        value={selectedFilter}
                                        onChange={(e) => handleFilterChange('action', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        {availableActions.map((action) => (
                                            <option key={action.value} value={action.value}>
                                                {action.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* User Filter */}
                                <div className="lg:col-span-2">
                                    <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                        Felhasználó
                                    </label>
                                    <select
                                        id="user-filter"
                                        value={selectedUser}
                                        onChange={(e) => handleFilterChange('user', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="all">Összes felhasználó</option>
                                        {users && users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
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
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={handleDateSort}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Dátum</span>
                                                <div className="flex flex-col space-y-0">
                                                    <span className={`text-[8px] leading-none ${dateSort === 'asc' ? 'text-gray-700' : 'text-gray-400'}`}>
                                                        ▲
                                                    </span>
                                                    <span className={`text-[8px] leading-none ${dateSort === 'desc' ? 'text-gray-700' : 'text-gray-400'}`}>
                                                        ▼
                                                    </span>
                                                </div>
                                            </div>
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
                                                {log.formatted_created_at || log.created_at}
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
