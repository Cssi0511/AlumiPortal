import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api'
import logo from '../assets/images/logo.png'
import { User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'

interface AuthProps {
    onLogin: (user: any) => void
}

export default function Auth({ onLogin }: AuthProps) {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Form states
    const [email, setEmail] = useState('')
    const [regData, setRegData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        yearOfGraduation: '',
        house: '',
        class: '',
        currentOccupation: '',
        industryField: '',
        companyOrganization: '',
        linkedinProfile: ''
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const user = await api.login(email)
        console.log({ user })
        if (user) {
            localStorage.setItem('alumni_user', JSON.stringify(user))
            onLogin(user)
        } else {
            setError('Email not found. Please check or register.')
        }
        setLoading(false)
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const result = await api.register(regData)
        if (result.success) {
            setSuccess('Registration successful! Redirecting to login...')
            setTimeout(() => {
                setIsLogin(true)
                setSuccess('')
            }, 2000)
        } else {
            setError(result.message)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f0f0f0] to-[#e5e7eb]">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1e3a8a]/5 rounded-bl-full -mr-10 -mt-10" />

                <div className="text-center relative z-10 space-y-4">
                    <div className="bg-white p-3 rounded-2xl shadow-md inline-block mx-auto border border-gray-50">
                        <img src={logo} alt="CSSI Logo" className="w-16 h-16 object-contain" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-[#0a1628] uppercase tracking-tighter">
                        CSSI <span className="text-[#1e3a8a]">Alumni</span>
                    </h2>
                    <p className="mt-2 text-sm text-[#6b7280] font-['Crimson_Pro'] italic text-lg">
                        Connect. Network. Grow Together.
                    </p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2.5 text-sm font-bold uppercase rounded-lg transition-all ${isLogin ? 'bg-white text-[#1e3a8a] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2.5 text-sm font-bold uppercase rounded-lg transition-all ${!isLogin ? 'bg-white text-[#1e3a8a] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Register
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl"
                        >
                            <AlertCircle size={20} />
                            <span className="text-sm font-medium">{error}</span>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center gap-3 rounded-r-xl"
                        >
                            <CheckCircle2 size={20} />
                            <span className="text-sm font-medium">{success}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8">
                    {isLogin ? (
                        <motion.form
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleLogin}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-input pl-12"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : 'Login to Portal'}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="register"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleRegister}
                            className="space-y-4 max-h-[60vh] overflow-y-auto px-2 custom-scrollbar"
                        >
                            <div className="grid grid-cols-1 gap-4">
                                {/* Full Name */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name *</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            required
                                            value={regData.fullName}
                                            onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                                            className="form-input pl-10 py-2.5 text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="email"
                                            required
                                            value={regData.email}
                                            onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                                            className="form-input pl-10 py-2.5 text-sm"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Phone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={regData.phoneNumber}
                                            onChange={(e) => setRegData({ ...regData, phoneNumber: e.target.value })}
                                            className="form-input py-2.5 text-sm"
                                            placeholder="080..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">DOB *</label>
                                        <input
                                            type="date"
                                            required
                                            value={regData.dateOfBirth}
                                            onChange={(e) => setRegData({ ...regData, dateOfBirth: e.target.value })}
                                            className="form-input py-2.5 text-sm text-gray-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Graduation Year *</label>
                                        <input
                                            type="text"
                                            required
                                            value={regData.yearOfGraduation}
                                            onChange={(e) => setRegData({ ...regData, yearOfGraduation: e.target.value })}
                                            className="form-input py-2.5 text-sm"
                                            placeholder="2014"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Industry</label>
                                        <input
                                            type="text"
                                            value={regData.industryField}
                                            onChange={(e) => setRegData({ ...regData, industryField: e.target.value })}
                                            className="form-input py-2.5 text-sm"
                                            placeholder="Tech, Finance..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? 'Creating Account...' : 'Register Member'}
                            </button>
                        </motion.form>
                    )}
                </div>
            </div>
        </div>
    )
}
