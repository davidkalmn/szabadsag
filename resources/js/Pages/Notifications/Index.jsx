import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head } from '@inertiajs/react';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="Értesítések" />
            <PageContainer>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Értesítések</h1>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-gray-600">Itt láthatod az összes értesítést.</p>
                        <p className="text-sm text-gray-500 mt-2">Ez az oldal még fejlesztés alatt áll.</p>
                    </div>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
