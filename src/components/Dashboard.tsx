import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Briefcase, GraduationCap, MapPin, Search } from 'lucide-react'
import { api, AlumniMember } from '../services/api'

interface DashboardProps {
    user: any
    onNavigate: (view: 'dashboard' | 'directory' | 'profile') => void
}

export default function Dashboard({ user, onNavigate }: DashboardProps) {
    const [members, setMembers] = useState<AlumniMember[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await api.fetchMembers()
                setMembers(data)
            } catch (error) {
                console.error('Failed to load dashboard stats:', error)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    const industryCount = new Set(members.map(m => m.industryField).filter(Boolean)).size
    const yearCount = new Set(members.map(m => m.yearOfGraduation).filter(Boolean)).size

    const stats = [
        { label: 'Total Members', value: loading ? '...' : members.length.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Industries', value: loading ? '...' : industryCount.toString(), icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Graduation Years', value: loading ? '...' : yearCount.toString(), icon: GraduationCap, color: 'text-red-600', bg: 'bg-red-50' },
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-[#0a1628] uppercase tracking-tight">
                        Welcome back, <span className="text-[#1e3a8a]">{user.fullName.split(' ')[0]}</span>!
                    </h2>
                    <p className="text-gray-500 font-medium">Here's what's happening in your alumni network.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#1e3a8a] bg-blue-50 px-4 py-2 rounded-full border border-blue-100 italic">
                    <MapPin size={16} />
                    {user.house || 'Main'} House
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card group hover:border-[#1e3a8a]/30"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                                <p className="text-4xl font-black text-[#0a1628] mt-1">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card h-full">
                    <h3 className="text-xl font-black text-[#0a1628] uppercase tracking-tight mb-6 border-b-2 border-blue-600 pb-2 inline-block">
                        Your Profile Highlights
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <Briefcase size={20} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Current Role</p>
                                <p className="text-lg font-bold text-[#1e3a8a]">{user.currentOccupation || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{user.companyOrganization || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <GraduationCap size={20} className="text-gray-600" />
                            </div>
                            <div>
                                <div>
                                    <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Class Year</p>
                                    <p className="text-lg font-bold text-[#1e3a8a]">{user.yearOfGraduation}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => onNavigate('profile')}
                                className="flex items-center gap-2 text-sm font-bold uppercase text-[#d4a574] hover:text-[#b8860b] transition-colors"
                            >
                                Complete your profile
                                <span className="text-xl">→</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-[#1e3a8a] to-[#0a1628] text-white overflow-hidden relative border-none">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Explore the Directory</h3>
                        <p className="text-blue-100 mb-8 max-w-sm">
                            Connect with {loading ? 'fellow' : `over ${members.length}`} alumni professionals across various industries worldwide.
                        </p>
                        <button
                            onClick={() => onNavigate('directory')}
                            className="bg-[#d4a574] hover:bg-[#b8860b] text-[#0a1628] font-black uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-3"
                        >
                            <Search size={20} />
                            Open Directory
                        </button>
                    </div>
                    {/* Abstract Circle */}
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
                        <Users size={300} strokeWidth={0.5} />
                    </div>
                </div>
            </div>
        </div>
    )
}
