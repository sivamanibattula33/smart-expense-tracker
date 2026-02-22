import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { PlusCircle, Trash2, PieChart as PieChartIcon, Activity, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { toast } from 'sonner';

const CATEGORIES = ['Food', 'Rent', 'Travel', 'Shopping', 'Bills', 'Education', 'Health', 'EMI', 'Others'];

export function Budgets() {
    const [budgets, setBudgets] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState<any>(null);

    // Form State
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [limitAmount, setLimitAmount] = useState('');

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const [budgetsRes, txnsRes] = await Promise.all([
                api.get('/budgets'),
                api.get('/transactions')
            ]);
            setBudgets(budgetsRes.data);
            setTransactions(txnsRes.data);
        } catch (err) {
            console.error('Failed to fetch budgets', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBudget) {
                await api.put(`/budgets/${editingBudget.id}`, {
                    limitAmount: Number(limitAmount),
                });
                toast.success(`Budget for ${category} updated!`);
            } else {
                await api.post('/budgets', {
                    category,
                    limitAmount: Number(limitAmount),
                    month: currentMonth,
                    year: currentYear
                });
                toast.success(`Budget for ${category} has been set!`);
            }
            setShowForm(false);
            setEditingBudget(null);
            setLimitAmount('');
            fetchBudgets();
        } catch (err: any) {
            console.error('Failed to save budget', err);
            toast.error(err.response?.data?.message || 'Failed to save budget.');
        }
    };

    const handleEdit = (budget: any) => {
        setEditingBudget(budget);
        setCategory(budget.category);
        setLimitAmount(budget.limitAmount.toString());
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this budget limit?')) return;
        try {
            await api.delete(`/budgets/${id}`);
            toast.success('Budget deleted successfully.');
            fetchBudgets();
        } catch (err: any) {
            console.error('Failed to delete', err);
            toast.error(err.response?.data?.message || 'Failed to delete budget.');
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 15 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            className="space-y-6 max-w-5xl mx-auto"
            initial="hidden"
            animate="show"
            variants={containerVariants}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Monthly Budgets</h1>
                    <p className="text-muted-foreground mt-1">Set limits and track spending by category.</p>
                </div>

                <Button size="sm" className="rounded-xl shadow-lg shadow-primary/20 self-start sm:self-auto" onClick={() => {
                    if (showForm) {
                        setShowForm(false);
                        setEditingBudget(null);
                        setLimitAmount('');
                    } else {
                        setShowForm(true);
                    }
                }}>
                    {showForm ? 'Cancel' : (
                        <>
                            <PlusCircle className="mr-2 h-4 w-4" /> Set Budget
                        </>
                    )}
                </Button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute -left-32 -top-32 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 transition-all group-hover:bg-primary/20"></div>
                            <CardHeader>
                                <CardTitle className="text-xl">Set Budget for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</CardTitle>
                                <CardDescription>Restrict monthly spending for a specific category.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreate} className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category</label>
                                        <select
                                            disabled={!!editingBudget}
                                            value={category} onChange={(e) => setCategory(e.target.value)}
                                            className="flex h-11 w-full rounded-xl border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all font-medium appearance-none disabled:opacity-50"
                                        >
                                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Limit Amount (₹)</label>
                                        <Input className="h-11 rounded-xl" type="number" min="1" value={limitAmount} onChange={e => setLimitAmount(e.target.value)} required placeholder="e.g. 5000" />
                                    </div>

                                    <div className="md:col-span-2 flex justify-end pt-2">
                                        <Button className="rounded-xl px-8 shadow-lg shadow-primary/20" type="submit">
                                            {editingBudget ? 'Update Budget' : 'Save Budget'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex items-center justify-center p-12 text-primary/50 min-h-[30vh]">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : budgets.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center text-muted-foreground bg-card/30 rounded-3xl border border-dashed border-border/50">
                    <PieChartIcon className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium text-lg text-foreground">No active budgets for this month.</p>
                    <p className="text-sm mt-1">Set one up to keep your spending in check!</p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                    {budgets.map(budget => {
                        const budgetLimit = Number(budget.limitAmount);
                        const categoryExpenses = transactions
                            .filter(t => t.type === 'EXPENSE' && t.category === budget.category && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
                            .reduce((sum, t) => sum + Number(t.amount), 0);

                        const spentPercentage = budgetLimit > 0 ? Math.min(100, Math.round((categoryExpenses / budgetLimit) * 100)) : 0;
                        const isNearingLimit = spentPercentage >= 60;
                        const isWarning = spentPercentage >= 80;
                        const isDanger = spentPercentage >= 90;
                        const isExceeded = spentPercentage >= 100;

                        // 4-stage color logic: green → amber → orange → red
                        const barColor = isDanger
                            ? 'bg-red-500'
                            : isWarning
                                ? 'bg-orange-500'
                                : isNearingLimit
                                    ? 'bg-amber-400'
                                    : 'bg-gradient-to-r from-emerald-500 to-primary';
                        const percentageTextColor = isDanger
                            ? 'text-destructive font-bold'
                            : isWarning
                                ? 'text-orange-500 font-bold'
                                : isNearingLimit
                                    ? 'text-amber-500 font-bold'
                                    : '';

                        return (
                            <motion.div key={budget.id} variants={itemVariants} initial="hidden" animate="show">
                                <Card className={`shadow-lg border-muted/30 overflow-hidden backdrop-blur-sm transition-colors group h-full flex flex-col ${isExceeded ? 'bg-destructive/5 hover:border-destructive/30' : 'bg-card/80 hover:border-primary/20'}`}>
                                    <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                                        <div>
                                            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                                                {budget.category}
                                            </CardTitle>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1 text-primary/80">Monthly Limit</p>
                                        </div>
                                        <div className="flex gap-1 -mt-2 -mr-2">
                                            <button
                                                onClick={() => handleEdit(budget)}
                                                className="p-2 rounded-xl text-muted-foreground/50 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                title="Edit budget"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(budget.id)}
                                                className="p-2 rounded-xl text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                title="Remove budget"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-end">
                                        <div className="mb-4">
                                            <p className="text-3xl font-extrabold tracking-tight">{formatINR(budgetLimit)}</p>
                                            <p className="text-sm font-medium text-muted-foreground mt-1">
                                                Spent: <span className={isExceeded ? 'text-destructive font-bold' : 'text-foreground font-bold'}>{formatINR(categoryExpenses)}</span>
                                            </p>
                                        </div>
                                        <div className="space-y-2 mt-auto">
                                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                                <span className="flex items-center gap-1.5"><Activity className={`w-3.5 h-3.5 ${isDanger ? 'text-destructive' : isWarning ? 'text-orange-500' : isNearingLimit ? 'text-amber-400' : 'text-primary'}`} /> Tracking Usage</span>
                                                <span className={percentageTextColor}>{spentPercentage}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.max(1, spentPercentage)}%` }}
                                                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                                    className={`h-full relative overflow-hidden ${barColor}`}
                                                    title={`${spentPercentage}% used`}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

        </motion.div>
    );
}
