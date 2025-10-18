import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head } from '@inertiajs/react';

export default function AllIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Összes kérelem" />
            <PageContainer>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Összes szabadság kérelem</h1>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-gray-600">Itt láthatod az összes szabadság kérelmet a rendszerben.</p>
                        <p className="text-sm text-gray-500 mt-2">Ez az oldal még fejlesztés alatt áll.</p>
                    </div>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
