import { Inject, Injectable } from '@nestjs/common';
import { GetUserDetailsRequest, IDENTITY_SERVICE_NAME, IdentityServiceClient, protobufPackage, SingleItemRequest } from './identity.pb';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IdentityService {
    private svc: IdentityServiceClient;

    @Inject(protobufPackage)
    private readonly client: ClientGrpc;

    public onModuleInit(): void {
        this.svc = this.client.getService<IdentityServiceClient>(IDENTITY_SERVICE_NAME);
    }


    public async getDetails(param: GetUserDetailsRequest) {
      return await firstValueFrom(this.svc.getUserDetails(param));
    }

    public async getTrackierKeys(param: SingleItemRequest) {
      return await firstValueFrom(this.svc.getTrackierKeys(param));
    }
}
