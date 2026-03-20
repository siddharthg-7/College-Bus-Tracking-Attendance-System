import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Bus, GraduationCap, ShieldCheck, MapPin } from 'lucide-react';
import { cn } from '../services/utils';
import DotMap from '../components/ui/dot-map';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (!result.success) {
            setError(result.message);
        }
        setLoading(false);
    };

    const demoAccounts = [
        { username: 'student1', password: 'password123', role: 'Student', icon: <GraduationCap size={20} /> },
        { username: 'driver1', password: 'password123', role: 'Driver', icon: <Bus size={20} /> },
        { username: 'admin', password: 'password123', role: 'Admin', icon: <ShieldCheck size={20} /> }
    ];

    const fillDemo = (account) => {
        setUsername(account.username);
        setPassword(account.password);
        setError('');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-5xl overflow-hidden rounded-3xl flex bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
                {/* Left Side - Visual Tracker */}
                <div className="hidden md:block w-1/2 h-[700px] relative overflow-hidden bg-slate-100 dark:bg-slate-950/50 border-r border-slate-200 dark:border-slate-800">
                    <DotMap />
                    
                    {/* Overlay Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-10">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="mb-8"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-500/20 rotate-3">
                                <Bus className="text-white h-8 w-8 -rotate-3" />
                            </div>
                        </motion.div>
                        
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="text-4xl font-bold mb-4 text-center tracking-tight text-slate-900 dark:text-white"
                        >
                            College Bus Tracker
                        </motion.h2>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="text-lg text-center text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed"
                        >
                            Real-time attendance & AI-powered tracking system for a safer campus journey
                        </motion.p>

                        {/* Floating Micro-Features */}
                        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-6 px-12">
                            {[
                                { icon: <MapPin size={16} />, label: "Live GPS" },
                                { icon: <ShieldCheck size={16} />, label: "Secure Auth" },
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 + idx * 0.1 }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/20 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm"
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-white dark:bg-slate-900">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="mb-10">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
                            <p className="text-slate-500 dark:text-slate-400">Sign in to your dashboard to stay connected</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                                <div className="group relative transition-all duration-200">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 px-4 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="student1, driver1..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                    <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">Forgot?</a>
                                </div>
                                <div className="relative group">
                                    <input
                                        type={isPasswordVisible ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 px-4 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onHoverStart={() => setIsHovered(true)}
                                onHoverEnd={() => setIsHovered(false)}
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    "w-full h-12 relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold text-lg transition-all duration-300",
                                    loading && "opacity-70 cursor-not-allowed",
                                    isHovered ? "shadow-lg shadow-blue-500/30 translate-y-[-2px]" : ""
                                )}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? "Verifying..." : "Login to Dashboard"}
                                    {!loading && <ArrowRight size={20} />}
                                </span>
                                
                                {/* Shine Effect */}
                                {isHovered && !loading && (
                                    <motion.div
                                        initial={{ left: "-100%" }}
                                        animate={{ left: "100%" }}
                                        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                                        className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] z-20"
                                    />
                                )}
                            </motion.button>
                        </form>

                        <div className="relative my-10">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 font-medium">DEMO ACCESS</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {demoAccounts.map((account) => (
                                <button
                                    key={account.role}
                                    onClick={() => fillDemo(account)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200"
                                >
                                    <div className="text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
                                        {account.icon}
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{account.role}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-xs text-slate-400">
                                © 2024 College Bus Tracker. Developed for Campus Transit Safety.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
