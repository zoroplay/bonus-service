import { Inject, Injectable } from '@nestjs/common';
import { CreditUserRequest, DebitUserRequest, GetBalanceRequest, WALLET_SERVICE_NAME, WalletServiceClient, protobufPackage } from './wallet.pb';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WalletService {
    private svc: WalletServiceClient;

    @Inject(protobufPackage)
    private readonly client: ClientGrpc;

    public onModuleInit(): void {
        this.svc = this.client.getService<WalletServiceClient>(WALLET_SERVICE_NAME);
    }


    public async getWallet(param: GetBalanceRequest) {
      return await firstValueFrom(this.svc.getBalance(param));
    }

    public async debit(data: DebitUserRequest) {
      return firstValueFrom(this.svc.debitUser(data));
    }

    public async credit(data: CreditUserRequest) {
      return firstValueFrom(this.svc.creditUser(data));
    }

    public async awardBonusWinning(data: CreditUserRequest) {
      return firstValueFrom(this.svc.awardBonusWinning(data));
    }
    
}
