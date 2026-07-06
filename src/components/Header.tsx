import { LogOut, LayoutDashboard, Users, Settings, UserCircle } from 'lucide-react'
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
        <>
            {/* Top Header */}
            <header className="bg-gradient-to-r from-[#0a1628] to-[#1e3a8a] text-white shadow-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex justify-between items-center py-3 md:py-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white rounded-xl shadow-sm p-1">
                                <img src={logo} alt="CSSI Logo" className="w-10 h-10 md:w-16 md:h-16 object-contain" />
                            </div>
                            <h1 className="text-xl md:text-3xl font-extrabold uppercase tracking-tight leading-tight">
                                Alumni <span className="text-[#d4a574] block sm:inline">Portal</span>
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-2 bg-white/10 p-1 rounded-xl backdrop-blur-md mx-4">
                            <button
                                onClick={() => onNavigate('dashboard')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${currentView === 'dashboard' ? 'bg-white text-[#1e3a8a]' : 'hover:bg-white/10'
                                    }`}
                            >
                                <LayoutDashboard size={16} />
                                <span>Dashboard</span>
                            </button>
                            <button
                                onClick={() => onNavigate('directory')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${currentView === 'directory' ? 'bg-white text-[#1e3a8a]' : 'hover:bg-white/10'
                                    }`}
                            >
                                <Users size={16} />
                                <span>Directory</span>
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={() => onNavigate('admin')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${currentView === 'admin' ? 'bg-white text-[#1e3a8a]' : 'hover:bg-white/10'
                                        }`}
                                >
                                    <Settings size={16} />
                                    <span>Manage User</span>
                                </button>
                            )}
                        </nav>

                        <div className="flex items-center gap-2 md:gap-4">
                            <button
                                onClick={() => onNavigate('profile')}
                                className={`flex items-center gap-2 md:gap-3 px-2 py-1 md:px-4 md:py-2 rounded-full transition-all ${currentView === 'profile' ? 'bg-white/20' : 'hover:bg-white/10'
                                    }`}
                            >
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#d4a574] to-[#b8860b] flex items-center justify-center font-bold text-sm md:text-lg shadow-lg">
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
                                className="p-2 md:p-2.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg md:rounded-xl transition-all hover:scale-110 active:scale-95 shadow-lg"
                                title="Logout"
                            >
                                <LogOut size={18} className="md:w-5 md:h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 pb-safe">
                <nav className="flex justify-around items-center h-16">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 ${currentView === 'dashboard' ? 'text-[#1e3a8a]' : 'text-gray-400'}`}
                    >
                        <LayoutDashboard size={20} className={currentView === 'dashboard' ? 'stroke-[2.5px]' : ''} />
                        <span className="text-[10px] font-bold uppercase">Dashboard</span>
                    </button>
                    <button
                        onClick={() => onNavigate('directory')}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 ${currentView === 'directory' ? 'text-[#1e3a8a]' : 'text-gray-400'}`}
                    >
                        <Users size={20} className={currentView === 'directory' ? 'stroke-[2.5px]' : ''} />
                        <span className="text-[10px] font-bold uppercase">Directory</span>
                    </button>
                    <button
                        onClick={() => onNavigate('profile')}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 ${currentView === 'profile' ? 'text-[#1e3a8a]' : 'text-gray-400'}`}
                    >
                        <UserCircle size={20} className={currentView === 'profile' ? 'stroke-[2.5px]' : ''} />
                        <span className="text-[10px] font-bold uppercase">Profile</span>
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => onNavigate('admin')}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${currentView === 'admin' ? 'text-[#1e3a8a]' : 'text-gray-400'}`}
                        >
                            <Settings size={20} className={currentView === 'admin' ? 'stroke-[2.5px]' : ''} />
                            <span className="text-[10px] font-bold uppercase">Admin</span>
                        </button>
                    )}
                </nav>
            </div>
        </>
    )
}
