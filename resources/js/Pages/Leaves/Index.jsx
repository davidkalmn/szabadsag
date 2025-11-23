import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Index({ leaves, user, filters = {} }) {

    const [status, setStatus] = useState(filters.status || '');
    const [category, setCategory] = useState(filters.category || '');
    const [startDateFrom, setStartDateFrom] = useState(filters.start_date_from || '');
    const [startDateTo, setStartDateTo] = useState(filters.start_date_to || '');
    const [createdFrom, setCreatedFrom] = useState(filters.created_from || '');
    const [createdTo, setCreatedTo] = useState(filters.created_to || '');

    const handleFilterChange = (filterType, value) => {
        const newFilters = {
            status: status,
            category: category,
            start_date_from: startDateFrom,
            start_date_to: startDateTo,
            created_from: createdFrom,
            created_to: createdTo,
        };

        if (filterType === 'status') {
            newFilters.status = value;
            setStatus(value);
        } else if (filterType === 'category') {
            newFilters.category = value;
            setCategory(value);
        } else if (filterType === 'start_date_from') {
            newFilters.start_date_from = value;
            setStartDateFrom(value);
        } else if (filterType === 'start_date_to') {
            newFilters.start_date_to = value;
            setStartDateTo(value);
        } else if (filterType === 'created_from') {
            newFilters.created_from = value;
            setCreatedFrom(value);
        } else if (filterType === 'created_to') {
            newFilters.created_to = value;
            setCreatedTo(value);
        }

        // Remove empty values from the query
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key] === '') {
                delete newFilters[key];
            }
        });

        router.get(route('szabadsag.sajat-kerelmek'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setStatus('');
        setCategory('');
        setStartDateFrom('');
        setStartDateTo('');
        setCreatedFrom('');
        setCreatedTo('');
        router.get(route('szabadsag.sajat-kerelmek'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                text: 'Függőben',
                className: 'bg-yellow-100 text-yellow-800'
            },
            approved: {
                text: 'Jóváhagyva',
                className: 'bg-green-100 text-green-800'
            },
            rejected: {
                text: 'Elutasítva',
                className: 'bg-red-100 text-red-800'
            },
            cancelled: {
                text: 'Érvénytelenítve',
                className: 'bg-gray-100 text-gray-800'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;
        
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
                {config.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('hu-HU');
    };

    const handleExport = () => {
        // Get all visible leaves (filtered if filters are applied)
        const visibleLeaves = leaves || [];

        if (visibleLeaves.length === 0) {
            alert('Nincs exportálandó adat.');
            return;
        }

        // Define CSV headers
        const headers = [
            'ID',
            'Kategória',
            'Kezdete',
            'Vége',
            'Napok száma',
            'Állapot',
            'Indok',
            'Beküldve'
        ];

        // Convert leaves to CSV rows
        const rows = visibleLeaves.map(leave => {
            const category = leave.category === 'szabadsag' ? 'Szabadság' :
                           leave.category === 'betegszabadsag' ? 'Betegszabadság' :
                           leave.category === 'tappenzt' ? 'Táppénz' : 'Egyéb távollét';
            
            const status = leave.status === 'pending' ? 'Függőben' :
                          leave.status === 'approved' ? 'Jóváhagyva' :
                          leave.status === 'rejected' ? 'Elutasítva' : 'Érvénytelenítve';

            return [
                leave.id || '',
                category,
                formatDate(leave.start_date),
                formatDate(leave.end_date),
                leave.days_requested || '',
                status,
                leave.reason || '',
                formatDate(leave.created_at)
            ];
        });

        // Escape CSV values and wrap in quotes if needed
        const escapeCSV = (value) => {
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        // Build CSV content
        const csvContent = [
            headers.map(escapeCSV).join(','),
            ...rows.map(row => row.map(escapeCSV).join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8 support
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `szabadsagok_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Format leaves for FullCalendar - using category colors to match the list
    // Only show approved leaves (exclude rejected and cancelled)
    const calendarEvents = useMemo(() => {
        if (!leaves || !Array.isArray(leaves) || leaves.length === 0) {
            return [];
        }
        
        // Filter out rejected and cancelled leaves, only show approved
        const approvedLeaves = leaves.filter(leave => leave.status === 'approved');
        
        return approvedLeaves.map(leave => {
            if (!leave.start_date || !leave.end_date) {
                return null;
            }
            
            // Category colors - exact Tailwind hex codes matching the list badges
            // bg-{color}-100 for background, text-{color}-800 for text
            const categoryStyles = {
                'szabadsag': {
                    backgroundColor: '#dbeafe',  // blue-100 (bg-blue-100)
                    textColor: '#1e40af'          // blue-800 (text-blue-800)
                },
                'betegszabadsag': {
                    backgroundColor: '#ffedd5',  // orange-100 (bg-orange-100)
                    textColor: '#9a3412'          // orange-800 (text-orange-800)
                },
                'tappenzt': {
                    backgroundColor: '#fee2e2',  // red-100 (bg-red-100)
                    textColor: '#991b1b'          // red-800 (text-red-800)
                },
                'egyeb_tavollet': {
                    backgroundColor: '#f3e8ff',  // purple-100 (bg-purple-100)
                    textColor: '#6b21a8'          // purple-800 (text-purple-800)
                }
            };

            const colors = categoryStyles[leave.category] || {
                backgroundColor: '#f3f4f6',  // gray-100 fallback
                textColor: '#6b7280'          // gray-600 fallback
            };
            
            // Category titles
            const title = leave.category === 'szabadsag' ? 'Szabadság' :
                         leave.category === 'betegszabadsag' ? 'Betegszabadság' :
                         leave.category === 'tappenzt' ? 'Táppénz' : 'Egyéb távollét';
            
            // Format dates - ensure they're in YYYY-MM-DD format
            const startDate = new Date(leave.start_date);
            const endDate = new Date(leave.end_date);
            endDate.setDate(endDate.getDate() + 1); // Add day because FullCalendar end is exclusive
            
            return {
                id: leave.id ? leave.id.toString() : Math.random().toString(),
                title: title,
                start: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
                end: endDate.toISOString().split('T')[0],     // YYYY-MM-DD format
                allDay: true,
                backgroundColor: colors.backgroundColor,
                borderColor: 'transparent',  // No border
                borderWidth: 0,
                textColor: colors.textColor,
                classNames: ['calendar-event-pill'], // Custom class for styling
                extendedProps: {
                    status: leave.status,
                    category: leave.category,
                    days_requested: leave.days_requested,
                    reason: leave.reason,
                },
            };
        }).filter(event => event !== null);
    }, [leaves]);

    const handleEventClick = (info) => {
        window.location.href = `/szabadsagok/${info.event.id}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Saját szabadság kérelmek" />
            <PageContainer>
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Saját szabadság kérelmek</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Elérhető szabadság napok: <span className="font-medium text-green-600">{user.remaining_leaves_current_year}</span>
                                <span className="text-gray-500 ml-2">(függőben lévő napok már levonva)</span>
                            </p>
                        </div>
                        {user.remaining_leaves_current_year > 0 ? (
                            <Link
                                href={route('szabadsag.igenyles')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Új szabadság igénylés
                            </Link>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                                title="Nincs elérhető szabadság napod"
                            >
                                Új szabadság igénylés
                            </button>
                        )}
                    </div>

                    {/* Calendar */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={calendarEvents}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            eventClick={handleEventClick}
                            height="auto"
                            eventDisplay="block"
                            buttonText={{
                                today: 'Ma',
                                month: 'Hónap',
                                week: 'Hét',
                                day: 'Nap'
                            }}
                            weekends={true}
                            firstDay={1}
                            navLinks={true}
                            dayMaxEvents={3}
                            moreLinkClick="popover"
                            eventMouseEnter={(info) => {
                                info.el.style.cursor = 'pointer';
                            }}
                            locale={{
                                code: 'hu',
                                week: {
                                    dow: 1,
                                    doy: 4
                                },
                                buttonText: {
                                    prev: 'Előző',
                                    next: 'Következő',
                                    today: 'Ma',
                                    month: 'Hónap',
                                    week: 'Hét',
                                    day: 'Nap'
                                },
                                weekText: 'Hét',
                                allDayText: 'Egész nap',
                                moreLinkText: 'további',
                                noEventsText: 'Nincsenek események',
                                dayNames: ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'],
                                dayNamesShort: ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'],
                                dayNamesMin: ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'],
                                monthNames: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'],
                                monthNamesShort: ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sze', 'Okt', 'Nov', 'Dec']
                            }}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4">
                                <div className="lg:col-span-2">
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategória
                                    </label>
                                    <select
                                        id="category"
                                        value={category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="">Összes</option>
                                        <option value="szabadsag">Szabadság</option>
                                        <option value="betegszabadsag">Betegszabadság</option>
                                        <option value="tappenzt">Táppénz</option>
                                        <option value="egyeb_tavollet">Egyéb távollét</option>
                                    </select>
                                </div>

                                <div className="lg:col-span-2">
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Állapot
                                    </label>
                                    <select
                                        id="status"
                                        value={status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="">Összes</option>
                                        <option value="pending">Függőben</option>
                                        <option value="approved">Jóváhagyva</option>
                                        <option value="rejected">Elutasítva</option>
                                        <option value="cancelled">Érvénytelenítve</option>
                                    </select>
                                </div>

                                <div className="lg:col-span-2">
                                    <label htmlFor="start_date_from" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tól
                                    </label>
                                    <input
                                        type="date"
                                        id="start_date_from"
                                        value={startDateFrom}
                                        onChange={(e) => handleFilterChange('start_date_from', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>

                                <div className="lg:col-span-2">
                                    <label htmlFor="start_date_to" className="block text-sm font-medium text-gray-700 mb-1">
                                        Ig
                                    </label>
                                    <input
                                        type="date"
                                        id="start_date_to"
                                        value={startDateTo}
                                        onChange={(e) => handleFilterChange('start_date_to', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>

                                <div className="lg:col-span-2 flex items-end">
                                    <button
                                        type="button"
                                        onClick={handleExport}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Export
                                    </button>
                                </div>
                            </div>
                            
                            {/* Clear filters button */}
                            {(status || category || startDateFrom || startDateTo || createdFrom || createdTo) && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                                    >
                                        Összes szűrő törlése
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {leaves.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nincs szabadság kérésed</h3>
                                    <p className="mt-1 text-sm text-gray-500">Kezdj el egy új szabadság kérést.</p>
                                    <div className="mt-6">
                                        {user.remaining_leaves_current_year > 0 ? (
                                            <Link
                                                href={route('szabadsag.igenyles')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Új szabadság igénylés
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-600 bg-gray-300 cursor-not-allowed"
                                                title="Nincs elérhető szabadság napod"
                                            >
                                                Új szabadság igénylés
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Időszak
                                            </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kategória
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Napok száma
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Állapot
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
                                        {leaves.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        leave.category === 'szabadsag' ? 'bg-blue-100 text-blue-800' :
                                                        leave.category === 'betegszabadsag' ? 'bg-orange-100 text-orange-800' :
                                                        leave.category === 'tappenzt' ? 'bg-red-100 text-red-800' :
                                                        'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {leave.category === 'szabadsag' ? 'Szabadság' :
                                                         leave.category === 'betegszabadsag' ? 'Betegszabadság' :
                                                         leave.category === 'tappenzt' ? 'Táppénz' :
                                                         'Egyéb távollét'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {leave.days_requested} nap
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(leave.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(leave.created_at)}
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
                        )}
                    </div>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
