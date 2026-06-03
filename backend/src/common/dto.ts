import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum Theme {
  DEFAULT = 'default',
  GIRLY = 'girly',
}

export enum VisualizationMode {
  AMOUNT = 'amount',
  SEGMENTS = 'segments',
}

export enum TransactionType {
  PLUS = 'plus',
  MINUS = 'minus',
}

export enum Currency {
  EUR = 'EUR',
  USD = 'USD',
  UAH = 'UAH',
  RUB = 'RUB',
  PLN = 'PLN',
  TRY = 'TRY',
  CAD = 'CAD',
  GBP = 'GBP',
  HRK = 'HRK',
}

export enum Language {
  UK = 'uk',
  EN = 'en',
  RU = 'ru',
  ES = 'es',
  BE = 'be',
  FR = 'fr',
  NL = 'nl',
}

export class CategoryPositionDto {
  @IsNumber()
  left: number;

  @IsNumber()
  top: number;
}

export class CategoryDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryPositionDto)
  position?: CategoryPositionDto;
}

export class SpherePositionDto {
  @IsNumber()
  left: number;

  @IsNumber()
  top: number;
}

export class SphereLayoutDto {
  @ValidateNested()
  @Type(() => SpherePositionDto)
  income: SpherePositionDto;

  @ValidateNested()
  @Type(() => SpherePositionDto)
  expense: SpherePositionDto;

  @ValidateNested()
  @Type(() => SpherePositionDto)
  saving: SpherePositionDto;

  @ValidateNested()
  @Type(() => SpherePositionDto)
  news: SpherePositionDto;

  @ValidateNested()
  @Type(() => SpherePositionDto)
  recent: SpherePositionDto;
}

export class GoalsPreferencesDto {
  @IsEnum(Theme)
  theme: Theme;

  @IsEnum(VisualizationMode)
  visualizationMode: VisualizationMode;

  @IsOptional()
  @IsString()
  periodStart?: string;

  @IsOptional()
  @IsString()
  periodEnd?: string;

  @IsOptional()
  @IsString()
  deadline?: string;
}

export class TransactionDto {
  @IsNumber()
  amount: number;

  @IsString()
  category: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  label?: string;
}

export class LoginDto {
  @IsOptional()
  @IsString()
  telegramId?: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  initData?: string;

  @IsOptional()
  @IsString()
  referredBy?: string;
}

export class PresenceDto {
  @IsBoolean()
  isOnline: boolean;
}

export class ActivateSubscriptionDto {
  @IsString()
  planCode: string;
}

export class CreatePaymentDto {
  @IsString()
  planCode: string;

  @IsOptional()
  @IsString()
  source?: string;
}

export class ConnectTelegramWalletDto {
  @IsString()
  telegramWalletId: string;
}

export class ConsentDto {
  @IsIn(['privacy', 'terms'])
  documentType: 'privacy' | 'terms';

  @IsString()
  documentVersion: string;
}

export class NewsItemDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsBoolean()
  isRead: boolean;
}

export class SaveStateDto {
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  incomeCategories?: CategoryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  expenseCategories?: CategoryDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SphereLayoutDto)
  sphereLayout?: SphereLayoutDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionDto)
  transactions?: TransactionDto[];

  @IsOptional()
  @IsNumber()
  quickTransactionsLimit?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewsItemDto)
  news?: NewsItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => GoalsPreferencesDto)
  goalsPreferences?: GoalsPreferencesDto;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsNumber()
  streakCurrent?: number;

  @IsOptional()
  @IsNumber()
  streakBest?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  badges?: string[];

  @IsOptional()
  weeklyChallenge?: unknown;
}

export class BillingWebhookDto {
  @IsString()
  provider: string;

  @IsString()
  providerRef: string;

  @IsString()
  telegramId: string;

  @IsString()
  planCode: string;

  @IsIn(['payment_succeeded', 'payment_failed', 'subscription_renewed'])
  eventType: 'payment_succeeded' | 'payment_failed' | 'subscription_renewed';

  @IsOptional()
  @IsString()
  signature?: string;
}
