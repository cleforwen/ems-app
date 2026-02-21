import { useLogout, useMyHospitals, useSelectHospital } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Building2, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

export function Header() {
    const logout = useLogout();
    const navigate = useNavigate();
    const { data: myHospitals } = useMyHospitals();
    const { mutate: switchHospital, isPending: isSwitching } = useSelectHospital();

    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : { firstName: 'User', lastName: '', role: 'GUEST', hospitalId: 0 };
    const globalToken = localStorage.getItem('token') || '';

    const handleSwitch = (hospitalId: number) => {
        if (hospitalId === user.hospitalId) return;
        switchHospital({ data: { hospitalId }, token: globalToken }, {
            onSuccess: (res) => {
                navigate(`/hospital/${res.hospitalId}/dashboard`);
                // reload to reset react query state
                window.location.reload();
            }
        });
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center text-sm text-muted-foreground gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed" disabled={isSwitching}>
                            <Building2 className="h-4 w-4" />
                            <span className="font-medium">{user.hospitalName || 'MedCore EMR'}</span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                        <DropdownMenuLabel>Your Hospitals</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {myHospitals?.map((h) => (
                            <DropdownMenuItem
                                key={h.id}
                                disabled={h.id === user.hospitalId || isSwitching}
                                onClick={() => handleSwitch(h.id)}
                            >
                                {h.name} {h.id === user.hospitalId && '(Current)'}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center gap-2">
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
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
