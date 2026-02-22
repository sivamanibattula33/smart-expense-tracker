import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private prisma: PrismaService) {
        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT || 'mailto:admin@smart-expense-tracker.local',
            process.env.VAPID_PUBLIC_KEY as string,
            process.env.VAPID_PRIVATE_KEY as string,
        );
    }

    async saveSubscription(userId: string, subscription: any) {
        const { endpoint, keys } = subscription;

        return this.prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                userId,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
            create: {
                userId,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
        });
    }

    async sendPushToUser(userId: string, payload: any) {
        const subscriptions = await this.prisma.pushSubscription.findMany({
            where: { userId },
        });

        if (subscriptions.length === 0) {
            this.logger.debug(`No push subscriptions found for user ${userId}`);
            return;
        }

        const payloadString = JSON.stringify(payload);

        await Promise.all(
            subscriptions.map(async (sub) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                };

                try {
                    await webpush.sendNotification(pushSubscription, payloadString);
                } catch (error: any) {
                    this.logger.error(`Error sending push notification to endpoint ${sub.endpoint}`, error);
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        // Subscription has expired or is no longer valid
                        this.logger.log(`Removing extinct push subscription: ${sub.endpoint}`);
                        await this.prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
                    }
                }
            })
        );
    }
}
