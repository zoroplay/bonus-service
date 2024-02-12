import {Injectable} from "@nestjs/common";
import {JsonLogger, LoggerFactory} from "json-logger-service";
import {EntityManager, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {Bonus} from "../../entity/bonus.entity";
import {BONUS_TYPE_CASHBACK, BONUS_TYPE_SHARE_BET} from "../../constants";
import {Userbonus} from "../../entity/userbonus.entity";
import {BonusService} from "../../grpc/services/bonus.service";
import {Sharebet} from "../../entity/sharebet.entity";
import {Cashback} from "../../entity/cashback.entity";
import {AwardBonusRequest} from "../../grpc/interfaces/award.bonus.request.interface";

@Injectable()
export class BetService {

    private readonly logger: JsonLogger = LoggerFactory.createLogger(BetService.name);

    constructor(
        private readonly entityManager: EntityManager,
        private bonusService: BonusService,
        @InjectRepository(Cashback)
        private cashbackRepository: Repository<Cashback>,
        @InjectRepository(Sharebet)
        private sharebetRepository: Repository<Sharebet>,
        @InjectRepository(Bonus)
        private bonusRepository: Repository<Bonus>,
    ) {

    }

    /*
{
  "client_id": 1,
  "user_id": 42942553,
  "stake": 340.09,
  "bet_id": "ref"
}
 */
    async shareBet(data: any): Promise<number> {

        data = JSON.parse(JSON.stringify(data))

        // check if reference already recorded
        let sharebetExists = await this.sharebetRepository.findOne({
            where: {
                client_id: data.client_id,
                bet_id: data.bet_id,
            }
        });

        if (sharebetExists !== undefined && sharebetExists.id !== undefined && sharebetExists.id > 0) {

            return 0
        }

        // check if client has this bonus activated
        let bonusSettings = await this.bonusRepository.findOne({
            where: {
                client_id: data.client_id,
                status: 1,
                bonus_type: BONUS_TYPE_SHARE_BET
            }
        });

        if (bonusSettings === undefined || bonusSettings.id === undefined || bonusSettings.id === 0) {

            return 0
        }

        // validate bonus settings
        if (parseFloat(data.amount) < bonusSettings.minimum_entry_amount) {

            return 0
        }

        // create sharebet
        let sharebet = new Sharebet()
        sharebet.client_id = data.client_id;
        sharebet.user_id = data.user_id;
        sharebet.bet_id = data.bet_id;

        await this.sharebetRepository.save(sharebet)

        // award bonus to user
        let userBonus = new Userbonus();

        let res = await this.bonusService.awardBonus({
            clientId: data.client_id,
            userId: ""+data.user_id,
            amount: bonusSettings.bonus_amount,
            // bonusType: BONUS_TYPE_SHARE_BET,
            bonusId: 0,
            baseValue: data.stake,
        })

        return res.bonus.amount
    }

    /*
    {
      "client_id": 1,
      "user_id": 42942553,
      "stake": 340.09,
      "bet_id": "ref",
      "total_odd": 1.2,
      "betslip": [
        {
          "match_id": 1,
          "market_id": 1,
          "specifier": "",
          "outcome_id": 1,
          "odds": 1.3,
          "status":0
        }
      ]
    }
    */
    async cashback(data: any): Promise<number> {

        data = JSON.parse(JSON.stringify(data))

        // check if reference already recorded
        let cashbackExists = await this.cashbackRepository.findOne({
            where: {
                client_id: data.client_id,
                bet_id: data.bet_id,
            }
        });

        if (cashbackExists !== undefined && cashbackExists.id !== undefined && cashbackExists.id > 0) {

            return 0
        }

        // check if client has this bonus activated
        let bonusSettings = await this.bonusRepository.findOne({
            where: {
                client_id: data.client_id,
                status: 1,
                bonus_type: BONUS_TYPE_CASHBACK
            }
        });

        if (bonusSettings === undefined || bonusSettings.id === undefined || bonusSettings.id === 0) {

            return 0
        }

        // validate bonus settings
        if (parseFloat(data.stake) < bonusSettings.minimum_entry_amount) {

            return 0
        }

        // validate bonus settings
        if (data.betslip.length < bonusSettings.minimum_selection) {

            return 0
        }

        // get lost games
        let betslips = data.betslip
        let lostGames = 0;

        for (const slip of betslips) {

            if (parseInt(slip.status) === 0) {

                lostGames++
            }
        }

        // validate bonus settings
        if (lostGames < bonusSettings.minimum_lost_games) {

            return 0
        }

        // create cashback
        let cashback = new Cashback()
        cashback.client_id = data.client_id;
        cashback.user_id = data.user_id;
        cashback.bet_id = data.bet_id;

        await this.cashbackRepository.save(cashback)

        // award bonus to user
        let res = await this.bonusService.awardBonus({
            clientId: data.client_id,
            userId: data.user_id,
            amount: bonusSettings.bonus_amount,
            // bonusType: BONUS_TYPE_CASHBACK,
            bonusId: 0,
            baseValue: data.stake,
        })

        return res.bonus.amount
    }

}