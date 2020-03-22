import { UsersService } from './../users/users.service';
import { ConfigService } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { sign } from 'jsonwebtoken';

export enum Provider {
    GOOGLE = 'google',
}
@Injectable()
export class AuthService {
    private readonly JWT_SECRET_KEY = this.configService.get<string>(
        'JWT_SECRET_KEY',
    );
    constructor(
        private configService: ConfigService,
        private userService: UsersService,
    ) {}

    async validateOAuthLogin({ id, displayName, photo }): Promise<string> {
        try {
            let user: any = await this.userService.findOneByThirdPartyId(id);
            console.log(user);

            if (!user) {
                user = await this.userService.registerOauthUser({
                    id,
                    displayName,
                });
            }

            const payload = {
                id,
                displayName,
                photo,
            };

            const jwt: string = sign(payload, this.JWT_SECRET_KEY, {
                expiresIn: 3600,
            });
            return jwt;
        } catch (err) {
            throw new InternalServerErrorException(
                'validateOAuthLogin',
                err.message,
            );
        }
    }
}
