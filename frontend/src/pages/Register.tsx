import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { WalletCards, Sparkles } from 'lucide-react';

export function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profession, setProfession] = useState('Employee');
    const [monthlyIncome, setMonthlyIncome] = useState<number | ''>('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register', {
                name,
                email,
                password,
                profession,
                monthlyIncome: Number(monthlyIncome)
            });
            // Auto login
            const { data } = await api.post('/auth/login', { email, password });
            useAuthStore.getState().setAuth(data.user, data.access_token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">

            {/* Left side - Forms */}
            <div className="flex items-center justify-center min-h-screen p-4 py-12 lg:p-8 bg-background relative order-2 lg:order-1">
                {/* Mobile gradient blob */}
                <div className="absolute w-[300px] h-[300px] bg-indigo-500 rounded-full blur-[120px] opacity-10 lg:hidden top-10 left-10"></div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md z-10"
                >
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <WalletCards className="w-8 h-8 text-primary" />
                        <h1 className="text-2xl font-bold">Smart Expense</h1>
                    </div>

                    <Card className="border-0 shadow-none bg-transparent lg:bg-card lg:border lg:shadow-xl lg:rounded-3xl backdrop-blur-sm sm:p-2">
                        <CardHeader className="space-y-3 pb-6 text-center">
                            <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
                            <CardDescription className="text-base">Start tracking your financial journey today</CardDescription>
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
                                        <label className="text-sm font-semibold tracking-wide text-foreground/80">Full Name</label>
                                        <Input
                                            placeholder="Ravi Kumar"
                                            value={name} onChange={(e) => setName(e.target.value)} required
                                            className="h-11 bg-muted/50 border-muted-foreground/20 text-base rounded-xl transition-all focus-visible:ring-primary/50 hover:bg-muted/80"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold tracking-wide text-foreground/80">Email address</label>
                                        <Input
                                            type="email" placeholder="ravi@example.com"
                                            value={email} onChange={(e) => setEmail(e.target.value)} required
                                            className="h-11 bg-muted/50 border-muted-foreground/20 text-base rounded-xl transition-all focus-visible:ring-primary/50 hover:bg-muted/80"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold tracking-wide text-foreground/80">Password <span className="text-muted-foreground font-normal">(Min. 6 chars)</span></label>
                                        <Input
                                            type="password" placeholder="••••••••" minLength={6}
                                            value={password} onChange={(e) => setPassword(e.target.value)} required
                                            className="h-11 bg-muted/50 border-muted-foreground/20 text-base rounded-xl transition-all focus-visible:ring-primary/50 hover:bg-muted/80"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold tracking-wide text-foreground/80">Profession</label>
                                            <select
                                                value={profession}
                                                onChange={(e) => setProfession(e.target.value)}
                                                className="flex h-11 w-full rounded-xl border border-muted-foreground/20 bg-muted/50 px-3 py-2 text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:bg-muted/80"
                                            >
                                                <option value="Student">Student</option>
                                                <option value="Employee">Employee</option>
                                                <option value="Business">Business</option>
                                                <option value="Freelancer">Freelancer</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold tracking-wide text-foreground/80">Monthly Income (₹)</label>
                                            <Input
                                                type="number" min="0" placeholder="50000"
                                                value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value === '' ? '' : Number(e.target.value))} required
                                                className="h-11 bg-muted/50 border-muted-foreground/20 text-base rounded-xl transition-all focus-visible:ring-primary/50 hover:bg-muted/80"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-primary/25 transition-all mt-4" disabled={loading}>
                                    {loading ? 'Creating account...' : <span className="flex items-center gap-2">Register <Sparkles className="w-4 h-4" /></span>}
                                </Button>

                                <div className="text-center text-sm font-medium text-muted-foreground pt-4">
                                    Already have an account? <Link to="/login" className="text-primary hover:text-primary/80 transition-colors">Log in</Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Right side - Hero visual */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-950 via-slate-900 to-black animate-gradient-x p-12 text-white relative overflow-hidden order-1 lg:order-2">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[120px] opacity-20 top-[0px] right-[-100px]"></div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 max-w-lg space-y-8 pl-12 border-l-2 border-indigo-500/30"
                >
                    <h2 className="text-4xl font-extrabold leading-tight tracking-tighter">
                        Join thousands of smart Indians making better money decisions.
                    </h2>

                    <div className="space-y-6 pt-4">
                        {[
                            "Track every rupee automatically",
                            "Visualize habits with sleek charts",
                            "Stop asking 'where did my salary go?'"
                        ].map((benefit, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
                                key={i} className="flex items-center gap-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                <span className="text-lg text-indigo-100/90">{benefit}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

        </div>
    );
}
