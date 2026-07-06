import { LogOut, LayoutDashboard, Users, Settings } from 'lucide-react'
import logo from '../assets/images/logo.png'

interface HeaderProps {
    user: any
    onLogout: () => void
    onNavigate: (view: any) => void
    currentView: string
    isAdmin?: boolean
}

export default function Header({ user, onLogout, onNavigate, currentView, isAdmin }: HeaderProps) {
    return (
        <header className="bg-gradient-to-r from-[#0a1628] to-[#1e3a8a] text-white shadow-xl sticky top-0 z-50">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white rounded-xl shadow-sm">
                                <img src={logo} alt="CSSI Logo" className="w-16 h-16 object-contain" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight">
                                Alumni <span className="text-[#d4a574]">Portal</span>
                            </h1>
                        </div>

                        <nav className="flex items-center gap-2 bg-white/10 p-1 rounded-xl backdrop-blur-md ml-4">
                            <button
                                onClick={() => onNavigate('dashboard')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${currentView === 'dashboard' ? 'bg-white text-[#1e3a8a]' : 'hover:bg-white/10'
                                    }`}
                            >
                                <LayoutDashboard size={16} />
                                <span className="hidden sm:inline">Dashboard</span>
                            </button>
                            <button
                                onClick={() => onNavigate('directory')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${currentView === 'directory' ? 'bg-white text-[#1e3a8a]' : 'hover:bg-white/10'
                                    }`}
                            >
                                <Users size={16} />
                                <span className="hidden sm:inline">Directory</span>
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={() => onNavigate('admin')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${currentView === 'admin' ? 'bg-white text-[#1e3a8a]' : 'hover:bg-white/10'
                                        }`}
                                >
                                    <Settings size={16} />
                                    <span className="hidden sm:inline">Manage User</span>
                                </button>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onNavigate('profile')}
                            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all ${currentView === 'profile' ? 'bg-white/20' : 'hover:bg-white/10'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4a574] to-[#b8860b] flex items-center justify-center font-bold text-lg shadow-lg">
                                {user.fullName?.[0] || 'A'}
                            </div>
                            <div className="text-left hidden lg:block">
                                <div className="text-sm font-bold leading-none">{user.fullName}</div>
                                <div className="text-[10px] text-white/70 uppercase tracking-widest mt-1">
                                    {user.memberId}
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={onLogout}
                            className="p-2.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl transition-all hover:scale-110 active:scale-95 shadow-lg"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
