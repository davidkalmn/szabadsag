import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageContainer from '@/Components/PageContainer';
import { Head } from '@inertiajs/react';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="GYIK" />
            <PageContainer>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Gyakran Ismételt Kérdések</h1>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hogyan igényelhetek szabadságot?</h3>
                                <p className="text-gray-600">Menj a "Szabadságok" menüpontra, majd kattints az "Új igénylés" gombra.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hol láthatom a kérelmeim státuszát?</h3>
                                <p className="text-gray-600">A "Saját kérelmek" oldalon követheted nyomon kérelmeid állapotát.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hány szabadság napom van?</h3>
                                <p className="text-gray-600">A szabadság napjaid száma a beállításokban látható.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mit tehetek, ha problémám van?</h3>
                                <p className="text-gray-600">Fordulj a rendszergazdához vagy küldj egy értesítést a rendszeren keresztül.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
