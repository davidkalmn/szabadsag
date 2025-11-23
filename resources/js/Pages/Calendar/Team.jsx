import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Team({ events = [], user }) {
    const calendarEvents = useMemo(() => {
        if (!events || !Array.isArray(events) || events.length === 0) {
            console.log('Calendar Team - No events found:', events);
            return [];
        }
        
        const formatted = events.map(event => {
            if (!event.start || !event.end) {
                console.warn('Event missing start or end date:', event);
                return null;
            }
            
            return {
                id: event.id ? event.id.toString() : Math.random().toString(),
                title: event.title || 'Szabadság',
                start: event.start,
                end: event.end,
                allDay: true,
                backgroundColor: event.color || '#3b82f6',
                borderColor: event.color || '#3b82f6',
                textColor: '#ffffff',
                extendedProps: event.extendedProps || {},
            };
        }).filter(event => event !== null);
        
        console.log('Calendar Team - Formatted events:', formatted);
        console.log('Calendar Team - Raw events:', events);
        
        return formatted;
    }, [events]);

    const handleEventClick = (info) => {
        window.location.href = `/szabadsagok/${info.event.id}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Csapat naptár" />
            <PageContainer>
                <div>
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Csapat naptár</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Beosztottaid szabadság kérelmei naptár nézetben
                        </p>
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
                    <div className="bg-white rounded-lg shadow p-6">
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
                            eventTimeFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                meridiem: false
                            }}
                            buttonText={{
                                today: 'Ma',
                                month: 'Hónap',
                                week: 'Hét',
                                day: 'Nap'
                            }}
                            weekends={true}
                            firstDay={1} // Monday
                            navLinks={true}
                            dayMaxEvents={3}
                            moreLinkClick="popover"
                            eventMouseEnter={(info) => {
                                info.el.style.cursor = 'pointer';
                            }}
                        />
                    </div>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
