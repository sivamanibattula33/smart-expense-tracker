import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { UserCircle, Mail, ShieldCheck, User, BellRing, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


export function Settings() {
    const user = useAuthStore(state => state.user);
    const [subscribing, setSubscribing] = useState(false);

    const handleSubscribe = async () => {
        // Push API requires HTTPS (except on localhost).
        const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        const isHttps = location.protocol === 'https:';
        if (!isLocalhost && !isHttps) {
            toast.error('Push notifications require HTTPS. 🔒 Open the app on your laptop via http://localhost:5173 to enable them, or deploy to an HTTPS server.');
            return;
        }

        setSubscribing(true);
        try {
            if (!('serviceWorker' in navigator)) {
                throw new Error('Service workers are not supported by this browser');
            }
            if (!('PushManager' in window)) {
                throw new Error('Push notifications are not supported by this browser');
            }

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Notification permission denied. Please allow notifications in your browser settings.');
            }

            // Add a 10-second timeout so it never hangs forever
            const registration = await Promise.race([
                navigator.serviceWorker.ready,
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Service Worker took too long to activate. Try refreshing the page.')), 10000)
                )
            ]);

            const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                throw new Error('VAPID key is missing. Check your .env configuration.');
            }
            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            const subscription = await (registration as ServiceWorkerRegistration).pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            await api.post('/notifications/subscribe', subscription.toJSON());
            toast.success('🔔 Push notifications enabled! You\'ll be alerted when budgets are exceeded.');
        } catch (error: any) {
            console.error('Push Subscription Error:', error);
            toast.error(error.message || 'Failed to enable notifications.');
        } finally {
            setSubscribing(false);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            className="space-y-6 max-w-4xl mx-auto"
            initial="hidden"
            animate="show"
            variants={containerVariants}
        >
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Settings & Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your account preferences and view profile details.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <motion.div variants={itemVariants}>
                    <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-xl relative overflow-hidden group h-full">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -z-10 transition-all group-hover:bg-primary/20 group-hover:scale-150"></div>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <UserCircle className="w-5 h-5 text-primary" /> Profile Details
                            </CardTitle>
                            <CardDescription>Your personal information is securely stored.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                                    {user?.name?.charAt(0).toUpperCase() || <User />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{user?.name}</h3>
                                    <p className="text-sm text-muted-foreground font-medium capitalize">{user?.role} Account</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Email Address</p>
                                            <p className="font-semibold text-sm">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Security</p>
                                            <p className="font-semibold text-sm">Active & Secured</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                        Protected
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="shadow-lg border-muted/30 overflow-hidden bg-card/80 backdrop-blur-sm hover:border-primary/20 transition-colors h-full">
                        <CardHeader>
                            <CardTitle className="text-xl">Application</CardTitle>
                            <CardDescription>System preferences and generic settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="flex flex-col gap-4 p-5 border border-primary/20 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <BellRing className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">Budget Alerts</h4>
                                        <p className="text-xs font-medium text-muted-foreground">Get instant push notifications when you exceed category limits.</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleSubscribe}
                                    disabled={subscribing}
                                    variant="default"
                                    className="w-full sm:w-auto shadow-lg shadow-primary/25 rounded-xl font-semibold mt-2"
                                >
                                    {subscribing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BellRing className="w-4 h-4 mr-2" />}
                                    {subscribing ? 'Subscribing...' : 'Enable Notifications'}
                                </Button>
                            </div>

                            <div className="flex items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-2xl bg-muted/10">
                                <div className="text-center space-y-2">
                                    <p className="text-xs text-muted-foreground max-w-[200px] mx-auto opacity-70">
                                        More generic application settings will appear here in future updates.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
