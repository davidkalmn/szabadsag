import React from 'react';

export default function LeaveHistory({ history }) {
    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('hu-HU');
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'submitted':
                return (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                );
            case 'approved':
                return (
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case 'cancelled':
                return (
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'created_for_user':
                return (
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'submitted':
                return 'text-blue-600';
            case 'approved':
                return 'text-green-600';
            case 'rejected':
                return 'text-red-600';
            case 'cancelled':
                return 'text-gray-600';
            case 'created_for_user':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    const getActionMessage = (action) => {
        switch (action) {
            case 'submitted':
                return 'Kérelem benyújtva';
            case 'approved':
                return 'Kérelem jóváhagyva';
            case 'rejected':
                return 'Kérelem elutasítva';
            case 'cancelled':
                return 'Kérelem érvénytelenítve';
            case 'created_for_user':
                return 'Szabadság kiírva';
            default:
                return 'Ismeretlen művelet';
        }
    };

    if (!history || history.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Kérelem története</h3>
                </div>
                <div className="px-6 py-4">
                    <p className="text-sm text-gray-500">Nincs történeti adat elérhető.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Kérelem története</h3>
            </div>
            <div className="px-6 py-4">
                <div className="flow-root">
                    <ul className="-mb-8">
                        {history.map((entry, index) => (
                            <li key={entry.id}>
                                <div className="relative pb-8">
                                    {index !== history.length - 1 && (
                                        <span className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                    )}
                                    <div className="relative flex space-x-3">
                                        {getActionIcon(entry.action)}
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className={`text-sm font-medium ${getActionColor(entry.action)}`}>
                                                    {getActionMessage(entry.action)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {entry.user.name}
                                                </p>
                                                {entry.notes && (
                                                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                                                        {entry.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                {formatDateTime(entry.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
