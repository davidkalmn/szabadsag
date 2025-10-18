import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head } from '@inertiajs/react';

export default function Apply() {
    return (
        <AuthenticatedLayout>
            <Head title="Szabadság igénylés" />
            <PageContainer>
                <div>Igénylés oldal</div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}