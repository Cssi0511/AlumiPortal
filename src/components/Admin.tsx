import { useState, useEffect } from 'react'
import { Users, BarChart3, AlertCircle, CheckCircle, Settings, Download, Edit2, Mail, Save, X } from 'lucide-react'
import { api, AlumniMember, DuesData } from '../services/api'

interface AdminProps {
    user: any
}

interface NotificationForm {
    type: 'single' | 'bulk'
    subject: string
    message: string
    selectedMembers: string[]
}

export default function Admin({ user }: AdminProps) {
    const role = String(user.role || '').toLowerCase()
    const isSuperAdmin = user.email === 'rolaitankamal@gmail.com'
    const isRoleAdmin = role === 'admin' || isSuperAdmin
    const isRoleFinance = role === 'finance'
    const isRoleWelfare = role === 'welfare'

    const availableTabs: ('overview' | 'dues' | 'verify' | 'notifications')[] = (() => {
        if (isRoleAdmin) return ['overview', 'dues', 'verify', 'notifications'];
        if (isRoleFinance) return ['dues', 'notifications'];
        if (isRoleWelfare) return ['overview', 'notifications'];
        return [];
    })()

    const [members, setMembers] = useState<AlumniMember[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'overview' | 'dues' | 'verify' | 'notifications'>(
        availableTabs[0] || 'overview'
    )
    const [selectedMember, setSelectedMember] = useState<AlumniMember | null>(null)
    const [viewMemberModal, setViewMemberModal] = useState<AlumniMember | null>(null)
    const [showDuesModal, setShowDuesModal] = useState(false)
    const [showNotificationModal, setShowNotificationModal] = useState(false)
    const [selectedMemberDues, setSelectedMemberDues] = useState<DuesData | null>(null)
    const [duesLoading, setDuesLoading] = useState(false)
    const [duesForm, setDuesForm] = useState({
        year: new Date().getFullYear(),
        month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date()),
        amount: 1000
    })
    const [notificationForm, setNotificationForm] = useState<NotificationForm>({
        type: 'single',
        subject: '',
        message: '',
        selectedMembers: []
    })
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeDues: 0,
        outstandingAmount: 0,
        paidAmount: 0
    })
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const loadMembers = async () => {
        setLoading(true)
        try {
            const membersData = await api.fetchMembers()
            setMembers(membersData)
            
            let totalActive = 0
            membersData.forEach((member: AlumniMember) => {
                if (member.membershipDues === 'Yes') {
                    totalActive++
                }
            })
            
            const statsData = await api.getDuesStats()
            
            setStats({
                totalMembers: membersData.length,
                activeDues: totalActive,
                outstandingAmount: statsData.totalOutstanding,
                paidAmount: statsData.totalPaid
            })
        } catch (error) {
            console.error('Failed to load admin data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadMembers()
    }, [])

    const filteredMembers = members.filter(member =>
        member.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.memberId?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleOpenDuesModal = async (member: AlumniMember) => {
        setSelectedMember(member)
        setShowDuesModal(true)
        setDuesLoading(true)
        try {
            const duesData = await api.getDues(member.memberId)
            setSelectedMemberDues(duesData)
        } catch (error) {
            console.error("Error loading dues:", error)
        } finally {
            setDuesLoading(false)
        }
    }

    const handleUpdateDues = async () => {
        if (!selectedMember) return
        try {
            const result = await api.updateMemberDues(selectedMember.memberId, duesForm)
            setActionMessage({ type: result.success ? 'success' : 'error', text: result.message })
            if (result.success) {
                // Refresh dues data for the member
                handleOpenDuesModal(selectedMember)
                // Also reload dashboard stats
                loadMembers()
            }
        } catch (error) {
            setActionMessage({ type: 'error', text: 'Failed to update dues' })
        }
    }

    const handleVerifyUser = async (email: string, verified: boolean) => {
        try {
            const result = await api.verifyUser(email, verified)
            setActionMessage({ type: result.success ? 'success' : 'error', text: result.message })
            if (result.success) {
                // Reload members from backend to get generated Member ID and updated verification status
                loadMembers()
            }
        } catch (error) {
            setActionMessage({ type: 'error', text: 'Failed to verify user' })
        }
    }

    const handleSendNotification = async () => {
        const recipientIds = notificationForm.type === 'bulk' ? notificationForm.selectedMembers : [selectedMember?.memberId || '']
        
        if (!notificationForm.subject || !notificationForm.message) {
            setActionMessage({ type: 'error', text: 'Subject and message are required' })
            return
        }

        if (recipientIds.length === 0 || !recipientIds[0]) {
            setActionMessage({ type: 'error', text: 'Please select at least one recipient' })
            return
        }

        try {
            const result = await api.sendNotification(recipientIds, notificationForm.subject, notificationForm.message, notificationForm.type === 'bulk')
            setActionMessage({ type: result.success ? 'success' : 'error', text: result.message })
            if (result.success) {
                setShowNotificationModal(false)
                setNotificationForm({ type: 'single', subject: '', message: '', selectedMembers: [] })
                setSelectedMember(null)
            }
        } catch (error) {
            setActionMessage({ type: 'error', text: 'Failed to send notification' })
        }
    }

    return (
        <div className="space-y-8">
            {/* Admin Header */}
            <div className="bg-gradient-to-r from-[#0a1628] to-[#1e3a8a] text-white rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                        <Settings size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Administration Console</h2>
                        <p className="text-blue-100 mt-2">Manage alumni members, dues, and communications</p>
                    </div>
                </div>
            </div>

            {/* Action Message */}
            {actionMessage && (
                <div className={`p-4 rounded-2xl flex items-center justify-between ${actionMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-3">
                        {actionMessage.type === 'success' ? <CheckCircle size={20} className="text-green-600" /> : <AlertCircle size={20} className="text-red-600" />}
                        <p className={actionMessage.type === 'success' ? 'text-green-700' : 'text-red-700'} >{actionMessage.text}</p>
                    </div>
                    <button onClick={() => setActionMessage(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div 
                    className={`card bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow ${availableTabs.includes('overview') ? 'cursor-pointer' : 'opacity-60'}`} 
                    onClick={() => availableTabs.includes('overview') && setActiveTab('overview')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Members</h3>
                        <Users size={20} className="text-[#1e3a8a]" />
                    </div>
                    <p className="text-3xl font-black text-[#1e3a8a]">{stats.totalMembers}</p>
                </div>

                <div 
                    className={`card bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow ${availableTabs.includes('dues') ? 'cursor-pointer' : 'opacity-60'}`} 
                    onClick={() => availableTabs.includes('dues') && setActiveTab('dues')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Dues</h3>
                        <CheckCircle size={20} className="text-green-600" />
                    </div>
                    <p className="text-3xl font-black text-green-600">{stats.activeDues}</p>
                </div>

                <div 
                    className={`card bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow ${availableTabs.includes('verify') ? 'cursor-pointer' : 'opacity-60'}`} 
                    onClick={() => availableTabs.includes('verify') && setActiveTab('verify')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Paid</h3>
                        <BarChart3 size={20} className="text-green-600" />
                    </div>
                    <p className="text-3xl font-black text-green-600">₦{stats.paidAmount.toLocaleString()}</p>
                </div>

                <div 
                    className={`card bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow ${availableTabs.includes('notifications') ? 'cursor-pointer' : 'opacity-60'}`} 
                    onClick={() => availableTabs.includes('notifications') && setActiveTab('notifications')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outstanding</h3>
                        <AlertCircle size={20} className="text-red-600" />
                    </div>
                    <p className="text-3xl font-black text-red-600">₦{stats.outstandingAmount.toLocaleString()}</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="card bg-white rounded-2xl shadow-lg overflow-hidden p-0 md:p-0">
                <div className="border-b border-gray-200 flex overflow-x-auto hide-scrollbar">
                    {availableTabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap flex-1 px-4 md:px-6 py-4 text-xs md:text-sm font-black uppercase text-center transition-all border-b-2 ${
                                activeTab === tab 
                                    ? 'border-[#1e3a8a] text-[#1e3a8a] bg-blue-50' 
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab === 'overview' && 'Overview'}
                            {tab === 'dues' && 'Manage Dues'}
                            {tab === 'verify' && 'Verify Users'}
                            {tab === 'notifications' && 'Send Notifications'}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="p-4 md:p-8">
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search by name, email, or member ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                            />
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin" />
                            </div>
                        ) : filteredMembers.length > 0 ? (
                            <>
                            {/* Mobile card view */}
                            <div className="md:hidden space-y-3">
                                {filteredMembers.map((member, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-black text-[#1e3a8a] text-sm">{member.fullName}</p>
                                                <p className="text-[11px] text-gray-500 font-bold">{member.memberId}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${member.verification ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {member.verification ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mb-1">{member.email}</p>
                                        <p className="text-xs text-gray-500 truncate mb-3">{member.companyOrganization}</p>
                                        <button
                                            onClick={() => setViewMemberModal(member)}
                                            className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {/* Desktop table view */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Member ID</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Full Name</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Email</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Phone</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Company</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMembers.map((member, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-[#1e3a8a]">{member.memberId}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">{member.fullName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{member.phoneNumber}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 truncate">{member.companyOrganization}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${member.verification ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {member.verification ? 'Verified' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => setViewMemberModal(member)}
                                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="mx-auto mb-4 text-gray-400" size={32} />
                                <p className="text-gray-500 font-medium">No members found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Manage Dues Tab */}
                {activeTab === 'dues' && (
                    <div className="p-4 md:p-8">
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search member to update dues..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                            />
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin" />
                            </div>
                        ) : filteredMembers.length > 0 ? (
                            <div className="grid gap-4">
                                {filteredMembers.map((member, idx) => (
                                    <div key={idx} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{member.fullName}</h4>
                                                <p className="text-sm text-gray-600">{member.memberId} • {member.email}</p>
                                            </div>
                                            <button
                                                onClick={() => handleOpenDuesModal(member)}
                                                className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] hover:bg-[#0a1628] text-white rounded-lg font-bold text-sm transition-all"
                                            >
                                                <Edit2 size={16} />
                                                Update Dues
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="mx-auto mb-4 text-gray-400" size={32} />
                                <p className="text-gray-500 font-medium">No members found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Verify Users Tab */}
                {activeTab === 'verify' && (
                    <div className="p-4 md:p-8">
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search member to verify..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                            />
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin" />
                            </div>
                        ) : filteredMembers.length > 0 ? (
                            <div className="grid gap-4">
                                {filteredMembers.map((member, idx) => (
                                    <div key={idx} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800">{member.fullName}</h4>
                                                <p className="text-sm text-gray-600">{member.memberId} • {member.email}</p>
                                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${member.verification ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {member.verification ? 'Verified' : 'Unverified'}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 capitalize">
                                                        {member.role || 'user'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 items-center flex-wrap">
                                                {!member.verification && (
                                                    <button
                                                        onClick={() => handleVerifyUser(member.email, true)}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-all"
                                                    >
                                                        Verify
                                                    </button>
                                                )}
                                                {member.verification && (
                                                    <button
                                                        onClick={() => handleVerifyUser(member.email, false)}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-all"
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                                <select
                                                    defaultValue={member.role || 'user'}
                                                    onChange={async (e) => {
                                                        const result = await api.changeRole(member.email, e.target.value as any)
                                                        setActionMessage({ type: result.success ? 'success' : 'error', text: result.message })
                                                        if (result.success) loadMembers()
                                                    }}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="finance">Finance</option>
                                                    <option value="welfare">Welfare</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="mx-auto mb-4 text-gray-400" size={32} />
                                <p className="text-gray-500 font-medium">No members found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Send Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="p-4 md:p-8">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <button
                                onClick={() => {
                                    setNotificationForm({ type: 'bulk', subject: '', message: '', selectedMembers: [] })
                                    setShowNotificationModal(true)
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-[#1e3a8a] hover:bg-[#0a1628] text-white rounded-xl font-bold uppercase tracking-widest transition-all"
                            >
                                <Mail size={18} />
                                Send Bulk Notification
                            </button>

                            <input
                                type="text"
                                placeholder="Search member to send individual notification..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                            />
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin" />
                            </div>
                        ) : filteredMembers.length > 0 ? (
                            <div className="grid gap-4 max-w-2xl mx-auto">
                                {filteredMembers.map((member, idx) => (
                                    <div key={idx} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-800 truncate">{member.fullName}</h4>
                                                <p className="text-sm text-gray-600 truncate">{member.email}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedMember(member)
                                                    setNotificationForm({ type: 'single', subject: '', message: '', selectedMembers: [] })
                                                    setShowNotificationModal(true)
                                                }}
                                                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] hover:bg-[#0a1628] text-white rounded-lg font-bold text-sm transition-all"
                                            >
                                                <Mail size={16} />
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="mx-auto mb-4 text-gray-400" size={32} />
                                <p className="text-gray-500 font-medium">No members found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Dues Update Modal */}
            {showDuesModal && selectedMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-[#0a1628] uppercase">Update Dues</h3>
                            <button onClick={() => setShowDuesModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Member: {selectedMember.fullName}</label>
                            </div>

                            {duesLoading ? (
                                <div className="py-4 flex justify-center">
                                    <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin" />
                                </div>
                            ) : selectedMemberDues && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Paid</p>
                                        <p className="text-lg font-black text-green-600">₦{selectedMemberDues.totalAmountPaid?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Outstanding</p>
                                        <p className="text-lg font-black text-red-600">₦{selectedMemberDues.outstanding?.toLocaleString()}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Record Payment - Year</label>
                                <select
                                    value={duesForm.year}
                                    onChange={(e) => setDuesForm({ ...duesForm, year: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                                >
                                    <option value={2025}>2025</option>
                                    <option value={2026}>2026</option>
                                    <option value={2027}>2027</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Month</label>
                                <select
                                    value={duesForm.month}
                                    onChange={(e) => setDuesForm({ ...duesForm, month: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                                >
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Amount (₦)</label>
                                <input
                                    type="number"
                                    value={duesForm.amount}
                                    onChange={(e) => setDuesForm({ ...duesForm, amount: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDuesModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateDues}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg font-bold hover:bg-[#0a1628] transition-colors"
                            >
                                <Save size={18} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Member Detail Modal */}
            {viewMemberModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-[#0a1628] uppercase">Member Details</h3>
                            <button onClick={() => setViewMemberModal(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Full Name</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.fullName}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Email</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.email}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Phone</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.phoneNumber}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Member ID</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.memberId}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Date of Birth</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.dateOfBirth}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Gender</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.gender}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Year of Graduation</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.yearOfGraduation}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">House</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.house}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Class</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.class}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Location</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.city}, {viewMemberModal.stateProvince}, {viewMemberModal.country}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Occupation</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.currentOccupation}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Industry</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.industryField}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Company</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.companyOrganization}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">LinkedIn</span><p className="font-medium text-blue-600 hover:underline break-all mt-1">{viewMemberModal.linkedinProfile}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Actively Involved</span><p className="font-medium text-gray-800 mt-1">{viewMemberModal.activelyInvolved}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Role</span><p className="font-medium text-gray-800 mt-1 capitalize">{viewMemberModal.role || 'user'}</p></div>
                            <div><span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Verification</span>
                                <p className="mt-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${viewMemberModal.verification ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {viewMemberModal.verification ? 'Verified' : 'Pending Verification'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button onClick={() => setViewMemberModal(null)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {showNotificationModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-[#0a1628] uppercase">Send Notification</h3>
                            <button onClick={() => setShowNotificationModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Notification Type</label>
                                <select
                                    value={notificationForm.type}
                                    onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value as 'single' | 'bulk' })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                                >
                                    <option value="single">Send to Individual</option>
                                    <option value="bulk">Send to Multiple</option>
                                </select>
                            </div>

                            {notificationForm.type === 'bulk' && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-bold text-gray-700">Select Members</label>
                                        {filteredMembers.length > 0 && (
                                            <button 
                                                onClick={() => {
                                                    const filteredIds = filteredMembers.map(m => m.memberId)
                                                    const allSelected = filteredIds.every(id => notificationForm.selectedMembers.includes(id))
                                                    if (allSelected) {
                                                        setNotificationForm({
                                                            ...notificationForm,
                                                            selectedMembers: notificationForm.selectedMembers.filter(id => !filteredIds.includes(id))
                                                        })
                                                    } else {
                                                        const newSelected = new Set([...notificationForm.selectedMembers, ...filteredIds])
                                                        setNotificationForm({
                                                            ...notificationForm,
                                                            selectedMembers: Array.from(newSelected)
                                                        })
                                                    }
                                                }}
                                                className="text-xs font-bold text-[#1e3a8a] hover:underline"
                                            >
                                                {filteredMembers.map(m => m.memberId).every(id => notificationForm.selectedMembers.includes(id)) ? 'Deselect All Filtered' : 'Select All Filtered'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                                        {filteredMembers.map((member) => (
                                            <label key={member.memberId} className="flex items-center gap-2 py-2 hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationForm.selectedMembers.includes(member.memberId)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setNotificationForm({
                                                                ...notificationForm,
                                                                selectedMembers: [...notificationForm.selectedMembers, member.memberId]
                                                            })
                                                        } else {
                                                            setNotificationForm({
                                                                ...notificationForm,
                                                                selectedMembers: notificationForm.selectedMembers.filter(id => id !== member.memberId)
                                                            })
                                                        }
                                                    }}
                                                />
                                                <span className="text-sm">{member.fullName} ({member.email})</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={notificationForm.subject}
                                    onChange={(e) => setNotificationForm({ ...notificationForm, subject: e.target.value })}
                                    placeholder="Enter notification subject..."
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                <textarea
                                    value={notificationForm.message}
                                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                                    placeholder="Enter notification message..."
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] resize-none"
                                />
                            </div>
                            {notificationForm.type === 'single' && selectedMember && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-700"><strong>Recipient:</strong> {selectedMember.fullName} ({selectedMember.email})</p>
                                </div>
                            )}
                            {notificationForm.type === 'bulk' && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-700"><strong>Recipients:</strong> {notificationForm.selectedMembers.length} member(s) selected</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowNotificationModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendNotification}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg font-bold hover:bg-[#0a1628] transition-colors"
                            >
                                <Mail size={18} />
                                Send Notification
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
