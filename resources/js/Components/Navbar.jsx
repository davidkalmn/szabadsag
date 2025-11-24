import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';

export default function Navbar() {
    const { auth } = usePage().props;
    const user = auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread notifications count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await fetch(route('ertesitesek.unread-count'));
                const data = await response.json();
                setUnreadCount(data.count);
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        fetchUnreadCount();
        
        // Refresh count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        
        // Listen for custom events when notifications are marked as read
        const handleNotificationRead = () => {
            fetchUnreadCount();
        };

        window.addEventListener('notification-read', handleNotificationRead);
        window.addEventListener('notifications-read-all', handleNotificationRead);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('notification-read', handleNotificationRead);
            window.removeEventListener('notifications-read-all', handleNotificationRead);
        };
    }, []);

    // Define navigation items based on user role
    const getNavigationItems = () => {
        const items = [
            {
                name: 'Dashboard',
                href: route('dashboard'),
                route: 'dashboard',
                roles: ['teacher', 'manager', 'admin']
            }
        ];

        // Szabadságok (Leaves) section
        const leaveItems = [
            {
                name: 'Saját kérelmek',
                href: route('szabadsag.sajat-kerelmek'),
                route: 'szabadsag.sajat-kerelmek',
                roles: ['teacher', 'manager', 'admin']
            },
            {
                name: 'Új igénylés',
                href: route('szabadsag.igenyles'),
                route: 'szabadsag.igenyles',
                roles: ['teacher', 'manager', 'admin']
            }
        ];

        // Only Manager can see team requests (admins see all requests instead)
        if (user.role === 'manager') {
            leaveItems.push({
                name: 'Csapat kérelmek',
                href: route('szabadsag.kerelmek'),
                route: 'szabadsag.kerelmek',
                roles: ['manager']
            });
        }

        // Only Admin can see all requests
        if (user.role === 'admin') {
            leaveItems.push({
                name: 'Összes kérelem',
                href: route('szabadsag.osszes-kerelem'),
                route: 'szabadsag.osszes-kerelem',
                roles: ['admin']
            });
        }

        // Admin only items
        const adminItems = [];
        // Note: Napló is now available to all users, so no admin-only items for now

        // Manager and Admin can see Users
        const userManagementItems = [];
        if (['manager', 'admin'].includes(user.role)) {
            userManagementItems.push({
                name: 'Felhasználók',
                href: route('felhasznalok.index'),
                route: 'felhasznalok.index',
                roles: ['manager', 'admin']
            });
        }

        // Common items for all users
        const commonItems = [
            {
                name: 'Értesítések',
                href: route('ertesitesek.index'),
                route: 'ertesitesek.index',
                roles: ['teacher', 'manager', 'admin']
            },
            {
                name: 'GYIK',
                href: route('gyik'),
                route: 'gyik',
                roles: ['teacher', 'manager', 'admin']
            },
            {
                name: 'Bemutatás',
                href: route('bemutatas'),
                route: 'bemutatas',
                roles: ['teacher', 'manager', 'admin']
            }
        ];

        // Logs only for managers and admins
        if (['manager', 'admin'].includes(user.role)) {
            commonItems.push({
                name: 'Napló',
                href: route('naplo.index'),
                route: 'naplo.index',
                roles: ['manager', 'admin']
            });
        }

        return {
            main: items,
            leaves: leaveItems,
            admin: adminItems,
            userManagement: userManagementItems,
            common: commonItems
        };
    };

    const navigationItems = getNavigationItems();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white">
            <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-6">
                <div className="flex h-16 justify-between">
                    {/* Logo and main navigation */}
                    <div className="flex">
                        <div className="flex shrink-0 items-center">
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>
                        </div>

                        {/* Desktop navigation */}
                        <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                            {/* Group 1: Main navigation (Dashboard, Szabadságok) */}
                            {/* Main navigation */}
                            {navigationItems.main.map((item) => (
                                <NavLink
                                    key={item.name}
                                    href={item.href}
                                    active={route().current(item.route)}
                                >
                                    {item.name}
                                </NavLink>
                            ))}

                            {/* Szabadságok dropdown */}
                            <div className="relative inline-flex items-center">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className={`inline-flex h-16 items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
                                                route().current('szabadsag.*')
                                                    ? 'border-indigo-400 text-gray-900 focus:border-indigo-700'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700'
                                            }`}
                                        >
                                            Szabadságok
                                            <svg
                                                className="-me-0.5 ms-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        {navigationItems.leaves.map((item) => (
                                            <Dropdown.Link
                                                key={item.name}
                                                href={item.href}
                                            >
                                                {item.name}
                                            </Dropdown.Link>
                                        ))}
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            {/* Separator 1: Between Group 1 and Group 2 */}
                            {(navigationItems.userManagement.length > 0 || navigationItems.common.some(item => item.name === 'Értesítések' || item.name === 'Napló')) && (
                                <div className="h-8 w-px bg-gray-300 self-center"></div>
                            )}

                            {/* Group 2: User Management and System items (Felhasználók, Értesítések, Napló) */}
                            {/* Admin navigation */}
                            {navigationItems.admin.map((item) => (
                                <NavLink
                                    key={item.name}
                                    href={item.href}
                                    active={route().current(item.route)}
                                >
                                    {item.name}
                                </NavLink>
                            ))}

                            {/* User Management navigation */}
                            {navigationItems.userManagement.map((item) => (
                                <NavLink
                                    key={item.name}
                                    href={item.href}
                                    active={route().current(item.route)}
                                >
                                    {item.name}
                                </NavLink>
                            ))}

                            {/* Értesítések and Napló from common items */}
                            {navigationItems.common.filter(item => item.name === 'Értesítések' || item.name === 'Napló').map((item) => (
                                <NavLink
                                    key={item.name}
                                    href={item.href}
                                    active={route().current(item.route)}
                                >
                                    <div className="flex items-center">
                                        <span>{item.name}</span>
                                        {item.name === 'Értesítések' && unreadCount > 0 && (
                                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-medium leading-none text-green-700 bg-green-100 rounded-full">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </NavLink>
                            ))}

                            {/* Separator 2: Between Group 2 and Group 3 */}
                            {navigationItems.common.some(item => item.name === 'GYIK' || item.name === 'Bemutatás') && (
                                <div className="h-8 w-px bg-gray-300 self-center"></div>
                            )}

                            {/* Group 3: General items (GYIK, Bemutatás) */}
                            {navigationItems.common.filter(item => item.name === 'GYIK' || item.name === 'Bemutatás').map((item) => (
                                <NavLink
                                    key={item.name}
                                    href={item.href}
                                    active={route().current(item.route)}
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* User menu */}
                    <div className="hidden sm:ms-6 sm:flex sm:items-center">
                        <div className="relative ms-3">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md h-16">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                        >
                                            {user.name}
                                            <span className="ml-2 rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">
                                                {user.role === 'teacher' ? 'Tanár' : 
                                                 user.role === 'manager' ? 'Menedzser' : 
                                                 user.role === 'admin' ? 'Admin' : user.role}
                                            </span>
                                            <svg
                                                className="-me-0.5 ms-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link
                                        href={route('beallitasok.edit')}
                                    >
                                        Beállítások
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        Kijelentkezés
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-me-2 flex items-center sm:hidden">
                        <button
                            onClick={() =>
                                setShowingNavigationDropdown(
                                    (previousState) => !previousState,
                                )
                            }
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                        >
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    className={
                                        !showingNavigationDropdown
                                            ? 'inline-flex'
                                            : 'hidden'
                                    }
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                                <path
                                    className={
                                        showingNavigationDropdown
                                            ? 'inline-flex'
                                            : 'hidden'
                                    }
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile navigation */}
            <div
                className={
                    (showingNavigationDropdown ? 'block' : 'hidden') +
                    ' sm:hidden'
                }
            >
                <div className="space-y-1 pb-3 pt-2">
                    {/* Group 1: Main navigation (Dashboard, Szabadságok) */}
                    {/* Main navigation */}
                    {navigationItems.main.map((item) => (
                        <ResponsiveNavLink
                            key={item.name}
                            href={item.href}
                            active={route().current(item.route)}
                        >
                            {item.name}
                        </ResponsiveNavLink>
                    ))}

                    {/* Szabadságok section */}
                    <div className="px-4 py-2">
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Szabadságok
                        </div>
                    </div>
                    {navigationItems.leaves.map((item) => (
                        <ResponsiveNavLink
                            key={item.name}
                            href={item.href}
                            active={route().current(item.route)}
                            className="pl-8"
                        >
                            {item.name}
                        </ResponsiveNavLink>
                    ))}

                    {/* Separator 1: Between Group 1 and Group 2 */}
                    {(navigationItems.admin.length > 0 || navigationItems.userManagement.length > 0 || navigationItems.common.some(item => item.name === 'Értesítések' || item.name === 'Napló')) && (
                        <div className="mx-4 border-t border-gray-200"></div>
                    )}

                    {/* Group 2: Admin, User Management, and System items */}
                    {/* Admin section */}
                    {navigationItems.admin.length > 0 && (
                        <>
                            <div className="px-4 py-2">
                                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    Admin
                                </div>
                            </div>
                            {navigationItems.admin.map((item) => (
                                <ResponsiveNavLink
                                    key={item.name}
                                    href={item.href}
                                    active={route().current(item.route)}
                                    className="pl-8"
                                >
                                    {item.name}
                                </ResponsiveNavLink>
                            ))}
                        </>
                    )}

                    {/* User Management section */}
                    {navigationItems.userManagement.length > 0 && (
                        <>
                            <div className="px-4 py-2">
                                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    Felhasználók
                                </div>
                            </div>
                            {navigationItems.userManagement.map((item) => (
                                <ResponsiveNavLink
                                    key={item.name}
                                    href={item.href}
                                    active={route().current(item.route)}
                                    className="pl-8"
                                >
                                    {item.name}
                                </ResponsiveNavLink>
                            ))}
                        </>
                    )}

                    {/* Értesítések and Napló from common items */}
                    {navigationItems.common.filter(item => item.name === 'Értesítések' || item.name === 'Napló').map((item) => (
                        <ResponsiveNavLink
                            key={item.name}
                            href={item.href}
                            active={route().current(item.route)}
                        >
                            <div className="flex items-center justify-between">
                                <span>{item.name}</span>
                                {item.name === 'Értesítések' && unreadCount > 0 && (
                                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-medium leading-none text-green-700 bg-green-100 rounded-full">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </div>
                        </ResponsiveNavLink>
                    ))}

                    {/* Separator 2: Between Group 2 and Group 3 */}
                    {navigationItems.common.some(item => item.name === 'GYIK' || item.name === 'Bemutatás') && (
                        <div className="mx-4 border-t border-gray-200"></div>
                    )}

                    {/* Group 3: General items (GYIK, Bemutatás) */}
                    {navigationItems.common.filter(item => item.name === 'GYIK' || item.name === 'Bemutatás').map((item) => (
                        <ResponsiveNavLink
                            key={item.name}
                            href={item.href}
                            active={route().current(item.route)}
                        >
                            {item.name}
                        </ResponsiveNavLink>
                    ))}
                </div>

                {/* Mobile user menu */}
                <div className="border-t border-gray-200 pb-1 pt-4">
                    <div className="px-4">
                        <div className="text-base font-medium text-gray-800">
                            {user.name}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                            {user.email}
                        </div>
                        <div className="mt-1">
                            <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">
                                {user.role === 'teacher' ? 'Tanár' : 
                                 user.role === 'manager' ? 'Menedzser' : 
                                 user.role === 'admin' ? 'Admin' : user.role}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 space-y-1">
                        <ResponsiveNavLink href={route('beallitasok.edit')}>
                            Beállítások
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            method="post"
                            href={route('logout')}
                            as="button"
                        >
                            Kijelentkezés
                        </ResponsiveNavLink>
                    </div>
                </div>
            </div>
        </nav>
    );
}
