import { Controller, Post } from '@nestjs/common';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Post('/clear')
    public async clearAccounts() {
        return await this.accountsService.clearAccounts();
    }
}