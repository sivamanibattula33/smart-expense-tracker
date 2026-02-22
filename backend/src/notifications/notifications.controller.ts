import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('subscribe')
    async subscribe(@Request() req: any, @Body() subscription: any) {
        const userId = req.user.userId;
        await this.notificationsService.saveSubscription(userId, subscription);
        return { message: 'Subscription saved successfully.' };
    }

    @Get('vapid-public-key')
    getVapidPublicKey() {
        return { publicKey: process.env.VAPID_PUBLIC_KEY };
    }
}
