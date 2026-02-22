import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Receipt, PieChart, Settings, LogOut, WalletCards, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore(state => state.logout);
    const { theme, toggleTheme } = useThemeStore();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Transactions', href: '/transactions', icon: Receipt },
        { name: 'Budgets', href: '/budgets', icon: PieChart },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="flex bg-background min-h-screen text-foreground relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col bg-card/50 backdrop-blur-xl border-r border-border/50 shadow-xl z-20">
                <div className="p-8 pb-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <WalletCards className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Smart Expense</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">India Edition</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1.5 px-4 py-8">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group relative overflow-hidden",
                                    isActive ? "text-primary shadow-sm bg-primary/10" : "hover:bg-accent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {isActive && <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-border/50 space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all group"
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" /> : <Moon className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-20 md:pb-0 relative z-10 w-full">
                {/* Mobile Header / Floating Actions */}
                <div className="md:hidden absolute top-4 right-4 z-50">
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg text-foreground hover:bg-accent transition-all"
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-500" />}
                    </button>
                </div>

                <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pt-16 md:pt-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/50 bg-card/80 backdrop-blur-xl flex justify-around p-2 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative",
                                isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                        >
                            {isActive && <motion.div layoutId="bottom-nav-active" className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />}
                            <item.icon className={cn("h-6 w-6 mb-1 mt-1 transition-transform", isActive ? "fill-primary/20 scale-110" : "scale-100")} />
                            <span className="text-[10px] font-semibold tracking-wide">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
