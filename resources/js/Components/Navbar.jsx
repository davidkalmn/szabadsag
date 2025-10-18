import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';

export default function Navbar() {
    const { auth } = usePage().props;
    const user = auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

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

        // Manager and Admin can see team requests
        if (['manager', 'admin'].includes(user.role)) {
            leaveItems.push({
                name: 'Csapat kérelmek',
                href: route('szabadsag.kerelmek'),
                route: 'szabadsag.kerelmek',
                roles: ['manager', 'admin']
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

        // Naptár (Calendar) section
        const calendarItems = [
            {
                name: 'Saját naptár',
                href: route('naptar.sajat-kerelmek'),
                route: 'naptar.sajat-kerelmek',
                roles: ['teacher', 'manager', 'admin']
            }
        ];

        if (['manager', 'admin'].includes(user.role)) {
            calendarItems.push({
                name: 'Csapat naptár',
                href: route('naptar.kerelmek'),
                route: 'naptar.kerelmek',
                roles: ['manager', 'admin']
            });
        }

        if (user.role === 'admin') {
            calendarItems.push({
                name: 'Összes naptár',
                href: route('naptar.osszes'),
                route: 'naptar.osszes',
                roles: ['admin']
            });
        }

        // Admin only items
        const adminItems = [];
        if (user.role === 'admin') {
            adminItems.push(
                {
                    name: 'Felhasználók',
                    href: route('felhasznalok.index'),
                    route: 'felhasznalok.index',
                    roles: ['admin']
                },
                {
                    name: 'Napló',
                    href: route('naplo.index'),
                    route: 'naplo.index',
                    roles: ['admin']
                }
            );
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
            }
        ];

        return {
            main: items,
            leaves: leaveItems,
            calendar: calendarItems,
            admin: adminItems,
            common: commonItems
        };
    };

    const navigationItems = getNavigationItems();

    return (
        <nav className="border-b border-gray-100 bg-white">
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

                            {/* Naptár dropdown */}
                            <div className="relative inline-flex items-center">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className={`inline-flex h-16 items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
                                                route().current('naptar.*')
                                                    ? 'border-indigo-400 text-gray-900 focus:border-indigo-700'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700'
                                            }`}
                                        >
                                                Naptár
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
                                        {navigationItems.calendar.map((item) => (
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

                            {/* Common navigation */}
                            {navigationItems.common.map((item) => (
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

                    {/* Naptár section */}
                    <div className="px-4 py-2">
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Naptár
                        </div>
                    </div>
                    {navigationItems.calendar.map((item) => (
                        <ResponsiveNavLink
                            key={item.name}
                            href={item.href}
                            active={route().current(item.route)}
                            className="pl-8"
                        >
                            {item.name}
                        </ResponsiveNavLink>
                    ))}

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

                    {/* Common navigation */}
                    {navigationItems.common.map((item) => (
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
