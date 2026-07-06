import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Briefcase, GraduationCap, MapPin, Search, CreditCard, Calendar, CheckCircle, AlertCircle, X } from 'lucide-react'
import { api, AlumniMember, DuesData } from '../services/api'

interface DashboardProps {
    user: any
    onNavigate: (view: 'dashboard' | 'directory' | 'profile') => void
}

export default function Dashboard({ user, onNavigate }: DashboardProps) {
    const [members, setMembers] = useState<AlumniMember[]>([])
    const [dues, setDues] = useState<DuesData | null>(null)
    const [loading, setLoading] = useState(true)
    const [duesLoading, setDuesLoading] = useState(true)
    const [showDuesDetails, setShowDuesDetails] = useState(false)

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const membersData = await api.fetchMembers()
                setMembers(membersData)
            } catch (error) {
                console.error('Failed to load dashboard stats:', error)
            } finally {
                setLoading(false)
            }
        }

        const loadDues = async () => {
            if (user?.memberId) {
                try {
                    const duesData = await api.getDues(user.memberId)
                    setDues(duesData)
                } catch (error) {
                    console.error('Failed to load dues:', error)
                } finally {
                    setDuesLoading(false)
                }
            }
        }

        loadDashboardData()
        loadDues()
    }, [user?.memberId])

    const industryCount = new Set(members.map((m: AlumniMember) => m.industryField).filter(Boolean)).size
    const yearCount = new Set(members.map((m: AlumniMember) => m.yearOfGraduation).filter(Boolean)).size

    const stats = [
        { label: 'Total Members', value: loading ? '...' : members?.length?.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Industries', value: loading ? '...' : industryCount?.toString(), icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Graduation Years', value: loading ? '...' : yearCount?.toString(), icon: GraduationCap, color: 'text-red-600', bg: 'bg-red-50' },
    ]

    const getDuesBorderColor = (outstanding: number) => {
        if (outstanding <= 0) return 'border-l-green-500';
        if (outstanding <= 1000) return 'border-l-yellow-400';
        if (outstanding <= 2000) return 'border-l-orange-400';
        if (outstanding <= 3000) return 'border-l-red-400';
        if (outstanding <= 4000) return 'border-l-red-600';
        return 'border-l-red-800'; // 5000+
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
                    <div>
                        <h2 className="text-3xl font-black text-[#0a1628] uppercase tracking-tight">
                            Welcome back, <span className="text-[#1e3a8a]">{user.fullName.split(' ')[0]}</span>!
                        </h2>
                        <p className="text-gray-500 font-medium">Here's what's happening in your alumni network.</p>
                    </div>

                    <AnimatePresence>
                        {dues && !duesLoading && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border backdrop-blur-md shadow-sm transition-all ${dues.outstanding <= 0
                                    ? 'bg-green-500/10 text-green-700 border-green-200'
                                    : 'bg-red-500/10 text-red-700 border-red-200'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full animate-pulse ${dues?.outstanding <= 0 ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                <span className="text-xs font-black uppercase tracking-widest">
                                    {dues?.outstanding <= 0 ? 'Account Paid Up' : `₦${dues?.outstanding?.toLocaleString()} Pending`}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
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

            {/* Monthly Dues Card */}
            <div className={`card border-l-4 ${getDuesBorderColor(dues?.outstanding || 0)} bg-white overflow-hidden shadow-xl hover:shadow-2xl transition-shadow`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-2xl">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[#0a1628] uppercase tracking-tight">Monthly Dues Status</h3>
                            <p className="text-gray-500 text-sm font-medium">Financial overview for your alumni membership.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        {dues && (
                            <button
                                onClick={() => setShowDuesDetails(true)}
                                className="px-4 py-2 bg-blue-50 text-[#1e3a8a] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-colors border border-blue-100"
                            >
                                View Detailed History
                            </button>
                        )}
                        {dues && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${dues.outstanding <= 0 ? 'bg-green-50 text-green-700 border-green-100' :
                                dues.outstanding <= 2000 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                <CheckCircle size={14} />
                                Status: {dues?.outstanding > 0 ? `₦${dues?.outstanding?.toLocaleString()} Outstanding` : 'Up to Date'}
                            </div>
                        )}
                    </div>
                </div>

                {duesLoading ? (
                    <div className="flex items-center gap-3 py-4">
                        <div className="w-5 h-5 border-2 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin" />
                        <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading financial data...</span>
                    </div>
                ) : dues ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Paid</p>
                            <p className="text-2xl font-black text-[#1e3a8a]">₦{dues?.totalAmountPaid?.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outstanding</p>
                            <p className={`text-2xl font-black ${dues.outstanding > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                ₦{dues?.outstanding?.toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Due Date</p>
                            <div className="flex items-center gap-2 text-[#0a1628] font-bold">
                                <Calendar size={14} className="text-[#d4a574]" />
                                <span>{dues.nextDueDate || 'None'}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly Commitment</p>
                            <p className="text-xl font-bold text-gray-700">₦{dues?.monthlyDue?.toLocaleString()}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 p-6 rounded-2xl flex items-center gap-4 border border-dashed border-gray-200">
                        <AlertCircle className="text-gray-400" />
                        <p className="text-gray-500 text-sm font-medium italic">We couldn't retrieve your dues information at this time. Please contact the administrator if you believe your Member ID is correct.</p>
                    </div>
                )}

                {dues && dues.detail && (
                    <div className="mt-4 bg-amber-50 p-4 rounded-2xl border border-amber-200">
                        <p className="text-amber-700 text-sm font-medium">{dues.detail}</p>
                    </div>
                )}

                {dues && dues.paidMonthCount > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recent Payment History</h4>
                        <div className="flex flex-wrap gap-2">
                            {dues.paidMonths.slice(-6).map((month: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-100 flex items-center gap-1.5">
                                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                                    {month}
                                </span>
                            ))}
                            {dues.paidMonths.length > 6 && (
                                <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-xs font-bold italic">
                                    +{dues.paidMonths.length - 6} more months
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Dues Details Modal */}
            <AnimatePresence>
                {showDuesDetails && dues && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
                        >
                            <button
                                onClick={() => setShowDuesDetails(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
                            >
                                <X size={20} className="text-white" />
                            </button>

                            <div className="bg-gradient-to-br from-[#1e3a8a] to-[#0a1628] p-8 text-white">
                                <h3 className="text-2xl font-black uppercase tracking-tight">Detailed Dues History</h3>
                                <p className="text-blue-100/80 mt-1 font-medium">Full breakdown of payments for 2025, 2026, and 2027.</p>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[2025, 2026, 2027].map(year => {
                                        const yearData = (dues as any)[`dues${year}`]
                                        return (
                                            <div key={year} className="space-y-4">
                                                <h4 className="text-lg font-black text-[#0a1628] border-b-2 border-[#d4a574] pb-1 inline-block">
                                                    {year}
                                                </h4>
                                                <div className="space-y-2">
                                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                                                        .filter(month => (yearData?.[month] || 0) > 0)
                                                        .map(month => {
                                                            const amount = yearData?.[month] || 0
                                                            return (
                                                                <div key={month} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                                    <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">{month}</span>
                                                                    <span className="font-black text-green-600">
                                                                        ₦{amount?.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )
                                                        })}
                                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                                                        .filter(month => (yearData?.[month] || 0) <= 0).length === 12 && (
                                                            <div className="text-gray-300 text-xs italic p-2">No payments recorded</div>
                                                        )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setShowDuesDetails(false)}
                                    className="btn-primary px-8 py-3"
                                >
                                    Close Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
