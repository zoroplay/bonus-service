export interface CreateNewBonusRequest {
     clientId: number
     bonusName :string
     bonusCode :string
     target :string
     bonusCategory :string
     bonusType :string
     bonusAmount:string
     maxValue :string
     sportPercentage :string
     casinoPercentage:string
     virtualPercentage :string
     noOfSportRollover :string
     noOfCasinoRollover :string
     noOfVirtualRollover :string
     duration :string
}