import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ leave, user }) {
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Determine if user is viewing their own leave
    const isOwnLeave = leave.user_id === user.id;
    
    // Determine the appropriate back route based on user role and context
    const getBackRoute = () => {
        if (isOwnLeave) {
            return route('szabadsag.sajat-kerelmek');
        }
        
        // If viewing someone else's leave, redirect based on role
        if (user.role === 'admin') {
            return route('szabadsag.osszes-kerelem');
        } else if (user.role === 'manager') {
            return route('szabadsag.kerelmek');
        }
        
        // Fallback
        return route('szabadsag.sajat-kerelmek');
    };

    const { data: approvalData, setData: setApprovalData, post: postApproval, processing: approving } = useForm({
        review_notes: ''
    });

    const { data: rejectionData, setData: setRejectionData, post: postRejection, processing: rejecting } = useForm({
        review_notes: ''
    });

    const { data: cancelData, setData: setCancelData, post: postCancel, processing: cancelling } = useForm({
        review_notes: ''
    });

    const handleApprove = () => {
        setApprovalData('review_notes', '');
        setShowApprovalModal(true);
    };

    const handleReject = () => {
        setRejectionData('review_notes', '');
        setShowRejectionModal(true);
    };

    const handleCancel = () => {
        setCancelData('review_notes', '');
        setShowCancelModal(true);
    };

    const submitApproval = () => {
        postApproval(route('szabadsag.approve', leave.id), {
            onSuccess: () => {
                setShowApprovalModal(false);
                // Redirect to appropriate page based on context
                window.location.href = getBackRoute();
            }
        });
    };

    const submitRejection = () => {
        postRejection(route('szabadsag.reject', leave.id), {
            onSuccess: () => {
                setShowRejectionModal(false);
                // Redirect to appropriate page based on context
                window.location.href = getBackRoute();
            }
        });
    };

    const submitCancel = () => {
        postCancel(route('szabadsag.cancel', leave.id), {
            onSuccess: () => {
                setShowCancelModal(false);
                // Redirect to appropriate page based on context
                window.location.href = getBackRoute();
            }
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
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${config.className}`}>
                {config.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('hu-HU');
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('hu-HU');
    };

    const canApprove = user.role === 'admin' || (user.role === 'manager' && leave.user.manager_id === user.id);

    return (
        <AuthenticatedLayout>
            <Head title="Szabadság kérés részletei" />
            <PageContainer>
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Szabadság kérés részletei</h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Kérelem #{leave.id} - {getStatusBadge(leave.status)}
                                </p>
                            </div>
                            <Link
                                href={getBackRoute()}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Vissza
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Details */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Kérelem részletei</h3>
                                </div>
                                <div className="px-6 py-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Alkalmazott</label>
                                            <p className="mt-1 text-sm text-gray-900">{leave.user.name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Menedzser</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {leave.user.manager ? leave.user.manager.name : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Kezdő dátum</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatDate(leave.start_date)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Befejező dátum</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatDate(leave.end_date)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Napok száma</label>
                                            <p className="mt-1 text-sm text-gray-900">{leave.days_requested} nap</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Beküldve</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatDateTime(leave.created_at)}</p>
                                        </div>
                                    </div>

                                    {leave.reason && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Indoklás</label>
                                            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{leave.reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Review Details */}
                            {leave.status !== 'pending' && (
                                <div className="bg-white rounded-lg shadow mt-6">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">Feldolgozás részletei</h3>
                                    </div>
                                    <div className="px-6 py-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Feldolgozva</label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {leave.reviewed_at ? formatDateTime(leave.reviewed_at) : '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Feldolgozta</label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {leave.reviewer ? leave.reviewer.name : '-'}
                                                </p>
                                            </div>
                                        </div>

                                        {leave.review_notes && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    {leave.status === 'approved' ? 'Jóváhagyási megjegyzés' : 'Elutasítási indok'}
                                                </label>
                                                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{leave.review_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Műveletek</h3>
                                </div>
                                <div className="px-6 py-4 space-y-4">
                                    {leave.status === 'pending' && canApprove && (
                                        <>
                                            <button
                                                onClick={handleApprove}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Jóváhagyás
                                            </button>
                                            <button
                                                onClick={handleReject}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Elutasítás
                                            </button>
                                        </>
                                    )}

                                    {leave.status === 'pending' && !canApprove && (
                                        <p className="text-sm text-gray-500 text-center">
                                            Ez a kérelem függőben van, várja a menedzser jóváhagyását.
                                        </p>
                                    )}

                                    {leave.status === 'approved' && (
                                        <>
                                            <div className="text-center mb-4">
                                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Jóváhagyva
                                                </div>
                                            </div>
                                            
                                            {/* Cancel button for managers/admins */}
                                            {canApprove && (
                                                <button
                                                    onClick={handleCancel}
                                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    Érvénytelenítés
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {leave.status === 'rejected' && (
                                        <div className="text-center">
                                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                Elutasítva
                                            </div>
                                        </div>
                                    )}

                                    {leave.status === 'cancelled' && (
                                        <div className="text-center">
                                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                Érvénytelenítve
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-white rounded-lg shadow mt-6">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Gyors információk</h3>
                                </div>
                                <div className="px-6 py-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Kért napok:</span>
                                        <span className="text-sm font-medium text-gray-900">{leave.days_requested}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Kérelem ID:</span>
                                        <span className="text-sm font-medium text-gray-900">#{leave.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Státusz:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {leave.status === 'pending' ? 'Függőben' : 
                                             leave.status === 'approved' ? 'Jóváhagyva' : 'Elutasítva'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Approval Modal */}
                {showApprovalModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Szabadság kérés jóváhagyása</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    <strong>{leave.user.name}</strong> szabadság kérése: {leave.days_requested} nap
                                    ({formatDate(leave.start_date)} - {formatDate(leave.end_date)})
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
                                    <strong>{leave.user.name}</strong> szabadság kérése: {leave.days_requested} nap
                                    ({formatDate(leave.start_date)} - {formatDate(leave.end_date)})
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

                {/* Cancel Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Szabadság kérés érvénytelenítése</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    <strong>{leave.user.name}</strong> szabadság kérése: {leave.days_requested} nap
                                    ({formatDate(leave.start_date)} - {formatDate(leave.end_date)})
                                </p>
                                
                                <div className="mb-4">
                                    <label htmlFor="cancel_notes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Érvénytelenítési indok *
                                    </label>
                                    <textarea
                                        id="cancel_notes"
                                        value={cancelData.review_notes}
                                        onChange={(e) => setCancelData('review_notes', e.target.value)}
                                        rows={3}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Add meg az érvénytelenítési indokot..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Mégse
                                    </button>
                                    <button
                                        onClick={submitCancel}
                                        disabled={cancelling || !cancelData.review_notes.trim()}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                                    >
                                        {cancelling ? 'Érvénytelenítés...' : 'Érvénytelenítés'}
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
