import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function AllLeaves({ leaves, user }) {
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);

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
            <Head title="Összes szabadság kérelem" />
            <PageContainer>
                <div>
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Összes szabadság kérelem</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Az összes felhasználó szabadság kérelmeinek kezelése
                        </p>
                    </div>

                    {/* Statistics */}
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
                                    <p className="text-2xl font-semibold text-gray-900">{pendingLeaves.length}</p>
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
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {leaves.filter(leave => leave.status === 'approved').length}
                                    </p>
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
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {leaves.filter(leave => leave.status === 'rejected').length}
                                    </p>
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
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {leaves.filter(leave => leave.status === 'cancelled').length}
                                    </p>
                                </div>
                            </div>
                        </div>
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
                                                Menedzser
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Időszak
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
                                                    {leave.user.manager ? leave.user.manager.name : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
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

                    {/* All Leaves */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Összes kérelem ({leaves.length})
                            </h3>
                        </div>
                        
                        {leaves.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nincs szabadság kérelem</h3>
                                    <p className="mt-1 text-sm text-gray-500">Még nem nyújtottak be szabadság kérelmeket.</p>
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
                                                Menedzser
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Időszak
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
                                        {leaves.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {leave.user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {leave.user.manager ? leave.user.manager.name : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
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
                                                    {leave.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(leave)}
                                                                className="text-green-600 hover:text-green-900 font-medium mr-2"
                                                            >
                                                                Jóváhagyás
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(leave)}
                                                                className="text-red-600 hover:text-red-900 font-medium mr-2"
                                                            >
                                                                Elutasítás
                                                            </button>
                                                        </>
                                                    )}
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
