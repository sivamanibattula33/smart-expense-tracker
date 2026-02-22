import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { WalletCards } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore(state => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', { email, password });
            setAuth(data.user, data.access_token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {/* Left side - Hero visual */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black animate-gradient-x p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute w-[500px] h-[500px] bg-purple-500 rounded-full blur-[100px] opacity-20 top-[-100px] left-[-100px]"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 max-w-lg space-y-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
                            <WalletCards className="w-10 h-10 text-purple-300" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white/90">Smart Expense India</h1>
                    </div>

                    <h2 className="text-5xl font-extrabold leading-tight tracking-tighter">
                        Master your money.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">Empower your future.</span>
                    </h2>

                    <p className="text-lg text-purple-200/80 leading-relaxed max-w-md">
                        The definitive financial command center crafted beautifully for Indians. Track spending, conquer budgets, and achieve absolute financial clarity.
                    </p>
                </motion.div>
            </div>

            {/* Right side - Login forms */}
            <div className="flex items-center justify-center min-h-screen p-4 lg:p-8 bg-background relative">
                {/* Mobile gradient blob */}
                <div className="absolute w-[300px] h-[300px] bg-purple-500 rounded-full blur-[120px] opacity-10 lg:hidden top-10 right-10"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md z-10"
                >
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <WalletCards className="w-8 h-8 text-primary" />
                        <h1 className="text-2xl font-bold">Smart Expense</h1>
                    </div>

                    <Card className="border-0 shadow-none bg-transparent lg:bg-card lg:border lg:shadow-xl lg:rounded-3xl backdrop-blur-sm sm:p-4">
                        <CardHeader className="space-y-3 pb-6 text-center">
                            <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
                            <CardDescription className="text-base">Enter your credentials to access your dashboard</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center font-medium">
                                        {error}
                                    </motion.div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold tracking-wide text-foreground/80">Email address</label>
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-12 bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/50 text-base rounded-xl transition-all hover:bg-muted/80"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-semibold tracking-wide text-foreground/80">Password</label>
                                            <Link to="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Forgot password?</Link>
                                        </div>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-12 bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/50 text-base rounded-xl transition-all hover:bg-muted/80"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-primary/25 transition-all mt-4" disabled={loading}>
                                    {loading ? 'Authenticating...' : 'Sign In'}
                                </Button>

                                <div className="text-center text-sm font-medium text-muted-foreground pt-4">
                                    Don't have an account? <Link to="/register" className="text-primary hover:text-primary/80 transition-colors">Create one now</Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
