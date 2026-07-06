import { useState } from 'react'
import { Mail, Phone, Calendar, School, Briefcase, Linkedin, Info, Save, Edit2 } from 'lucide-react'
import { api, AlumniMember } from '../services/api'

interface ProfileProps {
    user: any
    onUpdate: (user: any) => void
}

export default function Profile({ user, onUpdate }: ProfileProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: string, text: string }>({ type: '', text: '' })
    const [formData, setFormData] = useState<Partial<AlumniMember>>({ ...user })

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const result = await api.updateProfile(user.email, formData)
            if (result.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
                onUpdate({ ...user, ...formData })
                setTimeout(() => setIsEditing(false), 1500)
            } else {
                setMessage({ type: 'error', text: result.message || 'Update failed' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error updating profile' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-3 justify-between items-center bg-white p-4 md:p-6 rounded-3xl shadow-md border border-gray-100">
                <h2 className="text-xl md:text-2xl font-black text-[#0a1628] uppercase tracking-tight">Your Profile</h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-sm font-bold uppercase text-[#1e3a8a] bg-blue-50 px-5 py-2 rounded-xl hover:bg-blue-100 transition-all shadow-sm"
                    >
                        <Edit2 size={16} />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 md:px-6 py-2 rounded-xl text-sm font-bold uppercase text-gray-500 hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 text-sm font-bold uppercase text-white bg-green-600 px-4 md:px-6 py-2 rounded-xl hover:bg-green-700 transition-all shadow-md disabled:opacity-50"
                        >
                            <Save size={16} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl text-sm font-bold uppercase tracking-wide text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <div className="card text-center py-8 md:py-10 flex flex-col items-center flex-1">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#d4a574] to-[#b8860b] flex items-center justify-center font-black text-4xl md:text-5xl text-white shadow-2xl mb-4 md:mb-6 ring-8 ring-blue-50">
                            {user.fullName?.[0] || 'A'}
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-[#0a1628] uppercase">{user.fullName}</h3>
                        <p className="text-gray-500 font-['Crimson_Pro'] italic mb-4">{user.currentOccupation || 'Member'}</p>
                        <div className="bg-blue-50 text-[#1e3a8a] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                            {user.memberId}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="card space-y-8">
                        <section>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b-2 border-gray-100 pb-2">Professional Information</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Current Job Title</label>
                                    {isEditing ? (
                                        <input
                                            className="form-input py-2.5 text-sm"
                                            value={formData.currentOccupation || ''}
                                            onChange={(e) => setFormData({ ...formData, currentOccupation: e.target.value })}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Briefcase size={16} className="text-blue-600" />
                                            <span className="text-sm font-bold text-gray-700">{user.currentOccupation || 'Not set'}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Current Company</label>
                                    {isEditing ? (
                                        <input
                                            className="form-input py-2.5 text-sm"
                                            value={formData.companyOrganization || ''}
                                            onChange={(e) => setFormData({ ...formData, companyOrganization: e.target.value })}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <School size={16} className="text-blue-600" />
                                            <span className="text-sm font-bold text-gray-700">{user.companyOrganization || 'Not set'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">LinkedIn Profile</label>
                                    {isEditing ? (
                                        <input
                                            className="form-input py-2.5 text-sm"
                                            value={formData.linkedinProfile || ''}
                                            placeholder="https://linkedin.com/in/..."
                                            onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Linkedin size={16} className="text-blue-600" />
                                            <span className="text-sm font-bold text-gray-700 truncate">{user.linkedinProfile || 'Not set'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b-2 border-gray-100 pb-2">Personal & School Info</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Email Address</label>
                                    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl opacity-70">
                                        <Mail size={16} className="text-gray-400" />
                                        <span className="text-sm font-bold text-gray-500">{user.email}</span>
                                    </div>
                                    <p className="text-[9px] text-gray-400 mt-1 italic px-1">* Email cannot be changed</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Class Year</label>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <Calendar size={16} className="text-blue-600" />
                                        <span className="text-sm font-bold text-gray-700">{user.yearOfGraduation}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">School House</label>
                                    {isEditing ? (
                                        <input
                                            className="form-input py-2.5 text-sm"
                                            value={formData.house || ''}
                                            onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Info size={16} className="text-blue-600" />
                                            <span className="text-sm font-bold text-gray-700">{user.house || 'Not set'}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Phone Number</label>
                                    {isEditing ? (
                                        <input
                                            className="form-input py-2.5 text-sm"
                                            value={formData.phoneNumber || ''}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Phone size={16} className="text-blue-600" />
                                            <span className="text-sm font-bold text-gray-700">{user.phoneNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">More Info</h4>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Actively Involved</label>
                                    <select
                                        className="form-input py-2.5 text-sm"
                                        value={formData.activelyInvolved || ''}
                                        onChange={(e) => setFormData({ ...formData, activelyInvolved: e.target.value })}
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                        <option value="Maybe">Maybe</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 rounded-3xl min-h-[100px] font-['Crimson_Pro'] italic text-gray-600">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Actively Involved?</p>
                                    {user.activelyInvolved || 'Not specified'}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
