import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <PageContainer>
                <div>Dashboard oldal</div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
