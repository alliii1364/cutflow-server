"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(email, password, firstName, lastName) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        let freePlan = await this.prisma.plan.findFirst({
            where: { tier: 'FREE' },
        });
        if (!freePlan) {
            freePlan = await this.prisma.plan.create({
                data: {
                    name: 'Free',
                    tier: 'FREE',
                    priceMonthly: 0,
                    priceYearly: 0,
                    videoLimit: 1,
                    maxVideoDuration: 60,
                },
            });
        }
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                subscription: {
                    create: {
                        planId: freePlan.id,
                        status: 'INACTIVE',
                    },
                },
            },
            include: {
                subscription: {
                    include: { plan: true },
                },
            },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                subscription: {
                    include: { plan: true },
                },
            },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }
    async logout(userId, refreshToken) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, token: refreshToken },
            data: { revokedAt: new Date() },
        });
        return { success: true };
    }
    async refreshTokens(refreshToken) {
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: { include: { subscription: { include: { plan: true } } } } },
        });
        if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const tokens = await this.generateTokens(tokenRecord.user.id, tokenRecord.user.email, tokenRecord.user.role);
        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revokedAt: new Date() },
        });
        await this.saveRefreshToken(tokenRecord.user.id, tokens.refreshToken);
        return {
            user: this.sanitizeUser(tokenRecord.user),
            tokens,
        };
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { message: 'If an account exists, a reset code has been sent' };
        }
        await this.prisma.passwordResetToken.updateMany({
            where: { userId: user.id, usedAt: null },
            data: { usedAt: new Date() },
        });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: otp,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        return { message: 'If an account exists, a reset code has been sent' };
    }
    async verifyResetOtp(email, otp) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid code');
        }
        const record = await this.prisma.passwordResetToken.findFirst({
            where: { userId: user.id, token: otp, usedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        if (!record || record.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired code');
        }
        const resetToken = (0, uuid_1.v4)();
        await this.prisma.passwordResetToken.update({
            where: { id: record.id },
            data: { token: resetToken },
        });
        return { resetToken };
    }
    async resetPassword(token, newPassword) {
        const resetRecord = await this.prisma.passwordResetToken.findUnique({
            where: { token },
        });
        if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: resetRecord.userId },
                data: { passwordHash },
            }),
            this.prisma.passwordResetToken.update({
                where: { id: resetRecord.id },
                data: { usedAt: new Date() },
            }),
        ]);
        return { success: true, message: 'Password has been reset' };
    }
    async generateTokens(userId, email, role) {
        const accessToken = this.jwtService.sign({ sub: userId, email, role }, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION') || '15m',
        });
        const refreshToken = this.jwtService.sign({ sub: userId, type: 'refresh' }, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
        };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
                emailVerified: true,
                isActive: true,
                createdAt: true,
                subscription: { include: { plan: true } },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return { user };
    }
    async saveRefreshToken(userId, token) {
        const raw = this.configService.get('JWT_REFRESH_EXPIRATION') || '7d';
        const days = parseInt(raw, 10) || 7;
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
    }
    sanitizeUser(user) {
        const { passwordHash, refreshTokens, passwordResetTokens, ...sanitized } = user;
        return sanitized;
    }
    async handleGoogleCallback(user) {
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map