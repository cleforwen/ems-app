import { Link, useLocation, useParams } from 'react-router-dom';
import { cn } from '@/utils';
import { LayoutDashboard, Users, UserCog, Building2 } from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: 'patients', icon: Users },
    { name: 'Staff', href: 'users', icon: UserCog, adminOnly: true },
    { name: 'Hospital', href: 'settings', icon: Building2, adminOnly: true },
];

export function Sidebar() {
    const location = useLocation();
    const { hospitalId } = useParams();
    const isAdmin = true; // TODO: Get from auth context

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card">
            <div className="flex h-16 items-center border-b px-6">
                <Building2 className="mr-2 h-6 w-6 text-primary" />
                <span className="text-lg font-bold">MedCore EMR</span>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => {
                    if (item.adminOnly && !isAdmin) return null;

                    const Icon = item.icon;
                    // Check if current path includes the item href
                    const isActive = location.pathname.includes(item.href);

                    return (
                        <Link
                            key={item.name}
                            to={`/hospital/${hospitalId}/${item.href}`}
                            className={cn(
                                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
