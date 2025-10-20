import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, Link } from '@inertiajs/react';

export default function Index({ leaves, user }) {
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

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Szabadság kérelmek listája</h3>
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
