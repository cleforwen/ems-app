import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export function Header() {
    const logout = useLogout();

    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : { firstName: 'User', lastName: '', role: 'GUEST' };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{user.hospitalName || 'MedCore EMR'}</span>
                <span className="mx-2">•</span>
                <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="hidden flex-col md:flex">
                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-muted-foreground">{user.roles?.[0] || user.role}</span>
                    </div>
                </div>

                <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>
        </header>
    );
}
