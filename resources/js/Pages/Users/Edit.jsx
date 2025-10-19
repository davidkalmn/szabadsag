import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Edit({ user, availableManagers, currentUser }) {
    const { data, setData, put, errors, processing } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        manager_id: user.manager_id,
        total_leave_days: user.total_leave_days,
    });

    const getRoleLabel = (role) => {
        switch (role) {
            case 'teacher': return 'Tanár';
            case 'manager': return 'Menedzser';
            case 'admin': return 'Admin';
            default: return role;
        }
    };

    const getAvailableRoles = () => {
        if (currentUser.role === 'admin') {
            return [
                { value: 'teacher', label: 'Tanár' },
                { value: 'manager', label: 'Menedzser' },
                { value: 'admin', label: 'Admin' }
            ];
        } else if (currentUser.role === 'manager') {
            return [
                { value: 'teacher', label: 'Tanár' }
            ];
        }
        return [];
    };

    const getAvailableManagers = () => {
        if (currentUser.role === 'admin') {
            return availableManagers.filter(manager => manager.id !== user.id);
        } else if (currentUser.role === 'manager') {
            return availableManagers.filter(manager => 
                ['manager', 'admin'].includes(manager.role) && manager.id !== user.id
            );
        }
        return [];
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('felhasznalok.update', user.id));
    };

    const handleDeactivate = () => {
        if (confirm(`Biztosan deaktiválni szeretnéd a felhasználót "${user.name}"? Ez a művelet visszavonható csak admin jogosultsággal.`)) {
            router.delete(route('felhasznalok.deactivate', user.id));
        }
    };

    const canDeactivate = () => {
        // Can't deactivate yourself
        if (user.id === currentUser.id) {
            return false;
        }
        
        // Admins can deactivate anyone except themselves
        if (currentUser.role === 'admin') {
            return true;
        }
        
        // Managers can only deactivate their teacher subordinates
        if (currentUser.role === 'manager') {
            return user.role === 'teacher' && user.manager_id === currentUser.id;
        }
        
        return false;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Felhasználó szerkesztése" />
            <PageContainer>
                <div>
                    <div className="mb-6">
                        <Link
                            href={route('felhasznalok.show', user.id)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                            ← Vissza a felhasználó részleteihez
                        </Link>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Felhasználó szerkesztése: {user.name}
                    </h1>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Felhasználó adatainak módosítása</h3>
                        </div>
                        
                        <form onSubmit={submit} className="px-6 py-4 space-y-6">
                            <div>
                                <InputLabel htmlFor="name" value="Név" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            <div>
                                <InputLabel htmlFor="role" value="Szerepkör" />
                                <select
                                    id="role"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    required
                                >
                                    {getAvailableRoles().map((role) => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.role} />
                            </div>

                            {data.role !== 'admin' && (
                                <div>
                                    <InputLabel htmlFor="manager_id" value="Menedzser" />
                                    <select
                                        id="manager_id"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.manager_id || ''}
                                        onChange={(e) => setData('manager_id', e.target.value || null)}
                                    >
                                        <option value="">Válassz menedzsert</option>
                                        {getAvailableManagers().map((manager) => (
                                            <option key={manager.id} value={manager.id}>
                                                {manager.name} ({getRoleLabel(manager.role)})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError className="mt-2" message={errors.manager_id} />
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="total_leave_days" value="Szabadság napok száma" />
                                <TextInput
                                    id="total_leave_days"
                                    type="number"
                                    min="1"
                                    max="50"
                                    className="mt-1 block w-full"
                                    value={data.total_leave_days}
                                    onChange={(e) => setData('total_leave_days', parseInt(e.target.value))}
                                    required
                                />
                                <InputError className="mt-2" message={errors.total_leave_days} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    {canDeactivate() && (
                                        <button
                                            type="button"
                                            onClick={handleDeactivate}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Felhasználó deaktiválása
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href={route('felhasznalok.show', user.id)}
                                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                                    >
                                        Mégse
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Mentés...' : 'Mentés'}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
