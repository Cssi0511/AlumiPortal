import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mail, Linkedin, User, X, Briefcase, MapPin } from 'lucide-react'
import { api, AlumniMember } from '../services/api'

const CATEGORIES = [
    { id: 'all', name: 'All', keywords: [] },
    { id: 'tech', name: 'Technology', keywords: ['technology', 'tech', 'IT', 'software', 'developer', 'programming', 'data', 'ai', 'cyber', 'crypto', 'telecommunications', 'computer science'] },
    { id: 'eng-const', name: 'Engineering & Construction', keywords: ['engineering', 'civil', 'mechanical', 'structural', 'construction', 'building', 'site manager', 'surveying', 'geoinformatics', 'architectural', 'cement'] },
    { id: 'finance', name: 'Finance & Insurance', keywords: ['finance', 'banking', 'accounting', 'investment', 'financial', 'economics', 'insurance', 'fintech'] },
    { id: 'healthcare', name: 'Healthcare', keywords: ['healthcare', 'medical', 'health', 'doctor', 'nurse', 'nursing', 'pharmacy', 'medicine', 'nhs', 'wellness'] },
    { id: 'business', name: 'Business & Logistics', keywords: ['business', 'management', 'consulting', 'entrepreneur', 'executive', 'ceo', 'director', 'logistics', 'importation', 'maritime', 'supply chain'] },
    { id: 'real-estate', name: 'Real Estate', keywords: ['real estate', 'property', 'realtor', 'housing', 'estate', 'landlord'] },
    { id: 'education', name: 'Education', keywords: ['education', 'teaching', 'academic', 'professor', 'teacher', 'training', 'learning', 'academia', 'theological school'] },
    { id: 'public-ngo', name: 'Public Sector & NGO', keywords: ['civil service', 'government', 'public sector', 'ngo', 'non-profit', 'charity', 'foundation', 'humanitarian', 'ministry'] },
    { id: 'military', name: 'Military & Security', keywords: ['military', 'army', 'defence', 'aircrew', 'security', 'defence', 'forces'] },
    { id: 'fashion-retail', name: 'Fashion & Retail', keywords: ['fashion', 'tailor', 'retail', 'cosmetics', 'gadgets', 'accessories', 'nail', 'beauty'] },
    { id: 'hospitality', name: 'Hospitality', keywords: ['hospitality', 'hotel', 'tourism', 'restaurant', 'catering', 'nightlife', 'drinks', 'confectionery'] },
    { id: 'agriculture', name: 'Agriculture', keywords: ['agriculture', 'farming', 'agro', 'agribusiness'] },
    { id: 'creative', name: 'Creative & Media', keywords: ['design', 'creative', 'art', 'media', 'photography', 'graphics', 'content'] },
    { id: 'energy', name: 'Energy', keywords: ['oil', 'gas', 'petroleum', 'energy', 'renewable', 'solar'] },
    { id: 'marketing', name: 'Marketing', keywords: ['marketing', 'advertising', 'brand', 'experiential', 'communications', 'sales'] }
];

