import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Create({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        start_date: '',
        end_date: '',
        reason: '',
    });

    const [calculatedDays, setCalculatedDays] = useState(0);

    const calculateDays = (startDate, endDate) => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
            setCalculatedDays(diffDays);
            return diffDays;
        }
        return 0;
    };

    const handleStartDateChange = (e) => {
        const value = e.target.value;
        setData('start_date', value);
        calculateDays(value, data.end_date);
    };

    const handleEndDateChange = (e) => {
        const value = e.target.value;
        setData('end_date', value);
        calculateDays(data.start_date, value);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('szabadsag.store'));
    };

    const canRequestLeave = calculatedDays <= user.remaining_leaves_current_year;

    return (
        <AuthenticatedLayout>
            <Head title="Új szabadság igénylés" />
            <PageContainer>
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Új szabadság igénylés</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Elérhető szabadság napok: <span className="font-medium text-green-600">{user.remaining_leaves_current_year}</span>
                            <span className="text-gray-500 ml-2">(függőben lévő napok már levonva)</span>
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        {/* General Error Messages */}
                        {(errors.days || errors.dates) && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Szabadság igénylés sikertelen
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            {errors.days && <p>{errors.days}</p>}
                                            {errors.dates && <p>{errors.dates}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                                        Kezdő dátum *
                                    </label>
                                    <input
                                        type="date"
                                        id="start_date"
                                        value={data.start_date}
                                        onChange={handleStartDateChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                            errors.start_date ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {errors.start_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                                        Befejező dátum *
                                    </label>
                                    <input
                                        type="date"
                                        id="end_date"
                                        value={data.end_date}
                                        onChange={handleEndDateChange}
                                        min={data.start_date || new Date().toISOString().split('T')[0]}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                            errors.end_date ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {errors.end_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                                    )}
                                </div>
                            </div>

                            {calculatedDays > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Kért napok száma:</span>
                                        <span className={`text-lg font-bold ${
                                            canRequestLeave ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {calculatedDays} nap
                                        </span>
                                    </div>
                                    {!canRequestLeave && (
                                        <p className="mt-2 text-sm text-red-600">
                                            Nincs elég szabadság napod. Maradék napok: {user.remaining_leaves_current_year}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="mt-6">
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                    Indoklás (opcionális)
                                </label>
                                <textarea
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    rows={4}
                                    maxLength={1000}
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                        errors.reason ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Add meg a szabadság kérésed indoklását..."
                                />
                                <div className="mt-1 flex justify-between text-sm text-gray-500">
                                    <span>{errors.reason && <span className="text-red-600">{errors.reason}</span>}</span>
                                    <span>{data.reason.length}/1000</span>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end space-x-4">
                                <a
                                    href={route('szabadsag.sajat-kerelmek')}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Mégse
                                </a>
                                <button
                                    type="submit"
                                    disabled={processing || !canRequestLeave || calculatedDays === 0}
                                    className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                        processing || !canRequestLeave || calculatedDays === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                                >
                                    {processing ? 'Benyújtás...' : 'Szabadság igénylése'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
