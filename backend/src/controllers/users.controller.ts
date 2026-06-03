import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ActivateSubscriptionDto,
  BillingWebhookDto,
  ConnectTelegramWalletDto,
  ConsentDto,
  CreatePaymentDto,
  LoginDto,
  PresenceDto,
  SaveStateDto,
} from '../common/dto';
import { AuthGuard } from '../common/guards';
import { TelegramInitDataService } from '../services/telegram-init-data.service';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramInitDataService: TelegramInitDataService,
  ) {}

  @Post('login')
  async login(
    @Body() data: LoginDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-telegram-init-data') headerInitData?: string,
  ) {
    const authInitData = authorization?.startsWith('tma ')
      ? authorization.slice(4)
      : undefined;
    const parsedTelegramProfile = this.telegramInitDataService.validateAndParse(
      data?.initData || headerInitData || authInitData,
    );

    if (!parsedTelegramProfile) {
      throw new UnauthorizedException('Invalid Telegram initData signature');
    }

    const telegramId = parsedTelegramProfile?.telegramId || data.telegramId;
    const userName = parsedTelegramProfile?.userName || data.userName;

    if (!telegramId) {
      throw new BadRequestException('telegramId is required for login');
    }

    const user = await this.usersService.findOrCreateUser(
      telegramId,
      userName || `Guest ${telegramId.slice(-4)}`,
      data?.referredBy,
    );

    const accessToken = await this.usersService.issueSessionToken(user.id);

    return {
      user,
      accessToken,
    };
  }

  @Get('me/billing')
  @UseGuards(AuthGuard)
  async getBilling(
    @Req() request: Request & { user?: { telegramId: string } },
  ) {
    const telegramId = request.user?.telegramId;
    if (!telegramId)
      throw new BadRequestException('Authenticated user is required');
    return this.usersService.getBillingOverview(telegramId);
  }

  @Post('me/billing/payment')
  @UseGuards(AuthGuard)
  async createBillingPayment(
    @Req() request: Request & { user?: { telegramId: string } },
    @Body() payload: CreatePaymentDto,
  ) {
    const telegramId = request.user?.telegramId;
    if (!telegramId)
      throw new BadRequestException('Authenticated user is required');
    return this.usersService.createPayment(
      telegramId,
      payload.planCode,
      payload.source,
    );
  }

  @Post('me/billing/activate')
  @UseGuards(AuthGuard)
  async activateBilling(
    @Req() request: Request & { user?: { telegramId: string } },
    @Body() payload: ActivateSubscriptionDto,
  ) {
    const telegramId = request.user?.telegramId;
    if (!telegramId)
      throw new BadRequestException('Authenticated user is required');
    return this.usersService.activateSubscription(telegramId, payload.planCode);
  }

  @Post('me/billing/trial')
  @UseGuards(AuthGuard)
  async startTrial(
    @Req() request: Request & { user?: { telegramId: string } },
  ) {
    const telegramId = request.user?.telegramId;
    if (!telegramId)
      throw new BadRequestException('Authenticated user is required');
    return this.usersService.startTrialSubscription(telegramId);
  }

  @Post('me/billing/cancel')
  @UseGuards(AuthGuard)
  async cancelBilling(
    @Req() request: Request & { user?: { telegramId: string } },
  ) {
    const telegramId = request.user?.telegramId;
    if (!telegramId)
      throw new BadRequestException('Authenticated user is required');
    return this.usersService.cancelSubscription(telegramId);
  }

  @Post('billing/webhook')
  async handleBillingWebhook(@Body() payload: BillingWebhookDto) {
    return this.usersService.handleBillingWebhook(payload);
  }

  @Get('me/wallet')
  @UseGuards(AuthGuard)
  async getWallet(@Req() request: Request & { user?: { telegramId: string } }) {
    const telegramId = request.user?.telegramId;
    if (!telegramId)
      throw new BadRequestException('Authenticated user is required');
    return this.usersService.getTelegramWallet(telegramId);
  }

  @Put('me/wallet')
  @UseGuards(AuthGuard)
  async connectWallet(
    @Req() request: Request & { user?: { telegramId: string } },
    @Body() payload: ConnectTelegramWalletDto,
  ) {
    const telegramId = request.user?.telegramId;
    if (!telegramId)
      throw new BadRequestException('Authenticated user is required');
    return this.usersService.connectTelegramWallet(
      telegramId,
      payload.telegramWalletId,
    );
  }

  @Post('me/wallet/disconnect')
  @UseGuards(AuthGuard)
  async disconnectWallet(
    @Req() request: Request & { user?: { telegramId: string } },
  ) {
    const telegramId = request.user?.telegramId;
    if (!telegramId)
      throw new BadRequestException('Authenticated user is required');
    return this.usersService.disconnectTelegramWallet(telegramId);
  }

  @Post('me/consent')
  @UseGuards(AuthGuard)
  async saveConsent(
    @Req() request: Request & { user?: { telegramId: string } },
    @Body() payload: ConsentDto,
  ) {
    const telegramId = request.user?.telegramId;
    if (!telegramId)
      throw new BadRequestException('Authenticated user is required');
    return this.usersService.recordConsent(
      telegramId,
      payload.documentType,
      payload.documentVersion,
      request.ip,
    );
  }

  @Get('me/state')
  @UseGuards(AuthGuard)
  async getState(@Req() request: Request & { user?: { telegramId: string } }) {
    const telegramId = request.user?.telegramId;
    if (!telegramId) {
      throw new BadRequestException('Authenticated user is required');
    }
    return this.usersService.getUserState(telegramId);
  }

  @Put('me/state')
  @UseGuards(AuthGuard)
  async saveState(
    @Req() request: Request & { user?: { telegramId: string } },
    @Body() payload: SaveStateDto,
  ) {
    const telegramId = request.user?.telegramId;
    if (!telegramId) {
      throw new BadRequestException('Authenticated user is required');
    }
    return this.usersService.saveUserState(telegramId, payload);
  }

  @Patch('me/presence')
  @UseGuards(AuthGuard)
  async setPresence(
    @Req() request: Request & { user?: { telegramId: string } },
    @Body() payload: PresenceDto,
  ) {
    const telegramId = request.user?.telegramId;
    if (!telegramId) {
      throw new BadRequestException('Authenticated user is required');
    }
    return this.usersService.updatePresence(telegramId, payload.isOnline);
  }
  @Get('me/referrals')
  @UseGuards(AuthGuard)
  async getReferrals(
    @Req() request: Request & { user?: { telegramId: string } },
  ) {
    const telegramId = request.user?.telegramId;
    if (!telegramId) {
      throw new BadRequestException('Authenticated user is required');
    }
    return this.usersService.getReferralOverview(telegramId);
  }
}
