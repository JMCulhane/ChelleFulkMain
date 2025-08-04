import { JSX, useState } from "react";
import { Disclosure, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Link } from "react-router-dom";

type NavItem = {
  name: string;
  href: string;
  current: boolean;
};

const initialNavigation: NavItem[] = [
  { name: 'Home', href: '/', current: true },
  { name: 'Videos', href: '#', current: false },
  { name: 'Contact', href: '/contact', current: false },
  { name: 'Events', href: '#', current: false },
  { name: 'Recordings', href: '/recordings', current: false },
  // { name: 'Calendar', href: '/calendar', current: false }
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Navbar: React.FC = (): JSX.Element => {
  const [navigation, setNavigation] = useState<NavItem[]>(initialNavigation);

  const updateUserLocation = (name: string): void => {
    setNavigation(prev =>
      prev.map(item => ({
        ...item,
        current: item.name === name,
      }))
    );
  };

  return (
    <Disclosure as="nav" className="bg-black">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 justify-center">
            <div className="flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  aria-current={item.current ? 'page' : undefined}
                  className={classNames(
                    item.current
                      ? 'bg-yellow-400'
                      : 'text-neutral-50 hover:bg-yellow-400/80',
                    'rounded-md px-3 py-2 text-sm font-medium',
                    'font-fell',
                    'text-xl'
                  )}
                  onClick={(e) => {
                    updateUserLocation(item.name);
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <Menu as="div" className="relative">
              <MenuButton
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-50 hover:bg-yellow-400/80 font-fell text-xl"
              >
                Projects
              </MenuButton>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none"
              >
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Anthem
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Keltish
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Ladies of Loudness
                  </a>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>
    </Disclosure>
  );
};

export default Navbar;
