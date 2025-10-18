import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head } from '@inertiajs/react';

export default function MyList() {
    return (
        <AuthenticatedLayout>
            <Head title="Saját kérelmek" />
            <PageContainer>
                <div>Saját kérelmek oldal</div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}