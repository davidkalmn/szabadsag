import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Presentation() {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', name: 'Áttekintés', icon: '📋' },
        { id: 'architecture', name: 'Architektúra', icon: '🏗️' },
        { id: 'technical-implementation', name: 'Technikai Implementáció', icon: '🔧' },
        { id: 'tech-stack', name: 'Technológiai Stack', icon: '⚙️' },
        { id: 'database', name: 'Adatbázis', icon: '🗄️' },
        { id: 'roles', name: 'Szerepkörök', icon: '👥' },
        { id: 'pages', name: 'Oldalak', icon: '📄' },
        { id: 'features', name: 'Funkciók', icon: '✨' },
        { id: 'workflows', name: 'Munkafolyamatok', icon: '🔄' },
    ];

    const scrollToSection = (sectionId) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Head title="Projekt Bemutatás" />
            
            {/* Navigation Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10 overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Szabadságkezelő Rendszer</h2>
                    <p className="text-sm text-gray-600 mt-1">Projekt Bemutatás</p>
                </div>
                <nav className="p-4 space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                activeSection === section.id
                                    ? 'bg-indigo-100 text-indigo-900 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <span className="mr-2">{section.icon}</span>
                            {section.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="ml-64">
                <div className="max-w-5xl mx-auto px-8 py-12">
                    
                    {/* Header */}
                    <div id="overview" className="mb-16 scroll-mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Szabadságkezelő Rendszer
                            </h1>
                            <p className="text-xl text-gray-600 mb-6">
                                Modern webalkalmazás szabadságkérelmek kezelésére
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-900">Laravel 12</div>
                                    <div className="text-sm text-blue-700">Backend Framework</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-purple-900">React 18</div>
                                    <div className="text-sm text-purple-700">Frontend Library</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-900">Inertia.js</div>
                                    <div className="text-sm text-green-700">SPA Framework</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Projekt Célja</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                A rendszer célja egy modern, felhasználóbarát webalkalmazás létrehozása, amely lehetővé teszi 
                                a szervezetek számára, hogy hatékonyan kezeljék az alkalmazottaik szabadságkérelmeit. 
                                A rendszer támogatja a hierarchikus szerepköröket (tanár, menedzser, adminisztrátor), 
                                automatikus értesítéseket, részletes naplózást és átlátható munkafolyamatokat.
                            </p>
                            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Főbb Jellemzők</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                <li>Háromszintű szerepkör-alapú hozzáférés-vezérlés (RBAC)</li>
                                <li>Valós idejű értesítési rendszer</li>
                                <li>Részletes aktivitásnaplózás</li>
                                <li>Naptár integráció szabadságok megjelenítéséhez</li>
                                <li>Automatikus szabadságnap számítás magyarországi ünnepekkel</li>
                                <li>Reszponzív, modern felhasználói felület</li>
                            </ul>
                        </div>
                    </div>

                    {/* Architecture */}
                    <div id="architecture" className="mb-16 scroll-mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">🏗️ Architektúra</h2>
                            
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Általános Architektúra</h3>
                                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                    <div className="flex items-center justify-center space-x-8 mb-6">
                                        <div className="text-center">
                                            <div className="bg-blue-100 rounded-lg p-4 mb-2">
                                                <div className="text-2xl">🌐</div>
                                            </div>
                                            <div className="text-sm font-semibold">Kliens</div>
                                            <div className="text-xs text-gray-600">React + Inertia</div>
                                        </div>
                                        <div className="text-2xl">→</div>
                                        <div className="text-center">
                                            <div className="bg-purple-100 rounded-lg p-4 mb-2">
                                                <div className="text-2xl">🔌</div>
                                            </div>
                                            <div className="text-sm font-semibold">API</div>
                                            <div className="text-xs text-gray-600">Laravel Routes</div>
                                        </div>
                                        <div className="text-2xl">→</div>
                                        <div className="text-center">
                                            <div className="bg-green-100 rounded-lg p-4 mb-2">
                                                <div className="text-2xl">⚙️</div>
                                            </div>
                                            <div className="text-sm font-semibold">Controller</div>
                                            <div className="text-xs text-gray-600">Business Logic</div>
                                        </div>
                                        <div className="text-2xl">→</div>
                                        <div className="text-center">
                                            <div className="bg-yellow-100 rounded-lg p-4 mb-2">
                                                <div className="text-2xl">🗄️</div>
                                            </div>
                                            <div className="text-sm font-semibold">Model</div>
                                            <div className="text-xs text-gray-600">Database</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Backend (Laravel) - Technikai Részletek</h4>
                                    <div className="space-y-3">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="font-semibold text-blue-900 mb-2">MVC Architektúra</div>
                                            <div className="text-sm text-blue-800">
                                                <strong>Minta:</strong> Model-View-Controller (Gang of Four Design Pattern)<br/>
                                                <strong>Implementáció:</strong> Laravel natív MVC struktúra<br/>
                                                <strong>Előnyök:</strong> Szeparáció, tesztelhetőség, karbantarthatóság<br/>
                                                <strong>Industry Standard:</strong> PSR-4 autoloading, namespace használat
                                            </div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="font-semibold text-green-900 mb-2">RESTful Route Design</div>
                                            <div className="text-sm text-green-800">
                                                <strong>Módszer:</strong> Resource Controller pattern<br/>
                                                <strong>HTTP Műveletek:</strong> GET, POST, PUT, PATCH, DELETE<br/>
                                                <strong>Naming Convention:</strong> Laravel route naming standards<br/>
                                                <strong>REST Principles:</strong> Stateless, cacheable, uniform interface
                                            </div>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <div className="font-semibold text-purple-900 mb-2">Middleware Pattern</div>
                                            <div className="text-sm text-purple-800">
                                                <strong>Implementáció:</strong> Pipeline pattern (Chain of Responsibility)<br/>
                                                <strong>Custom Middleware:</strong> RoleMiddleware (RBAC implementáció)<br/>
                                                <strong>Laravel Middleware:</strong> Authenticate, VerifyCsrfToken<br/>
                                                <strong>Futási Sorrend:</strong> Global → Route → Controller middleware
                                            </div>
                                        </div>
                                        <div className="bg-yellow-50 rounded-lg p-4">
                                            <div className="font-semibold text-yellow-900 mb-2">Eloquent ORM</div>
                                            <div className="text-sm text-yellow-800">
                                                <strong>Pattern:</strong> Active Record pattern<br/>
                                                <strong>Query Builder:</strong> Fluent interface, method chaining<br/>
                                                <strong>Relationships:</strong> belongsTo, hasMany, hasOne (Eager Loading)<br/>
                                                <strong>Scopes:</strong> Query scope metódusok újrafelhasználhatósághoz
                                            </div>
                                        </div>
                                        <div className="bg-pink-50 rounded-lg p-4">
                                            <div className="font-semibold text-pink-900 mb-2">Trait Pattern</div>
                                            <div className="text-sm text-pink-800">
                                                <strong>PHP Trait:</strong> Horizontal code reuse mechanism<br/>
                                                <strong>Implementáció:</strong> LogsActivity, CreatesNotifications traits<br/>
                                                <strong>Előny:</strong> DRY principle, cross-cutting concerns<br/>
                                                <strong>Használat:</strong> use LogsActivity, CreatesNotifications; (multiple traits)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Frontend (React + Inertia.js) - Technikai Részletek</h4>
                                    <div className="space-y-3">
                                        <div className="bg-cyan-50 rounded-lg p-4">
                                            <div className="font-semibold text-cyan-900 mb-2">Inertia.js Architektúra</div>
                                            <div className="text-sm text-cyan-800">
                                                <strong>Működés:</strong> XHR requests + partial page updates<br/>
                                                <strong>Adatátvitel:</strong> JSON payload Inertia headers-ben<br/>
                                                <strong>State Management:</strong> Server-side state, props injection<br/>
                                                <strong>Előny:</strong> Nincs REST API szükség, SPA élmény
                                            </div>
                                        </div>
                                        <div className="bg-teal-50 rounded-lg p-4">
                                            <div className="font-semibold text-teal-900 mb-2">React Hooks Pattern</div>
                                            <div className="text-sm text-teal-800">
                                                <strong>useState:</strong> Lokális state kezelés<br/>
                                                <strong>useEffect:</strong> Side effects, lifecycle management<br/>
                                                <strong>useMemo:</strong> Memoization teljesítmény optimalizáláshoz<br/>
                                                <strong>Custom Hooks:</strong> usePage (Inertia), useForm (Inertia)
                                            </div>
                                        </div>
                                        <div className="bg-orange-50 rounded-lg p-4">
                                            <div className="font-semibold text-orange-900 mb-2">Komponens Kompozíció</div>
                                            <div className="text-sm text-orange-800">
                                                <strong>Pattern:</strong> Composition over Inheritance<br/>
                                                <strong>Layout Components:</strong> AuthenticatedLayout, GuestLayout<br/>
                                                <strong>Reusable Components:</strong> NavLink, Dropdown, PageContainer<br/>
                                                <strong>Props Drilling:</strong> Minimizálva Inertia share() használatával
                                            </div>
                                        </div>
                                        <div className="bg-indigo-50 rounded-lg p-4">
                                            <div className="font-semibold text-indigo-900 mb-2">Form Handling</div>
                                            <div className="text-sm text-indigo-800">
                                                <strong>Inertia useForm:</strong> Form state + validation handling<br/>
                                                <strong>CSRF Protection:</strong> Automatikus Laravel CSRF token<br/>
                                                <strong>Validation:</strong> Server-side validáció + error display<br/>
                                                <strong>Progress Tracking:</strong> Loading states, disable on submit
                                            </div>
                                        </div>
                                        <div className="bg-red-50 rounded-lg p-4">
                                            <div className="font-semibold text-red-900 mb-2">Routing (Ziggy)</div>
                                            <div className="text-sm text-red-800">
                                                <strong>Laravel Routes → JS:</strong> Ziggy package generálja<br/>
                                                <strong>Használat:</strong> route('dashboard') helper függvény<br/>
                                                <strong>Type Safety:</strong> TypeScript support (opcionális)<br/>
                                                <strong>Előny:</strong> Type-safe routing, refactoring support
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 bg-indigo-50 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-indigo-900 mb-3">Inertia.js Működése - Technikai Részletek</h4>
                                <p className="text-indigo-800 mb-3">
                                    Az Inertia.js egy modern megoldás, amely összeköti a Laravel backend-et a React frontend-del 
                                    anélkül, hogy REST API-t kellene írni. A Laravel controller-ek közvetlenül React komponenseket 
                                    renderelnek, miközben az SPA élményt megőrzi.
                                </p>
                                <div className="bg-white rounded p-4 text-sm font-mono text-gray-800 mb-4">
                                    <div className="mb-2"><span className="text-blue-600">// Backend (Laravel Controller)</span></div>
                                    <div className="mb-2"><span className="text-purple-600">return</span> <span className="text-green-600">inertia</span>(<span className="text-orange-600">'Dashboard'</span>, [</div>
                                    <div className="ml-4 mb-2"><span className="text-orange-600">'statistics'</span>: <span className="text-blue-600">$statistics</span>,</div>
                                    <div className="ml-4 mb-2"><span className="text-orange-600">'leaves'</span>: <span className="text-blue-600">$leaves</span></div>
                                    <div className="mb-2">]);</div>
                                    <div className="mt-4 mb-2"><span className="text-blue-600">// Frontend (React Component)</span></div>
                                    <div className="mb-2"><span className="text-purple-600">export default function</span> <span className="text-green-600">Dashboard</span>({'{'}<span className="text-orange-600">statistics</span>, <span className="text-orange-600">leaves</span>{'}'}) {'{'}</div>
                                    <div className="ml-4 mb-2"><span className="text-purple-600">return</span> (<span className="text-green-600">&lt;div&gt;</span>{'...'}<span className="text-green-600">&lt;/div&gt;</span>);</div>
                                    <div className="mb-2">{'}'}</div>
                                </div>
                                <div className="bg-indigo-100 rounded p-4 text-sm text-indigo-900">
                                    <strong>Technikai Működés:</strong>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li><strong>Request Flow:</strong> XHR request → Laravel Controller → Inertia::render() → JSON response → React component update</li>
                                        <li><strong>Headers:</strong> X-Inertia: true, X-Inertia-Version header cache busting-hez</li>
                                        <li><strong>Partial Reloads:</strong> X-Inertia-Partial-Component + X-Inertia-Partial-Data headers</li>
                                        <li><strong>Error Handling:</strong> Validation errors automatikusan props-ként érkeznek</li>
                                        <li><strong>Performance:</strong> Csak változott adatok küldése, client-side routing</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technical Implementation Details */}
                    <div id="technical-implementation" className="mb-16 scroll-mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">🔧 Technikai Implementáció Részletek</h2>
                            
                            <div className="space-y-6">
                                {/* Role-Based Access Control */}
                                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                                    <h3 className="text-xl font-semibold text-blue-900 mb-4">Szerepkör-alapú Hozzáférés-vezérlés (RBAC)</h3>
                                    <div className="space-y-3">
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">Middleware Implementáció</h4>
                                            <div className="text-sm text-gray-700 mb-3">
                                                <strong>Pattern:</strong> Decorator Pattern (Middleware Chain)<br/>
                                                <strong>File:</strong> app/Http/Middleware/RoleMiddleware.php<br/>
                                                <strong>Módszer:</strong> handle() metódus variadic arguments (...$roles) használatával
                                            </div>
                                            <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-800">
                                                <div>public function handle(Request $request, Closure $next, ...$roles)</div>
                                                <div className="ml-4">if (!in_array($user-&gt;role, $roles, true)) abort(403);</div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">Route Protection</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Használat:</strong> Route middleware registration bootstrap/app.php-ban<br/>
                                                <strong>Alias:</strong> 'role' → RoleMiddleware::class<br/>
                                                <strong>Példa:</strong> -&gt;middleware('role:manager,admin')
                                            </div>
                                            <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-800">
                                                Route::get('/szabadsagok/kerelmek', ...)<br/>
                                                <span className="ml-4">-&gt;middleware('role:manager');</span>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">Industry Standards</h4>
                                            <ul className="text-sm text-gray-700 space-y-1">
                                                <li>• <strong>OWASP Top 10:</strong> A01:2021 – Broken Access Control megelőzése</li>
                                                <li>• <strong>Principle of Least Privilege:</strong> Minimum szükséges jogosultságok</li>
                                                <li>• <strong>Defense in Depth:</strong> Middleware + Controller-level ellenőrzések</li>
                                                <li>• <strong>Fail Secure:</strong> abort(403) default deny approach</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Eloquent ORM Patterns */}
                                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                                    <h3 className="text-xl font-semibold text-green-900 mb-4">Eloquent ORM - Design Patterns</h3>
                                    <div className="space-y-3">
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-green-900 mb-2">Active Record Pattern</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Definíció:</strong> Model = Database row + business logic<br/>
                                                <strong>Előny:</strong> Egyszerű használat, intuitív API<br/>
                                                <strong>Példa:</strong> $user-&gt;leaves()-&gt;where('status', 'pending')-&gt;get()
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-green-900 mb-2">Query Scopes</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Pattern:</strong> Builder Pattern extension<br/>
                                                <strong>Használat:</strong> scopeActive(), scopePending(), scopeCurrentYear()<br/>
                                                <strong>Előny:</strong> Reusable query logic, clean code
                                            </div>
                                            <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-800">
                                                public function scopeActive($query) {'{'}<br/>
                                                <span className="ml-4">return $query-&gt;where('is_active', true);</span><br/>
                                                {'}'}<br/>
                                                <span className="text-gray-600">// Használat: User::active()-&gt;get()</span>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-green-900 mb-2">Eager Loading (N+1 Problem Megoldás)</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Probléma:</strong> N+1 query problem (1 fő query + N kapcsolati query)<br/>
                                                <strong>Megoldás:</strong> with() metódus használata<br/>
                                                <strong>Optimalizáció:</strong> with(['user.manager', 'reviewer'])
                                            </div>
                                            <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-800">
                                                Leave::with(['user', 'reviewer'])-&gt;get();<br/>
                                                <span className="text-gray-600">// 1 query helyett 3 query (1 main + 2 relationship)</span>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-green-900 mb-2">Mass Assignment Protection</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Laravel Feature:</strong> $fillable vagy $guarded property<br/>
                                                <strong>Security:</strong> Mass assignment vulnerability megelőzése<br/>
                                                <strong>Best Practice:</strong> Explicit $fillable array használata
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Trait Pattern */}
                                <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                                    <h3 className="text-xl font-semibold text-purple-900 mb-4">Trait Pattern - Cross-cutting Concerns</h3>
                                    <div className="space-y-3">
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-purple-900 mb-2">LogsActivity Trait</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Cél:</strong> Activity logging funkcionalitás újrafelhasználása<br/>
                                                <strong>Használat:</strong> use LogsActivity; a controller-ekben<br/>
                                                <strong>Metódus:</strong> protected logActivity($action, $description, $target, $request)
                                            </div>
                                            <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-800">
                                                class LeaveController extends Controller {'{'}<br/>
                                                <span className="ml-4">use LogsActivity, CreatesNotifications;</span><br/>
                                                <span className="ml-4">$this-&gt;logActivity('leave_approved', '...', $leave);</span><br/>
                                                {'}'}
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-purple-900 mb-2">CreatesNotifications Trait</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Cél:</strong> Notification creation logika központosítása<br/>
                                                <strong>Pattern:</strong> Template Method Pattern<br/>
                                                <strong>Előny:</strong> DRY principle, konzisztens notification struktúra
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-purple-900 mb-2">Miért Trait és nem Inheritance?</h4>
                                            <ul className="text-sm text-gray-700 space-y-1">
                                                <li>• <strong>Multiple Inheritance:</strong> PHP nem támogatja, trait igen</li>
                                                <li>• <strong>Horizontal Reuse:</strong> Több controller-ben használható</li>
                                                <li>• <strong>Separation of Concerns:</strong> Logging/Notification logika külön</li>
                                                <li>• <strong>Composition over Inheritance:</strong> Modern OOP best practice</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Practices */}
                                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                                    <h3 className="text-xl font-semibold text-red-900 mb-4">Biztonsági Gyakorlatok</h3>
                                    <div className="space-y-3">
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-red-900 mb-2">Password Hashing</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Algoritmus:</strong> bcrypt (Laravel default)<br/>
                                                <strong>Cost Factor:</strong> 10 rounds (configurable)<br/>
                                                <strong>Laravel Feature:</strong> Hash::make() automatikus salt generálással<br/>
                                                <strong>Industry Standard:</strong> OWASP password storage guidelines
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-red-900 mb-2">CSRF Protection</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Laravel Middleware:</strong> VerifyCsrfToken<br/>
                                                <strong>Token Generation:</strong> Session-based CSRF tokens<br/>
                                                <strong>Inertia Integration:</strong> Automatikus token injection<br/>
                                                <strong>Protection:</strong> POST/PUT/DELETE requests védve
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-red-900 mb-2">SQL Injection Prevention</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Eloquent ORM:</strong> Parameterized queries automatikusan<br/>
                                                <strong>Query Builder:</strong> where() metódusok prepared statements-tel<br/>
                                                <strong>Best Practice:</strong> Soha ne használjunk raw SQL user input-tal
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-red-900 mb-2">XSS Protection</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>React:</strong> Automatikus escaping JSX-ben<br/>
                                                <strong>Blade:</strong> {'{'}{'{'}} syntax automatikus escaping<br/>
                                                <strong>Manual:</strong> dangerouslySetInnerHTML csak trusted content esetén
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-red-900 mb-2">Input Validation</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Laravel Validation:</strong> Form Request classes<br/>
                                                <strong>Rules:</strong> required, email, unique, date, after_or_equal<br/>
                                                <strong>Custom Messages:</strong> Localized error messages<br/>
                                                <strong>Industry Standard:</strong> Server-side validation (client-side csak UX)
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Optimizations */}
                                <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                                    <h3 className="text-xl font-semibold text-yellow-900 mb-4">Teljesítmény Optimalizációk</h3>
                                    <div className="space-y-3">
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-yellow-900 mb-2">Database Indexing</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Indexek:</strong> user_id + status, start_date + end_date<br/>
                                                <strong>Cél:</strong> Gyorsabb WHERE és JOIN lekérdezések<br/>
                                                <strong>Trade-off:</strong> Írási sebesség vs olvasási sebesség
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-yellow-900 mb-2">Eager Loading</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>N+1 Problem:</strong> with(['user.manager', 'reviewer'])<br/>
                                                <strong>Lazy Eager Loading:</strong> load() metódus dinamikus betöltéshez<br/>
                                                <strong>Performance Gain:</strong> 100+ query → 3-4 query
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-yellow-900 mb-2">React Memoization</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>useMemo:</strong> Calendar events számítás optimalizálása<br/>
                                                <strong>Dependency Array:</strong> Csak szükséges re-render<br/>
                                                <strong>useCallback:</strong> Function reference stability
                                            </div>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-yellow-900 mb-2">Vite Build Optimization</h4>
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>Code Splitting:</strong> Automatikus chunk generation<br/>
                                                <strong>Tree Shaking:</strong> Unused code elimination<br/>
                                                <strong>Minification:</strong> Production build optimalizáció
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div id="tech-stack" className="mb-16 scroll-mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">⚙️ Technológiai Stack</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Backend Technológiaiak</h3>
                                    <div className="space-y-3">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="font-semibold text-blue-900">Laravel 12</div>
                                            <div className="text-sm text-blue-700">PHP framework MVC architektúrával</div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="font-semibold text-green-900">PHP 8.2+</div>
                                            <div className="text-sm text-green-700">Modern PHP verzió típusokkal és attribútumokkal</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <div className="font-semibold text-purple-900">Eloquent ORM</div>
                                            <div className="text-sm text-purple-700">Objektum-relációs leképezés az adatbázishoz</div>
                                        </div>
                                        <div className="bg-yellow-50 rounded-lg p-4">
                                            <div className="font-semibold text-yellow-900">Laravel Sanctum</div>
                                            <div className="text-sm text-yellow-700">API autentikáció és session kezelés</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Frontend Technológiaiak</h3>
                                    <div className="space-y-3">
                                        <div className="bg-cyan-50 rounded-lg p-4">
                                            <div className="font-semibold text-cyan-900">React 18</div>
                                            <div className="text-sm text-cyan-700">Komponens-alapú UI library</div>
                                        </div>
                                        <div className="bg-pink-50 rounded-lg p-4">
                                            <div className="font-semibold text-pink-900">Inertia.js</div>
                                            <div className="text-sm text-pink-700">SPA framework Laravel + React integrációval</div>
                                        </div>
                                        <div className="bg-teal-50 rounded-lg p-4">
                                            <div className="font-semibold text-teal-900">Tailwind CSS</div>
                                            <div className="text-sm text-teal-700">Utility-first CSS framework</div>
                                        </div>
                                        <div className="bg-orange-50 rounded-lg p-4">
                                            <div className="font-semibold text-orange-900">FullCalendar</div>
                                            <div className="text-sm text-orange-700">Naptár komponens szabadságok megjelenítéséhez</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Egyéb Eszközök</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="font-semibold text-gray-900">Vite</div>
                                        <div className="text-sm text-gray-700">Build tool és dev server</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="font-semibold text-gray-900">PostgreSQL/SQLite</div>
                                        <div className="text-sm text-gray-700">Adatbázis rendszer</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="font-semibold text-gray-900">Ziggy</div>
                                        <div className="text-sm text-gray-700">Laravel route-ok JavaScript-ben</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Database */}
                    <div id="database" className="mb-16 scroll-mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">🗄️ Adatbázis Struktúra</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Főbb Táblák</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                                            <h4 className="font-semibold text-blue-900 mb-2">users</h4>
                                            <ul className="text-sm text-blue-800 space-y-1">
                                                <li>• id, name, email, password</li>
                                                <li>• role (teacher/manager/admin)</li>
                                                <li>• manager_id (hierarchia)</li>
                                                <li>• total_leave_days, remaining_leaves_current_year</li>
                                                <li>• is_active (soft delete)</li>
                                            </ul>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                                            <h4 className="font-semibold text-green-900 mb-2">leaves</h4>
                                            <ul className="text-sm text-green-800 space-y-1">
                                                <li>• id, user_id (foreign key)</li>
                                                <li>• category (szabadsag/betegszabadsag/tappenzt/egyeb_tavollet)</li>
                                                <li>• start_date, end_date, days_requested</li>
                                                <li>• status (pending/approved/rejected/cancelled)</li>
                                                <li>• reviewed_by, reviewed_at, review_notes</li>
                                            </ul>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                                            <h4 className="font-semibold text-purple-900 mb-2">notifications</h4>
                                            <ul className="text-sm text-purple-800 space-y-1">
                                                <li>• id, user_id (foreign key)</li>
                                                <li>• type, title, message</li>
                                                <li>• data (JSON)</li>
                                                <li>• read_at (timestamp)</li>
                                            </ul>
                                        </div>
                                        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                                            <h4 className="font-semibold text-yellow-900 mb-2">activity_logs</h4>
                                            <ul className="text-sm text-yellow-800 space-y-1">
                                                <li>• id, user_id (foreign key)</li>
                                                <li>• action, description</li>
                                                <li>• target_type, target_id (polymorphic)</li>
                                                <li>• ip_address, user_agent</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Kapcsolatok (Relationships)</h3>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div><strong>User:</strong> hasMany(Leave), belongsTo(User, manager_id), hasMany(User, manager_id)</div>
                                        <div><strong>Leave:</strong> belongsTo(User), belongsTo(User, reviewed_by), hasMany(LeaveHistory)</div>
                                        <div><strong>Notification:</strong> belongsTo(User)</div>
                                        <div><strong>ActivityLog:</strong> belongsTo(User)</div>
                                    </div>
                                </div>

                                <div className="bg-indigo-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-indigo-900 mb-3">Kulcsfontosságú Funkciók</h3>
                                    <ul className="space-y-2 text-indigo-800">
                                        <li className="flex items-start">
                                            <span className="mr-2">🔑</span>
                                            <span><strong>Hierarchikus Struktúra:</strong> manager_id mező lehetővé teszi a hierarchikus felhasználó struktúrát</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">📊</span>
                                            <span><strong>Polymorphic Relations:</strong> activity_logs tábla támogatja a különböző típusú célobjektumokat</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">🔄</span>
                                            <span><strong>Soft Deletes:</strong> is_active mezővel történő logikai törlés</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">📈</span>
                                            <span><strong>Indexek:</strong> Optimalizált lekérdezésekhez indexek a gyakran használt mezőkön</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Roles */}
                    <div id="roles" className="mb-16 scroll-mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">👥 Szerepkörök és Jogosultságok</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                                    <h3 className="text-xl font-semibold text-blue-900 mb-3">👨‍🏫 Tanár (Teacher)</h3>
                                    <ul className="space-y-2 text-blue-800 text-sm">
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Saját szabadságkérelmek létrehozása</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Saját kérelmek megtekintése</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Profil szerkesztése</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Értesítések megtekintése</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-red-500 mr-2">✗</span>
                                            <span>Nem láthatja mások kérelmeit</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-red-500 mr-2">✗</span>
                                            <span>Nem hagyhat jóvá kérelmeket</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                                    <h3 className="text-xl font-semibold text-green-900 mb-3">👔 Menedzser (Manager)</h3>
                                    <ul className="space-y-2 text-green-800 text-sm">
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Minden tanár jogosultsága</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Beosztottak kérelmeinek megtekintése</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Beosztottak kérelmeinek jóváhagyása/elutasítása</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Felhasználók kezelése (beosztottak)</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Aktivitásnapló megtekintése</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-red-500 mr-2">✗</span>
                                            <span>Nem láthatja az összes kérelmet</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                                    <h3 className="text-xl font-semibold text-purple-900 mb-3">👑 Adminisztrátor (Admin)</h3>
                                    <ul className="space-y-2 text-purple-800 text-sm">
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Minden menedzser jogosultsága</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Összes kérelmek megtekintése</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Összes felhasználó kezelése</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Deaktivált felhasználók kezelése</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Teljes aktivitásnapló hozzáférés</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span>Rendszer szintű műveletek</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Middleware Védelme</h3>
                                <p className="text-gray-700 mb-3">
                                    A szerepkör-alapú hozzáférés-vezérlés Laravel middleware-ekkel valósul meg. 
                                    Minden route-ot véd a megfelelő middleware, amely ellenőrzi a felhasználó szerepkörét.
                                </p>
                                <div className="bg-white rounded p-4 text-sm font-mono text-gray-800">
                                    <div className="mb-2"><span className="text-blue-600">Route::</span><span className="text-green-600">get</span>(<span className="text-orange-600">'/szabadsagok/kerelmek'</span>, ...)</div>
                                    <div className="ml-4 mb-2"><span className="text-purple-600">-&gt;middleware</span>(<span className="text-orange-600">'role:manager'</span>);</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pages */}
                    <div id="pages" className="mb-16 scroll-mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">📄 Oldalak és Funkciók</h2>
                            
                            <div className="space-y-6">
                                {/* Dashboard */}
                                <div className="border-l-4 border-indigo-500 bg-indigo-50 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-indigo-900 mb-3">📊 Dashboard</h3>
                                    <p className="text-indigo-800 mb-3">
                                        A főoldal, amely áttekintést nyújt a felhasználó számára releváns információkról.
                                    </p>
                                    <div className="bg-white rounded p-4 mb-3">
                                        <h4 className="font-semibold mb-2">Funkciók:</h4>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            <li>Statisztikák megjelenítése (függőben, jóváhagyva, elutasítva, érvénytelenítve)</li>
                                            <li>Havi naptár szabadságokkal (FullCalendar integráció)</li>
                                            <li>Legutóbbi értesítések listája</li>
                                            <li>Legutóbbi aktivitások naplója</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white rounded p-4">
                                        <h4 className="font-semibold mb-2">Szerepkör-specifikus adatok:</h4>
                                        <ul className="text-sm space-y-1">
                                            <li><strong>Tanár:</strong> Saját szabadságok és statisztikák</li>
                                            <li><strong>Menedzser:</strong> Csapat szabadságok és statisztikák</li>
                                            <li><strong>Admin:</strong> Összes szabadság és statisztikák</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Leave Management */}
                                <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-blue-900 mb-3">📅 Szabadságkezelés</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">Saját Kérelmek (/szabadsagok/sajat-kerelmek)</h4>
                                            <p className="text-sm text-gray-700 mb-2">A felhasználó saját szabadságkérelmeinek listája.</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Szűrés státusz, kategória, dátum szerint</li>
                                                <li>• Részletes információk minden kérelmről</li>
                                                <li>• Státusz badge-ekkel (függőben/jóváhagyva/elutasítva)</li>
                                            </ul>
                                        </div>

                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">Új Igénylés (/szabadsagok/igenyles)</h4>
                                            <p className="text-sm text-gray-700 mb-2">Új szabadságkérelmek létrehozása.</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Kategória kiválasztása (szabadság, betegszabadság, táppénz, egyéb távollét)</li>
                                                <li>• Dátum választó kezdő és befejező dátumhoz</li>
                                                <li>• Automatikus napok számítása (hétköznapok, magyarországi ünnepek nélkül)</li>
                                                <li>• Okoz megadása (opcionális)</li>
                                                <li>• Validáció: elegendő szabadságnap rendelkezésre állása</li>
                                            </ul>
                                        </div>

                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">Kérelem Részletei (/szabadsagok/{'{leave}'})</h4>
                                            <p className="text-sm text-gray-700 mb-2">Egy adott kérelm részletes megtekintése.</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Teljes kérelm információ</li>
                                                <li>• Módosítási előzmények (LeaveHistory)</li>
                                                <li>• Menedzser/Admin: jóváhagyás/elutasítás/érvénytelenítés gombok</li>
                                            </ul>
                                        </div>

                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">Csapat Kérelmek (/szabadsagok/kerelmek) - Menedzser</h4>
                                            <p className="text-sm text-gray-700 mb-2">A menedzser beosztottjainak kérelmei.</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Csak a beosztottak kérelmei láthatók</li>
                                                <li>• Gyors jóváhagyás/elutasítás lehetőség</li>
                                                <li>• Szűrési és keresési opciók</li>
                                            </ul>
                                        </div>

                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">Összes Kérelem (/szabadsagok/osszes-kerelem) - Admin</h4>
                                            <p className="text-sm text-gray-700 mb-2">Az összes szabadságkérelm az egész rendszerben.</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Teljes rendszer áttekintés</li>
                                                <li>• Minden felhasználó kérelmei</li>
                                                <li>• Részletes szűrési lehetőségek</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* User Management */}
                                <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-green-900 mb-3">👥 Felhasználókezelés</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-green-900 mb-2">Felhasználók Lista (/felhasznalok) - Menedzser/Admin</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Aktív felhasználók listája</li>
                                                <li>• Keresés név szerint</li>
                                                <li>• Felhasználó részletek megtekintése</li>
                                                <li>• Menedzser: csak beosztottak + saját maga</li>
                                                <li>• Admin: összes felhasználó</li>
                                            </ul>
                                        </div>

                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-green-900 mb-2">Új Felhasználó (/felhasznalok/uj)</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Név, email, jelszó megadása</li>
                                                <li>• Szerepkör kiválasztása</li>
                                                <li>• Menedzser hozzárendelése (opcionális)</li>
                                                <li>• Éves szabadságnapok beállítása</li>
                                            </ul>
                                        </div>

                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-green-900 mb-2">Felhasználó Szerkesztése (/felhasznalok/{'{user}'}/szerkesztes)</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Profil információk módosítása</li>
                                                <li>• Szerepkör és menedzser módosítása</li>
                                                <li>• Szabadságnapok frissítése</li>
                                            </ul>
                                        </div>

                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-green-900 mb-2">Deaktivált Felhasználók (/felhasznalok/deaktivalt) - Admin</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Logikailag törölt felhasználók listája</li>
                                                <li>• Újraaktiválás lehetősége</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Other Pages */}
                                <div className="border-l-4 border-purple-500 bg-purple-50 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-purple-900 mb-3">🔔 Egyéb Oldalak</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-purple-900 mb-2">Értesítések (/ertesitesek)</h4>
                                            <p className="text-sm text-gray-600">Minden felhasználó értesítéseinek listája, olvasott/olvasatlan státusszal.</p>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-purple-900 mb-2">Aktivitásnapló (/naplo)</h4>
                                            <p className="text-sm text-gray-600">Részletes rendszer aktivitások naplója (Menedzser/Admin).</p>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-purple-900 mb-2">Profil Beállítások (/beallitasok)</h4>
                                            <p className="text-sm text-gray-600">Felhasználói profil szerkesztése, jelszó módosítás.</p>
                                        </div>
                                        <div className="bg-white rounded p-4">
                                            <h4 className="font-semibold text-purple-900 mb-2">GYIK (/gyik)</h4>
                                            <p className="text-sm text-gray-600">Gyakran ismételt kérdések oldala.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div id="features" className="mb-16 scroll-mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">✨ Főbb Funkciók</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-3">🔐 Autentikáció és Autentifikáció</h3>
                                    <div className="text-sm text-blue-800 space-y-2">
                                        <div><strong>Laravel Breeze:</strong> Scaffolded authentication system</div>
                                        <div><strong>Password Hashing:</strong> bcrypt algoritmus, cost factor 10, automatikus salt</div>
                                        <div><strong>Session Management:</strong> Laravel Sanctum session driver, file-based sessions</div>
                                        <div><strong>Middleware Chain:</strong> Authenticate middleware → RoleMiddleware</div>
                                        <div><strong>CSRF Protection:</strong> VerifyCsrfToken middleware, token validation</div>
                                        <div><strong>Industry Standard:</strong> OWASP Authentication Cheat Sheet követése</div>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-green-900 mb-3">📊 Automatikus Számítások - Algoritmus Részletek</h3>
                                    <div className="text-sm text-green-800 space-y-2">
                                        <div><strong>Metódus:</strong> Leave::calculateWeekdays($startDate, $endDate)</div>
                                        <div><strong>Algoritmus:</strong> Iteratív dátum iteráció Carbon library-vel</div>
                                        <div><strong>Hétköznap Szűrés:</strong> dayOfWeek {'>='} 1 {'&&'} dayOfWeek {'<='} 5 (Carbon API)</div>
                                        <div><strong>Ünnepek:</strong> Leave::getHungarianHolidays($year) statikus metódus</div>
                                        <div><strong>Dinamikus Számítás:</strong> User::calculateRemainingLeaves() - approved + pending</div>
                                        <div><strong>Performance:</strong> O(n) komplexitás, ahol n = napok száma</div>
                                        <div><strong>Edge Cases:</strong> Ünnepek ütközése, hétvége kezelés</div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-purple-900 mb-3">🔔 Értesítési Rendszer - Technikai Implementáció</h3>
                                    <div className="text-sm text-purple-800 space-y-2">
                                        <div><strong>Pattern:</strong> Observer Pattern (event-driven notifications)</div>
                                        <div><strong>Traits:</strong> CreatesNotifications trait újrafelhasználható metódussal</div>
                                        <div><strong>Database:</strong> notifications tábla JSON data mezővel (flexible schema)</div>
                                        <div><strong>Types:</strong> Enum-like string values (leave_requested, leave_approved, stb.)</div>
                                        <div><strong>Read Status:</strong> read_at timestamp (nullable), soft read tracking</div>
                                        <div><strong>API Endpoint:</strong> GET /ertesitesek/olvasatlan-szam (AJAX polling)</div>
                                        <div><strong>Frontend:</strong> useEffect hook 30s polling interval, custom events</div>
                                        <div><strong>Performance:</strong> Indexed user_id + read_at kombináció</div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-yellow-900 mb-3">📝 Aktivitásnaplózás - Audit Trail Pattern</h3>
                                    <div className="text-sm text-yellow-800 space-y-2">
                                        <div><strong>Pattern:</strong> Audit Log / Activity Log pattern</div>
                                        <div><strong>Polymorphic Relations:</strong> target_type + target_id (flexible target tracking)</div>
                                        <div><strong>Metadata:</strong> IP address, user agent (security forensics)</div>
                                        <div><strong>Traits:</strong> LogsActivity trait, protected logActivity() metódus</div>
                                        <div><strong>Action Types:</strong> String-based action identifiers (standardizált)</div>
                                        <div><strong>Query Scopes:</strong> LogController::getActivityLogsForUser() role-based filtering</div>
                                        <div><strong>Industry Standard:</strong> ISO 27001 audit trail követelmények</div>
                                        <div><strong>Data Retention:</strong> Teljes előzmény megőrzése (GDPR compliance)</div>
                                    </div>
                                </div>

                                <div className="bg-pink-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-pink-900 mb-3">📅 Naptár Integráció</h3>
                                    <ul className="text-sm text-pink-800 space-y-2">
                                        <li>• FullCalendar komponens</li>
                                        <li>• Színkódolt kategóriák</li>
                                        <li>• Szerepkör-specifikus nézet</li>
                                        <li>• Havi nézet</li>
                                        <li>• Interaktív események</li>
                                    </ul>
                                </div>

                                <div className="bg-teal-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-teal-900 mb-3">🎨 Modern UI/UX</h3>
                                    <ul className="text-sm text-teal-800 space-y-2">
                                        <li>• Tailwind CSS utility classes</li>
                                        <li>• Reszponzív design</li>
                                        <li>• Hozzáférhetőség (accessibility)</li>
                                        <li>• Konzisztens design rendszer</li>
                                        <li>• Intuitív navigáció</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Workflows */}
                    <div id="workflows" className="mb-16 scroll-mt-8">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">🔄 Munkafolyamatok</h2>
                            
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-blue-900 mb-4">Szabadságkérelm Létrehozása</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">1</div>
                                            <div>
                                                <div className="font-semibold text-blue-900">Tanár kitölti az igénylési formot</div>
                                                <div className="text-sm text-blue-700">Kategória, dátumok, ok megadása</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">2</div>
                                            <div>
                                                <div className="font-semibold text-blue-900">Backend validáció</div>
                                                <div className="text-sm text-blue-700">Elegendő szabadságnap ellenőrzése, dátum validáció</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">3</div>
                                            <div>
                                                <div className="font-semibold text-blue-900">Leave rekord létrehozása</div>
                                                <div className="text-sm text-blue-700">Adatbázisba mentés 'pending' státusszal</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">4</div>
                                            <div>
                                                <div className="font-semibold text-blue-900">Automatikus értesítés</div>
                                                <div className="text-sm text-blue-700">Menedzser értesítése a CreatesNotifications trait-tel</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">5</div>
                                            <div>
                                                <div className="font-semibold text-blue-900">Aktivitásnaplózás</div>
                                                <div className="text-sm text-blue-700">LogsActivity trait rögzíti a műveletet</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-green-900 mb-4">Kérelem Jóváhagyása/Elutasítása</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">1</div>
                                            <div>
                                                <div className="font-semibold text-green-900">Menedzser/Admin megtekinti a kérelmet</div>
                                                <div className="text-sm text-green-700">Részletes információk, előzmények</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">2</div>
                                            <div>
                                                <div className="font-semibold text-green-900">Döntés meghozatala</div>
                                                <div className="text-sm text-green-700">Jóváhagyás/elutasítás/érvénytelenítés gombra kattintás</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">3</div>
                                            <div>
                                                <div className="font-semibold text-green-900">Státusz frissítése</div>
                                                <div className="text-sm text-green-700">Leave model approve/reject/cancel metódusok</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">4</div>
                                            <div>
                                                <div className="font-semibold text-green-900">Előzmény rögzítése</div>
                                                <div className="text-sm text-green-700">LeaveHistory táblába mentés</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">5</div>
                                            <div>
                                                <div className="font-semibold text-green-900">Értesítés küldése</div>
                                                <div className="text-sm text-green-700">Tanár automatikus értesítése a döntésről</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">6</div>
                                            <div>
                                                <div className="font-semibold text-green-900">Szabadságnapok frissítése</div>
                                                <div className="text-sm text-green-700">Dinamikus számítás User model-ben</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-purple-900 mb-4">Backend-Frontend Kommunikáció</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">1</div>
                                            <div>
                                                <div className="font-semibold text-purple-900">Felhasználó interakció</div>
                                                <div className="text-sm text-purple-700">React komponensben gombra kattintás</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">2</div>
                                            <div>
                                                <div className="font-semibold text-purple-900">Inertia form submit</div>
                                                <div className="text-sm text-purple-700">useForm hook POST kérést küld</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">3</div>
                                            <div>
                                                <div className="font-semibold text-purple-900">Laravel route kezeli</div>
                                                <div className="text-sm text-purple-700">Controller metódus futtatása</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">4</div>
                                            <div>
                                                <div className="font-semibold text-purple-900">Adatbázis művelet</div>
                                                <div className="text-sm text-purple-700">Eloquent model műveletek</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">5</div>
                                            <div>
                                                <div className="font-semibold text-purple-900">Inertia response</div>
                                                <div className="text-sm text-purple-700">Controller Inertia::render() vagy redirect</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">6</div>
                                            <div>
                                                <div className="font-semibold text-purple-900">Frontend frissítés</div>
                                                <div className="text-sm text-purple-700">React komponens új props-okkal renderelődik</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conclusion */}
                    <div className="mb-16">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                            <h2 className="text-3xl font-bold mb-4">Összefoglalás</h2>
                            <p className="text-lg mb-6 opacity-90">
                                Ez a szabadságkezelő rendszer egy modern, skálázható webalkalmazás, amely demonstrálja 
                                a Laravel és React együttes használatát Inertia.js-szel. A rendszer robusztus szerepkör-alapú 
                                hozzáférés-vezérléssel, automatikus értesítésekkel és részletes naplózással rendelkezik, 
                                amelyek mindegyike a modern web fejlesztés legjobb gyakorlatait követi.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                    <div className="text-2xl font-bold">MVC</div>
                                    <div className="text-sm opacity-90">Tiszta architektúra</div>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                    <div className="text-2xl font-bold">RBAC</div>
                                    <div className="text-sm opacity-90">Szerepkör-alapú hozzáférés</div>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                    <div className="text-2xl font-bold">SPA</div>
                                    <div className="text-sm opacity-90">Single Page Application</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

