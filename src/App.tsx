import { useState, useEffect } from 'react'
import Header from './components/Header'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import Directory from './components/Directory'

function App() {
    const [user, setUser] = useState<any>(null)
    const [currentView, setCurrentView] = useState<'dashboard' | 'directory' | 'profile'>('dashboard')

    useEffect(() => {
        const savedUser = localStorage.getItem('alumni_user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('alumni_user')
        setUser(null)
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
            />
            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {currentView === 'dashboard' && <Dashboard user={user} onNavigate={setCurrentView} />}
                {currentView === 'directory' && <Directory />}
                {currentView === 'profile' && <Profile user={user} onUpdate={setUser} />}
            </main>
        </div>
    )
}

export default App
