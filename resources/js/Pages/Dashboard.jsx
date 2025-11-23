import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

export default function Dashboard({ role, statistics, calendarLeaves = [], notifications = [], activityLogs = [] }) {
    const { auth } = usePage().props;
    const currentUser = auth.user;
    
    // Check role from both currentUser and role prop (needed for calendar title formatting)
    const userRole = currentUser?.role || role;
    const isAdmin = userRole === 'admin';
    const isManager = userRole === 'manager';
    const isTeacher = userRole === 'teacher';
    
    // Hungarian locale for FullCalendar
    const hungarianLocale = {
        code: 'hu',
        week: {
            dow: 1, // Monday is the first day
            doy: 4  // The week that contains Jan 4th is the first week
        },
        buttonText: {
            prev: 'Előző',
            next: 'Következő',
            today: 'Ma',
            month: 'Hónap',
            week: 'Hét',
            day: 'Nap'
        },
        allDayText: 'Egész nap',
        moreLinkText: 'további',
        noEventsText: 'Nincsenek események',
        weekText: 'Hét',
        dayNames: ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'],
        dayNamesShort: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
        monthNames: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sze', 'Okt', 'Nov', 'Dec']
    };

    // Format calendar leaves for FullCalendar
    const calendarEvents = useMemo(() => {
        if (!calendarLeaves || !Array.isArray(calendarLeaves) || calendarLeaves.length === 0) {
            return [];
        }

        return calendarLeaves.map(leave => {
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

            // For teachers (own dashboard), show only category name (like on their leaves page)
            // For admin/manager, show user name + category
            const categoryName = leave.category === 'szabadsag' ? 'Szabadság' :
                                leave.category === 'betegszabadsag' ? 'Betegszabadság' :
                                leave.category === 'tappenzt' ? 'Táppénz' : 'Egyéb távollét';
            
            const title = (isAdmin || isManager) && leave.user_name
                ? `${leave.user_name} - ${categoryName}`
                : categoryName;

            const startDate = new Date(leave.start_date);
            const endDate = new Date(leave.end_date);
            endDate.setDate(endDate.getDate() + 1);

            return {
                id: leave.id,
                title: title,
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
                allDay: true,
                backgroundColor: colors.backgroundColor,
                textColor: colors.textColor,
                borderColor: colors.backgroundColor,
                classNames: ['calendar-event-pill'],
                extendedProps: {
                    user_name: leave.user_name,
                    category: leave.category,
                    days_requested: leave.days_requested
                }
            };
        }).filter(event => event !== null);
    }, [calendarLeaves, isAdmin, isManager]);

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    
    // Ensure statistics has default values if not provided
    const defaultStatistics = {
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0
    };
    const dashboardStatistics = statistics || defaultStatistics;
    
    // Dashboard title and description based on role
    const dashboardTitle = isAdmin ? 'Dashboard' : (isManager ? 'Csapat Dashboard' : 'Dashboard');
    const dashboardDescription = isAdmin 
        ? 'Áttekintés az összes szabadság kérelemről és aktivitásról'
        : isManager
        ? 'Áttekintés a csapat szabadság kérvényeiről és aktivitásairól'
        : 'Áttekintés a saját szabadság kérvényeidről és aktivitásaidról';
    
    // Show dashboard for all roles (admin, manager, teacher)
    if (isAdmin || isManager || isTeacher) {
        return (
            <AuthenticatedLayout>
                <Head title="Dashboard" />
                <PageContainer>
                    <div>
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">{dashboardTitle}</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                {dashboardDescription}
                            </p>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Függőben</p>
                                        <p className="text-2xl font-semibold text-gray-900">{dashboardStatistics.pending}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Jóváhagyva</p>
                                        <p className="text-2xl font-semibold text-gray-900">{dashboardStatistics.approved}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Elutasítva</p>
                                        <p className="text-2xl font-semibold text-gray-900">{dashboardStatistics.rejected}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Érvénytelenítve</p>
                                        <p className="text-2xl font-semibold text-gray-900">{dashboardStatistics.cancelled}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calendar and Notifications Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" style={{ gridAutoRows: 'minmax(500px, auto)' }}>
                            {/* Calendar */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Havi naptár</h3>
                                <FullCalendar
                                    plugins={[dayGridPlugin]}
                                    initialView="dayGridMonth"
                                    events={calendarEvents}
                                    locale={hungarianLocale}
                                    headerToolbar={{
                                        left: 'prev,next',
                                        center: '',
                                        right: 'title'
                                    }}
                                    height="auto"
                                    fixedWeekCount={false}
                                />
                            </div>

                            {/* Notifications */}
                            <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Értesítések</h3>
                                    <Link
                                        href={route('ertesitesek.index')}
                                        className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                                    >
                                        Összes megtekintése
                                    </Link>
                                </div>
                                <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
                                    {notifications && notifications.length > 0 ? (
                                        notifications.map((notification) => {
                                            const getNotificationIcon = (type) => {
                                                switch (type) {
                                                    case 'leave_requested': return '⏳';
                                                    case 'leave_approved': return '✅';
                                                    case 'leave_rejected': return '❌';
                                                    case 'leave_cancelled': return '⛔';
                                                    case 'profile_updated': return '👤';
                                                    case 'password_changed': return '🔒';
                                                    case 'account_deleted':
                                                    case 'user_deactivated': return '🛑';
                                                    case 'user_created': return '👤';
                                                    case 'user_updated': return '✏️';
                                                    case 'user_deleted': return '🗑️';
                                                    case 'user_reactivated': return '✅';
                                                    case 'login': return '🔐';
                                                    case 'logout': return '🚪';
                                                    default: return '📢';
                                                }
                                            };
                                            
                                            const getNotificationColor = (type) => {
                                                switch (type) {
                                                    case 'leave_requested': return 'bg-yellow-100 text-yellow-600';
                                                    case 'user_reactivated':
                                                    case 'user_created':
                                                    case 'leave_approved': return 'bg-green-100 text-green-600';
                                                    case 'account_deleted':
                                                    case 'user_deactivated':
                                                    case 'user_deleted':
                                                    case 'leave_rejected': return 'bg-red-100 text-red-600';
                                                    case 'leave_cancelled': return 'bg-gray-100 text-gray-800';
                                                    case 'profile_updated':
                                                    case 'user_updated':
                                                    case 'password_changed': return 'bg-blue-100 text-blue-600';
                                                    case 'login': return 'bg-indigo-100 text-indigo-600';
                                                    case 'logout': return 'bg-gray-100 text-gray-600';
                                                    default: return 'bg-gray-100 text-gray-600';
                                                }
                                            };
                                            
                                            const getNotificationTypeLabel = (type) => {
                                                switch (type) {
                                                    case 'account_deleted':
                                                    case 'user_deactivated': return 'Fiók deaktiválva';
                                                    case 'leave_requested': return 'Szabadság kérvényezve';
                                                    case 'leave_approved': return 'Szabadság jóváhagyva';
                                                    case 'leave_rejected': return 'Szabadság elutasítva';
                                                    case 'leave_cancelled': return 'Szabadság érvénytelenítve';
                                                    case 'profile_updated': return 'Profil módosítva';
                                                    case 'password_changed': return 'Jelszó módosítva';
                                                    case 'user_created': return 'Felhasználó létrehozva';
                                                    case 'user_updated': return 'Felhasználó módosítva';
                                                    case 'user_deleted': return 'Felhasználó törölve';
                                                    case 'user_reactivated': return 'Fiók újraaktiválva';
                                                    case 'login': return 'Bejelentkezés';
                                                    case 'logout': return 'Kijelentkezés';
                                                    default: return type;
                                                }
                                            };
                                            
                                            return (
                                                <div
                                                    key={notification.id}
                                                    className={`px-3 py-3 ${!notification.read_at ? 'bg-blue-50' : ''}`}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <div className="flex-shrink-0">
                                                            <span className="text-lg">
                                                                {getNotificationIcon(notification.type)}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2 flex-wrap">
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
                                                                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                                    {notification.formatted_created_at || formatDateTime(notification.created_at)}
                                                                </span>
                                                            </div>
                                                            <p className="mt-2 text-sm text-gray-600">
                                                                {notification.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-6 py-12 text-center">
                                            <p className="text-gray-500">Még nincsenek értesítések.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Activity Logs */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Legutóbbi aktivitások</h3>
                                <Link
                                    href={route('naplo.index')}
                                    className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                                >
                                    Összes megtekintése
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {activityLogs && activityLogs.length > 0 ? (
                                    activityLogs.map((log) => {
                                        const getActionIcon = (action) => {
                                            switch (action) {
                                                case 'user_created': return '👤';
                                                case 'user_updated': return '✏️';
                                                case 'user_deactivated': return '🚫';
                                                case 'user_reactivated': return '✅';
                                                case 'login': return '🔐';
                                                case 'logout': return '🚪';
                                                case 'profile_updated': return '👤';
                                                case 'password_changed': return '🔒';
                                                case 'leave_requested': return '📅';
                                                case 'leave_approved': return '✅';
                                                case 'leave_rejected': return '❌';
                                                case 'leave_cancelled': return '🚫';
                                                case 'created_for_user': return '👤';
                                                default: return '📝';
                                            }
                                        };
                                        
                                        const getActionColor = (action) => {
                                            switch (action) {
                                                case 'user_created': return 'text-green-600 bg-green-100';
                                                case 'user_updated': return 'text-blue-600 bg-blue-100';
                                                case 'user_deactivated': return 'text-red-600 bg-red-100';
                                                case 'user_reactivated': return 'text-green-600 bg-green-100';
                                                case 'login': return 'text-gray-400 bg-gray-100';
                                                case 'logout': return 'text-gray-400 bg-gray-100';
                                                case 'profile_updated': return 'text-blue-600 bg-blue-100';
                                                case 'password_changed': return 'text-blue-600 bg-blue-100';
                                                case 'leave_requested': return 'text-yellow-600 bg-yellow-100';
                                                case 'leave_approved': return 'text-green-600 bg-green-100';
                                                case 'leave_rejected': return 'text-red-600 bg-red-100';
                                                case 'leave_cancelled': return 'text-black bg-gray-200';
                                                case 'created_for_user': return 'text-blue-600 bg-blue-100';
                                                default: return 'text-gray-600 bg-gray-100';
                                            }
                                        };
                                        
                                        const getActionLabel = (action) => {
                                            switch (action) {
                                                case 'user_created': return 'Felhasználó létrehozva';
                                                case 'user_updated': return 'Felhasználó módosítva';
                                                case 'user_deactivated': return 'Felhasználó deaktiválva';
                                                case 'user_reactivated': return 'Felhasználó újraaktiválva';
                                                case 'login': return 'Bejelentkezés';
                                                case 'logout': return 'Kijelentkezés';
                                                case 'profile_updated': return 'Profil módosítva';
                                                case 'password_changed': return 'Jelszó módosítva';
                                                case 'leave_requested': return 'Szabadság kérés benyújtva';
                                                case 'leave_approved': return 'Szabadság kérés jóváhagyva';
                                                case 'leave_rejected': return 'Szabadság kérés elutasítva';
                                                case 'leave_cancelled': return 'Szabadság kérés érvénytelenítve';
                                                case 'created_for_user': return 'Szabadság kérés létrehozva másnak';
                                                default: return action;
                                            }
                                        };
                                        
                                        return (
                                            <div key={log.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <span className="text-lg">
                                                            {getActionIcon(log.action)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2 flex-wrap">
                                                                <span className="text-sm text-gray-900">
                                                                    {log.user?.name || log.user_name || 'Ismeretlen'}
                                                                </span>
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                                                                    {getActionLabel(log.action)}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                                {log.formatted_created_at || formatDateTime(log.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-gray-600">
                                                            {log.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-6 py-12 text-center">
                                        <p className="text-gray-500">Még nincsenek naplóbejegyzések.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </PageContainer>
            </AuthenticatedLayout>
        );
    }

    // Default dashboard for other roles (placeholder)
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <PageContainer>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Üdvözöljük, {currentUser?.name}!
                    </p>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
