import {Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn,} from "typeorm";

@Entity()
@Index(['client_id', 'bonus_type'], { unique: true })
export class Bonus {

    @PrimaryGeneratedColumn({ type: "bigint"})
    id: number;

    @Index()
    @Column({ type: "bigint"})
    client_id: number;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false })
    name: string;

    @Index()
    @Column({ type: "int", default: "0" })
    status: number;

    @Index()
    @Column({ type: "int", default: "0" })
    rollover_count: number;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false })
    bonus_type: string;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 0 })
    minimum_entry_amount: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 0 })
    bonus_amount: number;

    @Index()
    @Column({ type: "int", default: "0" })
    bonus_amount_multiplier: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 0 })
    minimum_stake: number;

    @Index()
    @Column({ type: "int", default: "24" })
    expiry_in_hours: number;

    @Index()
    @Column({ type: "int", default: "3" })
    minimum_events: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: false,default: "0"  })
    minimum_odds_per_event: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: false,default: "0"  })
    minimum_total_odds: number;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false,default: "0"  })
    applicable_bet_type: string;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: false, default: 0 })
    maximum_winning: number;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: true,default: ""  })
    reset_interval_type: string;

    @Index()
    @Column({ type: "int", default: "0" })
    minimum_selection: number;

    @Index()
    @Column({ type: "int", default: "0" })
    minimum_lost_games: number;

    @Index()
    @Column({ type: "int", default: "0" })
    minimum_betting_stake: number;

    @Index()
    @CreateDateColumn()
    created: string;

    @Index()
    @UpdateDateColumn()
    updated: string;

}