import {Injectable} from "@nestjs/common";
import {JsonLogger, LoggerFactory} from "json-logger-service";
import {EntityManager, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {Bonus} from "../../entity/bonus.entity";
import { BONUS_TYPE_FREEBET, BONUS_TYPE_REFERRAL
} from "../../constants";
import {BonusService} from "../../grpc/services/bonus.service";
import {Freebet} from "../../entity/freebet.entity";
import {Referral} from "../../entity/referral.entity";

@Injectable()
export class UserService {

    private readonly logger: JsonLogger = LoggerFactory.createLogger(UserService.name);

    constructor(

        private readonly entityManager: EntityManager,

        private bonusService : BonusService,

        @InjectRepository(Freebet)
        private freebetRepository: Repository<Freebet>,

        @InjectRepository(Referral)
        private referralRepository: Repository<Referral>,

        @InjectRepository(Bonus)
        private bonusRepository: Repository<Bonus>,

    ) {

    }

/*
{
  "client_id": 1,
  "user_id": 42942553,
}
 */
    async newUser(data: any): Promise<number> {

        data = JSON.parse(JSON.stringify(data))

        // check if user_id already recorded
        let freebetExists = await this.freebetRepository.findOne({
            where: {
                client_id: data.client_id,
                user_id: data.user_id,
            }
        });

        if (freebetExists !== undefined && freebetExists.id !== undefined && freebetExists.id > 0) {

            return 0
        }

        // check if client has this bonus activated
        let bonusSettings = await this.bonusRepository.findOne({
            where: {
                client_id: data.client_id,
                status: 1,
                bonus_type: BONUS_TYPE_FREEBET
            }
        });

        if (bonusSettings === undefined || bonusSettings.id === undefined || bonusSettings.id === 0) {

            return 0
        }

        // create freebet
        let freebet = new Freebet()
        freebet.client_id = data.client_id;
        freebet.user_id = data.user_id;

        await this.freebetRepository.save(freebet)

        // award bonus to user

        let res = await this.bonusService.awardBonus({
            clientId: data.client_id,
            userId: data.user_id,
            amount: bonusSettings.bonus_amount,
            bonusType: BONUS_TYPE_FREEBET,
            bonusId: 0,
            baseValue: 0,
        })

        return res.bonus.amount
    }

    /*
    {
      "client_id": 1,
      "user_id": 42942553,
      "referred_user_id": 42942553,
      "amount": 100
    }
     */
    async referral(data: any): Promise<number> {

        data = JSON.parse(JSON.stringify(data))

        // check if user_id already recorded
        let referralExists = await this.referralRepository.findOne({
            where: {
                client_id: data.client_id,
                referred_user_id: data.referred_user_id,
            }
        });

        if (referralExists !== undefined && referralExists.id !== undefined && referralExists.id > 0) {

            return 0
        }

        // check if client has this bonus activated
        let bonusSettings = await this.bonusRepository.findOne({
            where: {
                client_id: data.client_id,
                status: 1,
                bonus_type: BONUS_TYPE_REFERRAL
            }
        });

        if (bonusSettings === undefined || bonusSettings.id === undefined || bonusSettings.id === 0) {

            return 0
        }

        // validate bonus settings
        if(parseFloat(data.amount) < bonusSettings.minimum_entry_amount ) {

            return 0
        }

        // create referral
        let referral = new Referral()
        referral.client_id = data.client_id;
        referral.user_id = data.user_id;
        referral.referred_user_id = data.referred_user_id;

        await this.referralRepository.save(referral)

        // award bonus to user

        let res = await this.bonusService.awardBonus({
            clientId: data.client_id,
            userId: data.user_id,
            amount: bonusSettings.bonus_amount,
            bonusType: BONUS_TYPE_REFERRAL,
            bonusId: 0,
            baseValue: data.amount
        })

        return res.bonus.amount
    }

}