import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function TeamLeaves({ leaves, user, filters = {}, subordinates = [] }) {
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    
    const [status, setStatus] = useState(filters.status || '');
    const [category, setCategory] = useState(filters.category || '');
    const [userId, setUserId] = useState(filters.user_id || '');
    const [startDateFrom, setStartDateFrom] = useState(filters.start_date_from || '');
    const [startDateTo, setStartDateTo] = useState(filters.start_date_to || '');
    const [createdFrom, setCreatedFrom] = useState(filters.created_from || '');
    const [createdTo, setCreatedTo] = useState(filters.created_to || '');

    const handleFilterChange = (filterType, value) => {
        const newFilters = {
            status: status,
            category: category,
            user_id: userId,
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
        } else if (filterType === 'user_id') {
            newFilters.user_id = value;
            setUserId(value);
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

        router.get(route('szabadsag.kerelmek'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setStatus('');
        setCategory('');
        setUserId('');
        setStartDateFrom('');
        setStartDateTo('');
        setCreatedFrom('');
        setCreatedTo('');
        router.get(route('szabadsag.kerelmek'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const { data: approvalData, setData: setApprovalData, post: postApproval, processing: approving } = useForm({
        review_notes: ''
    });

    const { data: rejectionData, setData: setRejectionData, post: postRejection, processing: rejecting } = useForm({
        review_notes: ''
    });

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

    // Format leaves for FullCalendar - only show approved leaves
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
            const categoryStyles = {
                'szabadsag': {
                    backgroundColor: '#dbeafe',  // blue-100
                    textColor: '#1e40af'          // blue-800
                },
                'betegszabadsag': {
                    backgroundColor: '#ffedd5',  // orange-100
                    textColor: '#9a3412'          // orange-800
                },
                'tappenzt': {
                    backgroundColor: '#fee2e2',  // red-100
                    textColor: '#991b1b'          // red-800
                },
                'egyeb_tavollet': {
                    backgroundColor: '#f3e8ff',  // purple-100
                    textColor: '#6b21a8'          // purple-800
                }
            };

            const colors = categoryStyles[leave.category] || {
                backgroundColor: '#f3f4f6',
                textColor: '#6b7280'
            };
            
            const title = (leave.user?.name || '') + ' - ' + (
                leave.category === 'szabadsag' ? 'Szabadság' :
                leave.category === 'betegszabadsag' ? 'Betegszabadság' :
                leave.category === 'tappenzt' ? 'Táppénz' : 'Egyéb távollét'
            );
            
            const startDate = new Date(leave.start_date);
            const endDate = new Date(leave.end_date);
            endDate.setDate(endDate.getDate() + 1);
            
            return {
                id: leave.id ? leave.id.toString() : Math.random().toString(),
                title: title,
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
                allDay: true,
                backgroundColor: colors.backgroundColor,
                borderColor: 'transparent',
                borderWidth: 0,
                textColor: colors.textColor,
                classNames: ['calendar-event-pill'],
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

    const handleApprove = (leave) => {
        setSelectedLeave(leave);
        setApprovalData('review_notes', '');
        setShowApprovalModal(true);
    };

    const handleReject = (leave) => {
        setSelectedLeave(leave);
        setRejectionData('review_notes', '');
        setShowRejectionModal(true);
    };

    const submitApproval = () => {
        postApproval(route('szabadsag.approve', selectedLeave.id), {
            onSuccess: () => {
                setShowApprovalModal(false);
                setSelectedLeave(null);
            }
        });
    };

    const submitRejection = () => {
        postRejection(route('szabadsag.reject', selectedLeave.id), {
            onSuccess: () => {
                setShowRejectionModal(false);
                setSelectedLeave(null);
            }
        });
    };

    const pendingLeaves = leaves.filter(leave => leave.status === 'pending');
    const processedLeaves = leaves.filter(leave => leave.status !== 'pending');

    return (
        <AuthenticatedLayout>
            <Head title="Csapat szabadság kérelmek" />
            <PageContainer>
                <div>
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Csapat szabadság kérelmek</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Beosztottaid szabadság kérelmeinek kezelése
                        </p>
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

                    {/* Pending Leaves */}
                    {pendingLeaves.length > 0 && (
                        <div className="bg-white rounded-lg shadow mb-6">
                            <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Függőben lévő kérelmek ({pendingLeaves.length})
                                </h3>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Alkalmazott
                                            </th>
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
                                                Beküldve
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Műveletek
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {pendingLeaves.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {leave.user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(leave.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(leave)}
                                                        className="text-green-600 hover:text-green-900 font-medium"
                                                    >
                                                        Jóváhagyás
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(leave)}
                                                        className="text-red-600 hover:text-red-900 font-medium"
                                                    >
                                                        Elutasítás
                                                    </button>
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

                    {/* Processed Leaves */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4 mb-4">
                                <div className="lg:col-span-2">
                                    <label htmlFor="filter_user_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Alkalmazott
                                    </label>
                                    <select
                                        id="filter_user_id"
                                        value={userId}
                                        onChange={(e) => handleFilterChange('user_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="">Összes</option>
                                        {subordinates.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="lg:col-span-2">
                                    <label htmlFor="filter_category" className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategória
                                    </label>
                                    <select
                                        id="filter_category"
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
                                    <label htmlFor="filter_status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Állapot
                                    </label>
                                    <select
                                        id="filter_status"
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
                                    <label htmlFor="filter_start_date_from" className="block text-sm font-medium text-gray-700 mb-1">
                                        Szabadság kezdete (tól)
                                    </label>
                                    <input
                                        type="date"
                                        id="filter_start_date_from"
                                        value={startDateFrom}
                                        onChange={(e) => handleFilterChange('start_date_from', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>

                                <div className="lg:col-span-2">
                                    <label htmlFor="filter_start_date_to" className="block text-sm font-medium text-gray-700 mb-1">
                                        Szabadság vége (ig)
                                    </label>
                                    <input
                                        type="date"
                                        id="filter_start_date_to"
                                        value={startDateTo}
                                        onChange={(e) => handleFilterChange('start_date_to', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>
                            </div>
                            
                            {/* Clear filters button */}
                            {(status || category || userId || startDateFrom || startDateTo || createdFrom || createdTo) && (
                                <div className="mb-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                                    >
                                        Összes szűrő törlése
                                    </button>
                                </div>
                            )}
                            
                            <h3 className="text-lg font-medium text-gray-900">
                                Feldolgozott kérelmek ({processedLeaves.length})
                            </h3>
                        </div>
                        
                        {processedLeaves.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nincs feldolgozott kérelem</h3>
                                    <p className="mt-1 text-sm text-gray-500">Még nem dolgoztál fel szabadság kérelmeket.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Alkalmazott
                                            </th>
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
                                                Feldolgozva
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Műveletek
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {processedLeaves.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {leave.user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                                                    {leave.reviewed_at ? formatDate(leave.reviewed_at) : '-'}
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

                {/* Approval Modal */}
                {showApprovalModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Szabadság kérés jóváhagyása</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    <strong>{selectedLeave?.user.name}</strong> szabadság kérése: {selectedLeave?.days_requested} nap
                                    ({formatDate(selectedLeave?.start_date)} - {formatDate(selectedLeave?.end_date)})
                                </p>
                                
                                <div className="mb-4">
                                    <label htmlFor="approval_notes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Megjegyzés (opcionális)
                                    </label>
                                    <textarea
                                        id="approval_notes"
                                        value={approvalData.review_notes}
                                        onChange={(e) => setApprovalData('review_notes', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Jóváhagyási megjegyzés..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowApprovalModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Mégse
                                    </button>
                                    <button
                                        onClick={submitApproval}
                                        disabled={approving}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {approving ? 'Jóváhagyás...' : 'Jóváhagyás'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rejection Modal */}
                {showRejectionModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Szabadság kérés elutasítása</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    <strong>{selectedLeave?.user.name}</strong> szabadság kérése: {selectedLeave?.days_requested} nap
                                    ({formatDate(selectedLeave?.start_date)} - {formatDate(selectedLeave?.end_date)})
                                </p>
                                
                                <div className="mb-4">
                                    <label htmlFor="rejection_notes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Elutasítási indok *
                                    </label>
                                    <textarea
                                        id="rejection_notes"
                                        value={rejectionData.review_notes}
                                        onChange={(e) => setRejectionData('review_notes', e.target.value)}
                                        rows={3}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Add meg az elutasítási indokot..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowRejectionModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Mégse
                                    </button>
                                    <button
                                        onClick={submitRejection}
                                        disabled={rejecting || !rejectionData.review_notes.trim()}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {rejecting ? 'Elutasítás...' : 'Elutasítás'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </PageContainer>
        </AuthenticatedLayout>
    );
}
