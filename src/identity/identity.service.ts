import { Inject, Injectable } from '@nestjs/common';
import { GetUserDetailsRequest, IDENTITY_SERVICE_NAME, IdentityServiceClient, protobufPackage } from './identity.pb';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class IdentityService {
    private svc: IdentityServiceClient;

    @Inject(protobufPackage)
    private readonly client: ClientGrpc;

    public onModuleInit(): void {
        this.svc = this.client.getService<IdentityServiceClient>(IDENTITY_SERVICE_NAME);
    }


    public getDetails(param: GetUserDetailsRequest) {
      return this.svc.getUserDetails(param);
    }
}
