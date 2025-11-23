import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Mine({ leaves = [], events = [], user }) {
    // Debug: Log what we received
    console.log('Calendar Mine - Props:', { 
        leavesCount: Array.isArray(leaves) ? leaves.length : 'N/A',
        eventsCount: Array.isArray(events) ? events.length : 'N/A',
        hasLeaves: !!leaves,
        hasEvents: !!events,
        leavesValue: leaves,
        eventsValue: events
    });
    
    const calendarEvents = useMemo(() => {
        // Use leaves data to generate calendar events
        if (!leaves || !Array.isArray(leaves) || leaves.length === 0) {
            console.log('Calendar Mine - No leaves found, returning empty calendar events');
            return [];
        }
        
        console.log(`Calendar Mine - Processing ${leaves.length} leaves for calendar`);
        
        const formatted = leaves.map(leave => {
            if (!leave.start_date || !leave.end_date) {
                console.warn('Leave missing start or end date:', leave);
                return null;
            }
            
            const categoryColors = {
                'szabadsag': '#3b82f6',      // blue
                'betegszabadsag': '#f97316', // orange
                'tappenzt': '#ef4444',       // red
                'egyeb_tavollet': '#9333ea', // purple
            };

            const statusColors = {
                'pending': '#eab308',    // yellow
                'approved': '#22c55e',   // green
                'rejected': '#ef4444',   // red
                'cancelled': '#6b7280',  // gray
            };

            const color = statusColors[leave.status] || '#6b7280';
            
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
                backgroundColor: color,
                borderColor: color,
                textColor: '#ffffff',
                extendedProps: {
                    status: leave.status,
                    category: leave.category,
                    days_requested: leave.days_requested,
                    reason: leave.reason,
                },
            };
        }).filter(event => event !== null);
        
        console.log(`Calendar Mine - Formatted ${formatted.length} events from ${leaves.length} leaves`);
        if (formatted.length > 0) {
            console.log('Calendar Mine - First formatted event:', formatted[0]);
        }
        
        return formatted;
    }, [leaves]);
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('hu-HU');
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

    const handleEventClick = (info) => {
        window.location.href = `/szabadsagok/${info.event.id}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Saját naptár" />
            <PageContainer>
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Saját naptár</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Szabadság kérelmeid naptár nézetben
                            </p>
                        </div>
                        <Link
                            href={route('szabadsag.igenyles')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Új szabadság igénylés
                        </Link>
                    </div>

                    {/* Legend */}
                    <div className="bg-white rounded-lg shadow mb-6 p-4">
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
                                <span className="text-sm text-gray-700">Függőben</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                                <span className="text-sm text-gray-700">Jóváhagyva</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                                <span className="text-sm text-gray-700">Elutasítva</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }}></div>
                                <span className="text-sm text-gray-700">Érvénytelenítve</span>
                            </div>
                        </div>
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
                        />
                    </div>

                    {/* Leaves List - for debugging and verification */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Szabadság kérelmek listája</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Összesen: <span className="font-medium">{leaves.length}</span> kérelem
                            </p>
                        </div>
                        
                        {leaves.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nincs szabadság kérésed</h3>
                                    <p className="mt-1 text-sm text-gray-500">Kezdj el egy új szabadság kérést.</p>
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