export default function Directory() {
    const [members, setMembers] = useState<AlumniMember[]>([])
    const [filtered, setFiltered] = useState<AlumniMember[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('all')

    // Contact Modal State
    const [showModal, setShowModal] = useState(false)
    const [selectedMember, setSelectedMember] = useState<AlumniMember | null>(null)
    const [isSending, setIsSending] = useState(false)
    const [sendSuccess, setSendSuccess] = useState(false)
    const [contactForm, setContactForm] = useState({
        senderName: '',
        senderEmail: '',
        senderPhone: '',
        message: ''
    })

    useEffect(() => {
        loadMembers()
    }, [])

    const loadMembers = async () => {
        setLoading(true)
        const data = await api.fetchMembers()
        setMembers(data)
        setFiltered(data)
        setLoading(false)
    }

    useEffect(() => {
        let result = members.filter(m =>
            m.fullName.toLowerCase().includes(search.toLowerCase()) ||
            m.currentOccupation.toLowerCase().includes(search.toLowerCase()) ||
            m.companyOrganization.toLowerCase().includes(search.toLowerCase())
        )

        if (category !== 'all') {
            const selectedCat = CATEGORIES.find(c => c.id === category)
            if (selectedCat) {
                result = result.filter(m => {
                    const industry = (m.industryField || '').toLowerCase()
                    return selectedCat.keywords.some(keyword => industry.includes(keyword.toLowerCase()))
                })
            }
        }

        setFiltered(result)
    }, [search, category, members])

    const openContactModal = (member: AlumniMember) => {
        setSelectedMember(member)
        setShowModal(true)
        setSendSuccess(false)
        setContactForm({
            senderName: '',
            senderEmail: '',
            senderPhone: '',
            message: ''
        })
    }

    const closeModal = () => {
        setShowModal(false)
        setSelectedMember(null)
    }

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedMember) return

        setIsSending(true)
        const formData = {
            recipientName: selectedMember.fullName,
            recipientEmail: selectedMember.email,
            ...contactForm
        }

        try {
            const result = await api.sendContactRequest(formData)
            if (result.success) {
                setSendSuccess(true)
                setTimeout(() => {
                    closeModal()
                }, 2000)
            } else {
                alert(result.message || 'Failed to send message')
            }
        } catch (error) {
            alert('An error occurred. Please try again.')
        } finally {
            setIsSending(false)
        }
    }

    return (
        <>
            <div className="space-y-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-[#0a1628] uppercase tracking-tight">
                            Alumni <span className="text-[#1e3a8a]">Directory</span>
                        </h2>
                        <p className="text-gray-500 font-medium">Find and connect with fellow professionals.</p>
                    </div>

                    <div className="results-count bg-[#1e3a8a] text-white px-4 py-2 rounded-full text-sm font-bold">
                        {filtered.length} {filtered.length === 1 ? 'Member' : 'Members'} Found
                    </div>
                </div>

                <div className="card p-6 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            className="form-input pl-12 py-4"
                            placeholder="Search by name, company, or occupation..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex overflow-x-auto hide-scrollbar pb-2 -mx-2 px-2 gap-2 snap-x">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all tracking-wider snap-start ${category === cat.id
                                    ? 'bg-[#1e3a8a] text-white shadow-lg scale-105'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Loading Alumni...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filtered.map((member, index) => (
                                <motion.div
                                    key={member.memberId || index}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="card p-0 overflow-hidden flex flex-col group"
                                >
                                    <div className="bg-gradient-to-br from-[#1e3a8a] to-[#0a1628] p-6 text-white relative">
                                        <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                                            {member.yearOfGraduation}
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">{member.fullName}</h3>
                                        <p className="text-blue-100/80 font-['Crimson_Pro'] italic text-sm">{member.currentOccupation}</p>
                                    </div>

                                    <div className="p-6 flex-1 space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Briefcase size={14} className="text-[#d4a574]" />
                                                <span className="font-bold text-gray-700">{member.companyOrganization || 'Private'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <User size={14} className="text-[#d4a574]" />
                                                <span className="text-gray-500 uppercase font-black text-[10px] tracking-widest">{member.industryField || 'General'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <MapPin size={14} className="text-[#d4a574]" />
                                                <span className="text-gray-500 uppercase font-black text-[10px] tracking-widest">{member.city || 'Nigeria'}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {member.house && (
                                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                                    {member.house} House
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-4 mt-auto">
                                            <button
                                                onClick={() => openContactModal(member)}
                                                className="flex-1 btn-primary py-2.5 text-xs flex items-center justify-center gap-2"
                                            >
                                                <Mail size={14} />
                                                Contact
                                            </button>
                                            {member.linkedinProfile && (
                                                <a
                                                    href={member.linkedinProfile}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                                >
                                                    <Linkedin size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">No Members Found</h3>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search keywords.</p>
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            <AnimatePresence>
                {showModal && selectedMember && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative"
                        >
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>

                            <div className="bg-gradient-to-br from-[#1e3a8a] to-[#0a1628] p-8 text-white">
                                <h3 className="text-2xl font-black uppercase tracking-tight">Contact Member</h3>
                                <p className="text-blue-100/80 mt-1 font-medium">Send a message to {selectedMember.fullName}</p>
                            </div>

                            <div className="p-8">
                                {sendSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h4 className="text-xl font-black text-[#0a1628] uppercase tracking-tight">Message Sent!</h4>
                                        <p className="text-gray-500 mt-2 font-medium">Your request has been delivered to {selectedMember.fullName}.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleContactSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="form-input py-2 text-sm"
                                                    value={contactForm.senderName}
                                                    onChange={e => setContactForm({ ...contactForm, senderName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Email</label>
                                                <input
                                                    type="email"
                                                    required
                                                    className="form-input py-2 text-sm"
                                                    value={contactForm.senderEmail}
                                                    onChange={e => setContactForm({ ...contactForm, senderEmail: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Phone</label>
                                            <input
                                                type="tel"
                                                className="form-input py-2 text-sm"
                                                value={contactForm.senderPhone}
                                                onChange={e => setContactForm({ ...contactForm, senderPhone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Message</label>
                                            <textarea
                                                required
                                                rows={4}
                                                className="form-input py-3 text-sm resize-none"
                                                placeholder="Write your message here..."
                                                value={contactForm.message}
                                                onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSending}
                                            className="w-full btn-primary py-4 mt-4 flex items-center justify-center gap-2 group"
                                        >
                                            {isSending ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Mail size={18} />
                                                    <span>Send Message</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
