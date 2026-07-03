import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Home, FolderKanban, LogOut } from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200">
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">Control Panel</h1>
                    </div>
                    <nav className="flex-1 p-4 space-y-1">
                        <Link
                            to="/"
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
                        >
                            <Home className="w-5 h-5" />
                            Dashboard
                        </Link>
                        <Link
                            to="/projects"
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
                        >
                            <FolderKanban className="w-5 h-5" />
                            Projects
                        </Link>
                    </nav>
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
