import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl flex flex-col gap-1.5 min-w-[140px]">
                {label && <p className="font-semibold text-foreground text-sm mb-1">{label}</p>}
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }} />
                            <span className="text-muted-foreground capitalize font-medium">{entry.name}</span>
                        </div>
                        <span className="font-bold text-foreground">{formatINR(Number(entry.value))}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function Dashboard() {
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        expensesByCategory: [] as any[],
        monthlyTrend: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [txnsRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/budgets')
            ]);
            const txns = txnsRes.data;

            let totalInc = 0;
            let totalExp = 0;
            const catMap = new Map();
            const trendMap = new Map();

            txns.forEach((t: any) => {
                const amt = Number(t.amount);
                if (t.type === 'INCOME') totalInc += amt;
                else {
                    totalExp += amt;
                    catMap.set(t.category, (catMap.get(t.category) || 0) + amt);
                }

                const date = new Date(t.date);
                const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
                if (!trendMap.has(monthYear)) trendMap.set(monthYear, { month: monthYear, income: 0, expense: 0 });

                const trendData = trendMap.get(monthYear);
                if (t.type === 'INCOME') trendData.income += amt;
                else trendData.expense += amt;
            });

            const expensesByCategory = Array.from(catMap, ([name, value]) => ({ name, value }));
            const monthlyTrend = Array.from(trendMap.values()).reverse();

            setStats({
                totalIncome: totalInc,
                totalExpense: totalExp,
                balance: totalInc - totalExp,
                expensesByCategory,
                monthlyTrend
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

    if (loading) return (
        <div className="flex items-center justify-center p-12 min-h-[60vh] text-primary/50">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <div className="flex flex-col gap-1 md:flex-row md:items-end justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
                    <p className="text-muted-foreground">Your financial summary at a glance.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <motion.div variants={itemVariants}>
                    <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background border-primary/20 shadow-lg relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold tracking-wide text-muted-foreground dark:text-muted-foreground uppercase">Total Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-foreground">{formatINR(stats.balance)}</div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="bg-gradient-to-br from-emerald-500/10 via-background to-background border-emerald-500/20 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold tracking-wide text-muted-foreground dark:text-muted-foreground uppercase">Total Income</CardTitle>
                            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-emerald-500">{formatINR(stats.totalIncome)}</div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="bg-gradient-to-br from-rose-500/10 via-background to-background border-rose-500/20 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold tracking-wide text-muted-foreground dark:text-muted-foreground uppercase">Total Expenses</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-rose-500">{formatINR(stats.totalExpense)}</div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <motion.div variants={itemVariants} className="md:col-span-4">
                    <Card className="shadow-lg border-muted/30">
                        <CardHeader>
                            <CardTitle>Cash Flow Trend</CardTitle>
                            <CardDescription>Income and expense activity over time</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            {stats.monthlyTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                                        <XAxis dataKey="month" className="text-xs font-medium" tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                                        <YAxis className="text-xs font-medium" tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent', stroke: 'hsl(var(--muted))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                        <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                        <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : <div className="h-full flex items-center justify-center text-muted-foreground/60 text-sm font-medium">No transaction history</div>}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="md:col-span-3">
                    <Card className="shadow-lg border-muted/30 h-full">
                        <CardHeader>
                            <CardTitle>Category Breakdown</CardTitle>
                            <CardDescription>Where your money goes</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center">
                            {stats.expensesByCategory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.expensesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={95}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                            cornerRadius={4}
                                        >
                                            {stats.expensesByCategory.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 text-sm font-medium">
                                <PieChart className="w-12 h-12 mb-2 opacity-20" />
                                No expenses yet
                            </div>}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
