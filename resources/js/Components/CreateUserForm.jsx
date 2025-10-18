import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function CreateUserForm({ users, currentUserRole }) {
    const [showForm, setShowForm] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'teacher',
        manager_id: '',
        total_leave_days: 25,
    });

    // Determine allowed roles based on current user's role
    const getAllowedRoles = () => {
        if (currentUserRole === 'admin') {
            return [
                { value: 'teacher', label: 'Tanár' },
                { value: 'manager', label: 'Menedzser' },
                { value: 'admin', label: 'Admin' }
            ];
        } else if (currentUserRole === 'manager') {
            return [
                { value: 'teacher', label: 'Tanár' },
                { value: 'manager', label: 'Menedzser' }
            ];
        }
        return [];
    };

    // Get available managers (managers and admins, excluding teachers)
    const getAvailableManagers = () => {
        if (currentUserRole === 'admin') {
            return users.filter(user => ['manager', 'admin'].includes(user.role));
        } else if (currentUserRole === 'manager') {
            return users.filter(user => ['manager', 'admin'].includes(user.role));
        }
        return [];
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('felhasznalok.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Felhasználók</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    {showForm ? 'Mégse' : 'Új felhasználó'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Új felhasználó hozzáadása</h3>
                    
                    <form onSubmit={submit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Név" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Jelszó" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Jelszó megerősítése" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
                            </div>

                            <div>
                                <InputLabel htmlFor="role" value="Szerepkör" />
                                <select
                                    id="role"
                                    name="role"
                                    value={data.role}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    onChange={(e) => setData('role', e.target.value)}
                                    required
                                >
                                    {getAllowedRoles().map(role => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                            </div>

                            <div>
                                <InputLabel htmlFor="manager_id" value="Menedzser" />
                                <select
                                    id="manager_id"
                                    name="manager_id"
                                    value={data.manager_id}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    onChange={(e) => setData('manager_id', e.target.value)}
                                >
                                    <option value="">Válassz menedzsert</option>
                                    {getAvailableManagers().map(manager => (
                                        <option key={manager.id} value={manager.id}>
                                            {manager.name} ({manager.role === 'teacher' ? 'Tanár' : manager.role === 'manager' ? 'Menedzser' : 'Admin'})
                                        </option>
                                    ))}
                                </select>
                                {errors.manager_id && <p className="text-red-500 text-sm mt-1">{errors.manager_id}</p>}
                            </div>

                            <div>
                                <InputLabel htmlFor="total_leave_days" value="Szabadság napok száma" />
                                <TextInput
                                    id="total_leave_days"
                                    type="number"
                                    name="total_leave_days"
                                    value={data.total_leave_days}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('total_leave_days', parseInt(e.target.value))}
                                    min="1"
                                    max="50"
                                    required
                                />
                                {errors.total_leave_days && <p className="text-red-500 text-sm mt-1">{errors.total_leave_days}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <PrimaryButton disabled={processing}>
                                Felhasználó létrehozása
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
