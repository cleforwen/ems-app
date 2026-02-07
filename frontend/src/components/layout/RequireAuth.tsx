import { Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthResponse } from '@/hooks/useAuth';

export function RequireAuth({ children }: { children: JSX.Element }) {
    const location = useLocation();
    const { hospitalId } = useParams();
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const user: AuthResponse = JSON.parse(storedUser);

    // If hospitalId is present in URL, verify access
    if (hospitalId && parseInt(hospitalId) !== user.hospitalId) {
        // Redirect to user's actual hospital dashboard
        return <Navigate to={`/hospital/${user.hospitalId}/dashboard`} replace />;
    }

    return children;
}
