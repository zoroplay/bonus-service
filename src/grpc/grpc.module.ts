import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {GrpcController} from "./grpc.controller";
import {Bonus} from "../entity/bonus.entity";
import {Userbonus} from "../entity/userbonus.entity";
import {BonusService} from "./services/bonus.service";
import {Firstdeposit} from "../entity/firstdeposit.entity";
import {Freebet} from "../entity/freebet.entity";
import {Lostbet} from "../entity/lostbet.entity";
import {Referral} from "../entity/referral.entity";
import {Sharebet} from "../entity/sharebet.entity";
import {Cashback} from "../entity/cashback.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Bonus,Firstdeposit,Freebet,Lostbet,Referral,Sharebet,Userbonus,Cashback]),
    ],
    controllers: [GrpcController],
    providers: [BonusService]
})
export class GrpcModule {
}