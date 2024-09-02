import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Bonus } from 'src/entity/bonus.entity';
import { Repository } from 'typeorm';
import { CreateCampaignBonusDto } from '../interfaces/campaign.bonus.interface';
import * as dayjs from 'dayjs';
import { IdentityService } from 'src/identity/identity.service';

@Injectable()
export class TrackierService {

    protected baseUrl = 'https://api.trackierigaming.io';

    constructor(
        @InjectRepository(Bonus)
        private readonly bonusRepository: Repository<Bonus>,
        private readonly identityService: IdentityService,
    ) {}

    async getAccessToken(auth_code: string) {
        // console.log('AUTH CODE', process.env.TRACKIER_AUTH_CODE)
        return axios.post(
            `${this.baseUrl}/oauth/access-refresh-token`,
            {
                auth_code,
            },
        );
    }

    async createTrackierPromoCode(data: CreateCampaignBonusDto) {
        try {

            const bonus = await this.bonusRepository.findOne({where: {id: data.bonusId}});
            const now = new Date();
            const start = new Date(data.startDate);
            let status = 'active';
            const amount: any = bonus.bonus_amount;
            if (start > now) status = 'future';

            const payload = {
                code: data.bonusCode,
                campaignId: data.trackierCampaignId,
                affiliateIds: data.affiliateIds.split(','),
                currency: 'ngn',
                bonus: parseFloat(amount),
                type: 'exclusive',
                status,
                startDate: data.startDate,
                endDate: data.endDate,
            }

            // get trackier keys
            const keys = await this.identityService.getTrackierKeys({itemId: data.clientId});

            if (keys.success) {
                const authRes = await this.getAccessToken(keys.data.AuthCode);
                
                if (!authRes.data.success) {
                    console.log('Error sending trackier result', authRes);
                }

                // console.log(payload)

                const apiKey = keys.data.ApiKey
                
                console.log('API KEY', apiKey)

                const resp = await axios.post(
                    `${this.baseUrl}/coupon`, payload,
                    {
                        headers: {
                            'x-api-key': apiKey,
                            authorization: `BEARER ${authRes.data.accessToken}`,
                        },
                    },
                );
                console.log('trackier response ', resp.data);
                return resp.data;
            }
        } catch (e) {
            console.log('Trackier error', e.message)
            return {success: false, message: e.emssage};
        }
    }

    async createCustomer (data) {
        try {
            // get trackier keys
            const keys = await this.identityService.getTrackierKeys({itemId: data.clientId});
            if (keys.success) {
                const authRes = await this.getAccessToken(keys.data.AuthCode);
                const apiKey = keys.data.ApiKey;
                    
                if (authRes.data.success && apiKey) {
                    const payload = {
                        customerId: data.username,
                        customerName: data.username,
                        date: dayjs().format('YYYY-MM-DD'),
                        timestamp: dayjs().unix(),
                        country: 'NG',
                        currency: 'ngn',
                        promocode: data.promoCode,
                        productId: '1',
                    }

                    return await axios.post(
                        `${this.baseUrl}/customer`, payload,
                        {
                            headers: {
                                'x-api-key': apiKey,
                                authorization: `BEARER ${authRes.data.accessToken}`,
                            },
                        },
                    );
                    // console.log('create customer response ', resp.data);
                }
            }
        } catch (e) {
            console.log('Unable to create trackier customer', e.message);
        }
    }
}
