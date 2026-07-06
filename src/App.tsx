import { useState, useEffect } from 'react'
import Header from './components/Header'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import Directory from './components/Directory'
import Admin from './components/Admin'

type ViewType = 'dashboard' | 'directory' | 'profile' | 'admin'

function App() {
    const [user, setUser] = useState<any>(null)
    const [currentView, setCurrentView] = useState<ViewType>('dashboard')

    useEffect(() => {
        const savedUser = localStorage.getItem('alumni_user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }

        // Security: Block right-click and dev tools shortcuts
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12') e.preventDefault();
            // Ctrl/Cmd + Shift + I/J/C
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) e.preventDefault();
            // Ctrl/Cmd + U (Source)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') e.preventDefault();
            // Ctrl/Cmd + S (Save)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') e.preventDefault();
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('alumni_user')
        setUser(null)
    }

    const canManageUsers = () => {
        if (!user) return false
        const role = String(user.role || '').toLowerCase()
        return role === 'admin' || role === 'welfare' || role === 'finance' || user.email === 'rolaitankamal@gmail.com'
    }

    if (!user) {
        return <Auth onLogin={setUser} />
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <Header
                user={user}
                onLogout={handleLogout}
                onNavigate={setCurrentView}
                currentView={currentView}
                isAdmin={canManageUsers()}
            />
            <main className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8 max-w-7xl">
                {currentView === 'dashboard' && <Dashboard user={user} onNavigate={setCurrentView} />}
                {currentView === 'directory' && <Directory />}
                {currentView === 'profile' && <Profile user={user} onUpdate={setUser} />}
                {currentView === 'admin' && canManageUsers() && <Admin user={user} />}
            </main>
        </div>
    )
}

export default App
