import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, name, photos } = profile;

    const email = emails[0].value;
    const firstName = name.givenName;
    const lastName = name.familyName;
    const picture = photos?.[0]?.value;

    let user = await this.prisma.user.findUnique({
      where: { googleId: id },
      include: { subscription: { include: { plan: true } } },
    });

    if (!user) {
      // Check if user exists with same email
      user = await this.prisma.user.findUnique({
        where: { email },
        include: { subscription: { include: { plan: true } } },
      });

      if (user) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: id, avatarUrl: picture || user.avatarUrl },
          include: { subscription: { include: { plan: true } } },
        });
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email,
            googleId: id,
            firstName,
            lastName,
            avatarUrl: picture,
            emailVerified: true,
            subscription: {
              create: {
                plan: { connect: { id: 'free-plan-id' } }, // Will need seed
                status: 'INACTIVE',
              },
            },
          },
          include: { subscription: { include: { plan: true } } },
        });
      }
    }

    done(null, user);
  }
}
