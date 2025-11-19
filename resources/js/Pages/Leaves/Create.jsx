import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Create({ user, isCreatingForOther = false }) {
    const { data, setData, post, processing, errors } = useForm({
        start_date: '',
        end_date: '',
        reason: '',
        user_id: isCreatingForOther ? user.id : null,
    });

    const [calculatedDays, setCalculatedDays] = useState(0);

    const calculateWeekdays = (startDate, endDate) => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // Check if end date is before start date
            if (end < start) {
                setCalculatedDays(0);
                return 0;
            }
            
            // Count weekdays (Monday-Friday) only, excluding weekends
            let weekdays = 0;
            const current = new Date(start);
            
            while (current <= end) {
                const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                // Count only Monday (1) through Friday (5)
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    weekdays++;
                }
                current.setDate(current.getDate() + 1);
            }
            
            setCalculatedDays(weekdays);
            return weekdays;
        }
        return 0;
    };

    const calculateDays = calculateWeekdays;

    // Find end date that gives us the specified number of weekdays starting from startDate
    const findEndDateForWeekdays = (startDate, targetWeekdays) => {
        if (!startDate || targetWeekdays <= 0) {
            return null;
        }
        
        const start = new Date(startDate);
        let weekdays = 0;
        const current = new Date(start);
        
        // Count weekdays until we reach the target
        while (weekdays < targetWeekdays) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                weekdays++;
            }
            if (weekdays < targetWeekdays) {
                current.setDate(current.getDate() + 1);
            }
        }
        
        return current.toISOString().split('T')[0];
    };

    const handleStartDateChange = (e) => {
        const newStart = e.target.value;
        const { start_date: prevStart, end_date: prevEnd } = data;

        // Compute previous duration if both dates existed and valid (weekdays only)
        let preservedWeekdays = 0;
        if (prevStart && prevEnd) {
            preservedWeekdays = calculateWeekdays(prevStart, prevEnd);
        }

        // Update start date first
        setData('start_date', newStart);

        // If no previous end, just recalc and return
        if (!prevEnd) {
            calculateDays(newStart, prevEnd);
            return;
        }

        // If new start is after current end, auto-shift end to preserve weekday count
        const newStartDate = new Date(newStart);
        const currentEndDate = new Date(prevEnd);

        if (currentEndDate < newStartDate) {
            // If we had a valid preservedWeekdays, find end date with same weekday count
            if (preservedWeekdays > 0) {
                const adjustedEndStr = findEndDateForWeekdays(newStart, preservedWeekdays);
                if (adjustedEndStr) {
                    setData('end_date', adjustedEndStr);
                    calculateDays(newStart, adjustedEndStr);
                    return;
                }
            }
            // Default to 1 weekday if no previous duration
            const defaultEndStr = findEndDateForWeekdays(newStart, 1);
            if (defaultEndStr) {
                setData('end_date', defaultEndStr);
                calculateDays(newStart, defaultEndStr);
            }
        } else {
            // End still valid, just recalc
            calculateDays(newStart, prevEnd);
        }
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
    const hasValidDates = data.start_date && data.end_date && calculatedDays > 0;
    
    // Check if dates are valid but only weekends are selected
    const isOnlyWeekends = data.start_date && data.end_date && calculatedDays === 0 && 
        new Date(data.end_date) >= new Date(data.start_date);

    return (
        <AuthenticatedLayout>
            <Head title={isCreatingForOther ? `Szabadság kiírása - ${user.name}` : "Új szabadság igénylés"} />
            <PageContainer>
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isCreatingForOther ? `Szabadság kiírása - ${user.name}` : "Új szabadság igénylés"}
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            {isCreatingForOther ? (
                                <>
                                    Szabadság kiírása <Link href={route('felhasznalok.show', user.id)} className="font-medium text-blue-600 hover:text-blue-800">{user.name}</Link> számára
                                    <br />
                                    Elérhető szabadság napok: <span className="font-medium text-green-600">{user.remaining_leaves_current_year}</span>
                                    <span className="text-gray-500 ml-2">(függőben lévő napok már levonva)</span>
                                </>
                            ) : (
                                <>
                                    Elérhető szabadság napok: <span className="font-medium text-green-600">{user.remaining_leaves_current_year}</span>
                                    <span className="text-gray-500 ml-2">(függőben lévő napok már levonva)</span>
                                </>
                            )}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        {user.remaining_leaves_current_year === 0 && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Nem tudsz új szabadság kérést benyújtani
                                        </h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>Elfogytak az elérhető szabadság napjaid erre az évre.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                        disabled={user.remaining_leaves_current_year === 0}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                            errors.start_date ? 'border-red-300' : 'border-gray-300'
                                        } ${user.remaining_leaves_current_year === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        required
                                    />
                                    {errors.start_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="end_date" className={`block text-sm font-medium mb-2 ${
                                        !data.start_date ? 'text-gray-400' : 'text-gray-700'
                                    }`}>
                                        Befejező dátum *
                                    </label>
                                    <input
                                        type="date"
                                        id="end_date"
                                        value={data.end_date}
                                        onChange={handleEndDateChange}
                                        min={data.start_date || new Date().toISOString().split('T')[0]}
                                        disabled={!data.start_date || user.remaining_leaves_current_year === 0}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                            errors.end_date ? 'border-red-300' : 'border-gray-300'
                                        } ${(!data.start_date || user.remaining_leaves_current_year === 0) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        required
                                    />
                                    {errors.end_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                                    )}
                                </div>
                            </div>

                            {data.start_date && data.end_date && user.remaining_leaves_current_year > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                    {calculatedDays > 0 ? (
                                        <>
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
                                        </>
                                    ) : isOnlyWeekends ? (
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-sm text-red-600">
                                                A szabadságigénylés nem lehet csak hétvége. Kérjük, valós intervallumot adjon meg.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-sm text-red-600">
                                                A befejező dátum nem lehet korábbi, mint a kezdő dátum.
                                            </p>
                                        </div>
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
                                    disabled={user.remaining_leaves_current_year === 0}
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                        errors.reason ? 'border-red-300' : 'border-gray-300'
                                    } ${user.remaining_leaves_current_year === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                                    disabled={processing || !canRequestLeave || !hasValidDates || user.remaining_leaves_current_year === 0}
                                    className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                        processing || !canRequestLeave || !hasValidDates || user.remaining_leaves_current_year === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                                >
                                    {processing ? (isCreatingForOther ? 'Kiírás...' : 'Benyújtás...') : (isCreatingForOther ? 'Szabadság kiírása' : 'Szabadság igénylése')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
