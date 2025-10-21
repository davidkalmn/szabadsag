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
                            {/* Szabadság igénylés */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hogyan igényelhetek szabadságot?</h3>
                                <p className="text-gray-600">Menj a "Szabadságok" menüpontra, majd kattints az "Új igénylés" gombra. Itt kiválaszthatod a kezdő és befejező dátumot, valamint megadhatod a szabadság okát.</p>
                            </div>

                            {/* Kérelmek követése */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hol láthatom a kérelmeim státuszát?</h3>
                                <p className="text-gray-600">A "Saját kérelmek" oldalon követheted nyomon kérelmeid állapotát. Itt láthatod, hogy mely kérelmek vannak függőben, jóváhagyva vagy elutasítva.</p>
                            </div>

                            {/* Szabadság napok */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hány szabadság napom van?</h3>
                                <p className="text-gray-600">A szabadság napjaid száma a beállításokban látható. A rendszer automatikusan számítja ki a felhasználható napokat az év elején.</p>
                            </div>

                            {/* Szűrés és keresés */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hogyan szűrhetem a szabadság kérelmeket?</h3>
                                <p className="text-gray-600">A szabadságok oldalon használhatod a szűrőket: állapot szerint (függőben, jóváhagyva, elutasítva), felhasználó szerint, és dátum szerint. A keresőmezővel pedig gyorsan megtalálhatod a keresett kérelmeket.</p>
                            </div>

                            {/* Értesítések */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hogyan működnek az értesítések?</h3>
                                <p className="text-gray-600">Az értesítések oldalon láthatod az összes rendszeres értesítést. Szűrheted típus szerint, dátum szerint, és kereshetsz a címben vagy üzenetben. Az olvasatlan értesítéseket jelölheted olvasottnak, vagy visszafelé olvasatlannak.</p>
                            </div>

                            {/* Értesítések szűrése */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hogyan szűrhetem az értesítéseket?</h3>
                                <p className="text-gray-600">Az értesítések oldalon több szűrőt is használhatsz: típus szerint (szabadság, felhasználó, profil változások), dátum szerint (dátumtól-dátumig), és kereshetsz a tartalomban. A rendezés lehetőségével pedig időrendben vagy fordított időrendben tekintheted meg őket.</p>
                            </div>

                            {/* Tevékenység napló */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mi az a tevékenység napló?</h3>
                                <p className="text-gray-600">A tevékenység naplóban láthatod az összes rendszeres aktivitást: bejelentkezéseket, szabadság kérelmeket, jóváhagyásokat, profil módosításokat és egyéb műveleteket. Szűrheted tevékenység típus szerint, felhasználó szerint, dátum szerint, és kereshetsz a leírásban.</p>
                            </div>

                            {/* Napló rendezés */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hogyan rendezhetem a tevékenység naplót?</h3>
                                <p className="text-gray-600">A "Dátum" oszlop fejlécére kattintva rendezheted a napló bejegyzéseket időrendben vagy fordított időrendben. A nyilak jelzik a jelenlegi rendezési irányt.</p>
                            </div>

                            {/* Felhasználó kezelés */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Milyen felhasználó kezelési funkciók vannak?</h3>
                                <p className="text-gray-600">A rendszergazdák és menedzserek új felhasználókat hozhatnak létre, módosíthatják a profilokat, hozzárendelhetnek beosztottakat, és kezelhetik a felhasználói jogosultságokat. A rendszer automatikusan naplózza ezeket a változtatásokat.</p>
                            </div>

                            {/* Profil kezelés */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hogyan módosíthatom a profilomat?</h3>
                                <p className="text-gray-600">A "Beállítások" menüpontban módosíthatod a személyes adataidat, email címedet és jelszavadat. A rendszer értesítést küld minden jelentős változtatásról.</p>
                            </div>

                            {/* Dátum szűrés */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hogyan működik a dátum szűrés?</h3>
                                <p className="text-gray-600">A dátum szűrőkben megadhatod a kezdő és befejező dátumot. Ha csak egy dátumot adsz meg, akkor az adott napra szűr. A rendszer automatikusan megakadályozza a jövőbeli dátumok kiválasztását.</p>
                            </div>

                            {/* Szűrők törlése */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hogyan törölhetem az összes szűrőt?</h3>
                                <p className="text-gray-600">Ha több szűrőt is alkalmaztál és vissza szeretnél térni az alapértelmezett nézethez, használd az "Összes szűrő törlése" gombot, amely megjelenik, amikor aktív szűrők vannak.</p>
                            </div>

                            {/* Rendszer szerepkörök */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Milyen szerepkörök vannak a rendszerben?</h3>
                                <p className="text-gray-600">A rendszer három fő szerepkört támogat: Tanár (saját kérelmeket kezelhet), Menedzser (saját és beosztottjai kérelmeit kezelheti), és Rendszergazda (teljes hozzáférés minden funkcióhoz).</p>
                            </div>

                            {/* Problémák */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mit tehetek, ha problémám van?</h3>
                                <p className="text-gray-600">Fordulj a rendszergazdához vagy küldj egy értesítést a rendszeren keresztül. A tevékenység napló segíthet a problémák diagnosztizálásában is.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
