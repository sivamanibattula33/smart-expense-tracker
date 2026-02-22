import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { formatINR, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PlusCircle, Trash2, Upload, Download, ArrowUpRight, ArrowDownLeft, FileText, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { toast } from 'sonner';

const CATEGORIES = ['Food', 'Rent', 'Travel', 'Shopping', 'Bills', 'Education', 'Health', 'EMI', 'Others'];

export function Transactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [type, setType] = useState('EXPENSE');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data } = await api.get('/transactions');
            setTransactions(data);
        } catch (err) {
            console.error('Failed to fetch txns', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const numAmount = Number(amount);
            const txnCategory = type === 'INCOME' ? 'Income' : category;

            await api.post('/transactions', {
                type,
                amount: numAmount,
                category: txnCategory,
                notes,
                date: new Date(date).toISOString(),
            });

            // Budget validation logic for expenses
            if (type === 'EXPENSE') {
                const [txnsRes, budgetsRes] = await Promise.all([
                    api.get('/transactions'),
                    api.get('/budgets')
                ]);
                const allTxns = txnsRes.data;
                const budgets = budgetsRes.data;

                const currentMonth = new Date(date).getMonth();
                const currentYear = new Date(date).getFullYear();

                const categoryExpenses = allTxns
                    .filter((t: any) => t.type === 'EXPENSE' && t.category === txnCategory && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
                    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

                const activeBudget = budgets.find((b: any) => b.category === txnCategory && b.month === currentMonth && b.year === currentYear);

                if (activeBudget && categoryExpenses > Number(activeBudget.limitAmount)) {
                    toast.warning(`Budget Limit Exceeded!`, {
                        description: `You've spent ${formatINR(categoryExpenses)} on ${txnCategory}, exceeding the ${formatINR(Number(activeBudget.limitAmount))} limit.`,
                        icon: <AlertTriangle className="text-amber-500" />
                    });
                } else {
                    toast.success('Transaction saved securely.');
                }
            } else {
                toast.success('Income recorded successfully.');
            }

            setShowForm(false);
            setAmount('');
            setNotes('');
            setType('EXPENSE');
            fetchTransactions();
        } catch (err: any) {
            console.error('Failed to add txn', err);
            toast.error(err.response?.data?.message || 'Failed to save transaction');
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('WARNING: Are you sure you want to delete ALL transactions? This action cannot be undone.')) return;
        try {
            await api.delete('/transactions/all');
            toast.success('All transactions have been deleted.');
            fetchTransactions();
        } catch (err: any) {
            console.error('Failed to clear transactions', err);
            toast.error(err.response?.data?.message || 'Failed to delete transactions');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions();
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
                    <h1 className="text-3xl font-extrabold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground mt-1">Manage all your income and expenses.</p>
                </div>

                <div className="flex gap-2 flex-wrap items-center">
                    <input
                        type="file"
                        accept=".csv,application/vnd.ms-excel"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append('file', file);

                            setUploading(true);
                            try {
                                const { data } = await api.post('/transactions/upload', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' },
                                });
                                toast.success(`Successfully imported ${data.count} transactions!`);
                                fetchTransactions();
                            } catch (err: any) {
                                console.error('Upload failed', err);
                                toast.error(err.response?.data?.message || 'Failed to import transactions');
                            } finally {
                                setUploading(false);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }
                        }}
                    />
                    <Button variant="secondary" size="sm" className="hidden sm:flex rounded-xl font-medium" onClick={() => {
                        const csvContent = 'Date,Description,Amount,Type,Category\n2024-10-31,Grocery shopping,1500,EXPENSE,Food\n2024-11-01,Salary,50000,INCOME,Others\n';
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.setAttribute('href', url);
                        link.setAttribute('download', 'Smart_Expense_Template.csv');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}>
                        <Download className="mr-2 h-4 w-4" />
                        Template
                    </Button>
                    <Button variant="secondary" size="sm" className="rounded-xl font-medium" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? 'Wait...' : 'Import CSV'}
                    </Button>
                    <Button variant="destructive" size="sm" className="rounded-xl font-medium shadow-lg shadow-destructive/20" onClick={handleDeleteAll} disabled={transactions.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All
                    </Button>
                    <Button size="sm" className="rounded-xl shadow-lg shadow-primary/20" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New
                            </>
                        )}
                    </Button>
                </div>
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
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 transition-all group-hover:bg-primary/10"></div>
                            <CardHeader>
                                <CardTitle className="text-xl">New Transaction</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddTransaction} className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Transaction Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setType('EXPENSE')}
                                                className={cn("flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-medium text-sm", type === 'EXPENSE' ? "bg-rose-500/10 border-rose-500/50 text-rose-500" : "bg-background border-border hover:bg-muted text-muted-foreground")}
                                            >
                                                <ArrowUpRight className="w-4 h-4" /> Expense
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setType('INCOME')}
                                                className={cn("flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-medium text-sm", type === 'INCOME' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-background border-border hover:bg-muted text-muted-foreground")}
                                            >
                                                <ArrowDownLeft className="w-4 h-4" /> Income
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Amount (₹)</label>
                                        <Input className="h-11 rounded-xl" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="e.g. 500" />
                                    </div>

                                    <AnimatePresence>
                                        {type === 'EXPENSE' && (
                                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-2">
                                                <label className="text-sm font-medium">Category</label>
                                                <select
                                                    value={category} onChange={(e) => setCategory(e.target.value)}
                                                    className="flex h-11 w-full rounded-xl border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all font-medium appearance-none"
                                                >
                                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                </select>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Date</label>
                                        <Input className="h-11 rounded-xl" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium">Notes (Optional)</label>
                                        <Input className="h-11 rounded-xl" type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Lunch with team..." />
                                    </div>

                                    <div className="md:col-span-2 flex justify-end pt-2">
                                        <Button className="rounded-xl px-8 shadow-lg shadow-primary/20" type="submit">Save Transaction</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={itemVariants}>
                <Card className="shadow-lg border-muted/30 overflow-hidden bg-card/80 backdrop-blur-sm">
                    {loading ? (
                        <div className="flex items-center justify-center p-12 text-primary/50">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
                            <FileText className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium text-lg text-foreground">No transactions found</p>
                            <p className="text-sm mt-1">Add your first transaction to get started!</p>
                        </div>
                    ) : (
                        <motion.div
                            className="divide-y divide-border/40"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                        >
                            {transactions.map((txn) => (
                                <motion.div
                                    key={txn.id}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="p-4 sm:px-6 flex items-center justify-between hover:bg-muted/30 transition-colors group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={cn(
                                            "p-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105",
                                            txn.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                        )}>
                                            {txn.type === 'INCOME' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground capitalize tracking-tight flex items-center gap-2">
                                                {txn.category}
                                                {txn.notes && <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-accent text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate max-w-[150px]">{txn.notes}</span>}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-medium mt-0.5">{format(new Date(txn.date), 'dd MMM yyyy')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <span className={cn(
                                            "font-extrabold text-base tracking-tight",
                                            txn.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'
                                        )}>
                                            {txn.type === 'INCOME' ? '+' : '-'}{formatINR(txn.amount)}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(txn.id)}
                                            className="p-2 rounded-xl text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete transaction"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </Card>
            </motion.div>
        </motion.div>
    );
}
