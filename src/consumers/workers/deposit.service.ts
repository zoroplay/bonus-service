import {Injectable} from "@nestjs/common";
import {JsonLogger, LoggerFactory} from "json-logger-service";
import {EntityManager, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {Bonus} from "../../entity/bonus.entity";
import {Firstdeposit} from "../../entity/firstdeposit.entity";
import {
    BONUS_RESET_TYPE_DAILY,
    BONUS_RESET_TYPE_MONTHLY,
    BONUS_RESET_TYPE_WEEKLY,
    BONUS_TYPE_FIRST_DEPOSIT
} from "../../constants";
import {Userbonus} from "../../entity/userbonus.entity";
import {BonusService} from "../../grpc/services/bonus.service";

@Injectable()
export class DepositService {

    private readonly logger: JsonLogger = LoggerFactory.createLogger(DepositService.name);

    constructor(

        private readonly entityManager: EntityManager,

        private bonusService : BonusService,

        @InjectRepository(Firstdeposit)
        private firstDepositRepository: Repository<Firstdeposit>,

        @InjectRepository(Bonus)
        private bonusRepository: Repository<Bonus>,

    ) {

    }

    /*
{
  "client_id": 1,
  "user_id": 42942553,
  "amount": 340.09,
  "reference": "ref"
}
 */
    async firstUserDeposit(data: any): Promise<number> {

        data = JSON.parse(JSON.stringify(data))

        // check if reference already recorded
        let depositExists = await this.firstDepositRepository.findOne({
            where: {
                client_id: data.client_id,
                reference: data.reference,
            }
        });

        if (depositExists !== undefined && depositExists.id !== undefined && depositExists.id > 0) {

            return 0
        }

        // check if client has this bonus activated
        let bonusSettings = await this.bonusRepository.findOne({
            where: {
                client_id: data.client_id,
                status: 1,
                bonus_type: BONUS_TYPE_FIRST_DEPOSIT
            }
        });

        if (bonusSettings === undefined || bonusSettings.id === undefined || bonusSettings.id === 0) {

            return 0
        }

        // validate bonus settings
        if(parseFloat(data.amount) < bonusSettings.minimum_entry_amount ) {

            return 0
        }

        if(bonusSettings.reset_interval_type == null || bonusSettings.reset_interval_type.length === 0 ) {
            // no resets only award once

            // calculate how many times the user has received this bonus
            // check if reference already recorded
            let counts = await this.firstDepositRepository.count({
                where: {
                    client_id: data.client_id,
                    user_id: data.user_id,
                }
            });

            if(counts > 0 ) {

                return 0
            }

        } else if (bonusSettings.reset_interval_type === BONUS_RESET_TYPE_DAILY) {

            let counts = 0;

            let rows = await this.entityManager.query("SELECT count(id) as total FROM firstdeposit where user_id = ? AND date(created) = curdate() ",[data.user_id])
            for (const row of rows) {

                counts = row.total;
            }

            if(counts > 0 ) {

                return 0
            }

        } else if (bonusSettings.reset_interval_type === BONUS_RESET_TYPE_WEEKLY) {

            let counts = 0;

            let rows = await this.entityManager.query("SELECT count(id) as total FROM firstdeposit where user_id = ? AND week(created) = week(now()) ",[data.user_id])
            for (const row of rows) {

                counts = row.total;
            }

            if(counts > 0 ) {

                return 0
            }

        } else if (bonusSettings.reset_interval_type === BONUS_RESET_TYPE_MONTHLY) {

            let counts = 0;

            let rows = await this.entityManager.query("SELECT count(id) as total FROM firstdeposit where user_id = ? AND week(created) = week(now()) ",[data.user_id])
            for (const row of rows) {

                counts = row.total;
            }

            if(counts > 0 ) {

                return 0
            }

        } else {

            // calculate how many times the user has received this bonus
            // check if reference already recorded
            let counts = await this.firstDepositRepository.count({
                where: {
                    client_id: data.client_id,
                    user_id: data.user_id,
                }
            });

            if(counts > 0 ) {

                return 0
            }
        }

        // create first depost
        let firstDeposit = new Firstdeposit()
        firstDeposit.client_id = data.client_id;
        firstDeposit.user_id = data.user_id;
        firstDeposit.reference = data.reference;

        await this.firstDepositRepository.save(firstDeposit)

        // award bonus to user
        let userBonus = new Userbonus();

        let res = await this.bonusService.awardBonus({
            clientId: data.client_id,
            userId: data.user_id,
            amount: bonusSettings.bonus_amount,
            bonusType: BONUS_TYPE_FIRST_DEPOSIT,
            bonusId:0,
            baseValue: data.amount,
        })

        return res.bonus.amount
    }

}