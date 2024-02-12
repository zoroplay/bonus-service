import {Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn,} from "typeorm";

@Entity()
export class Userbonus {

    @PrimaryGeneratedColumn({ type: "bigint"})
    id: number;

    @Index()
    @Column({ type: "bigint"})
    user_id: number;

    @Index()
    @Column({ type: "bigint"})
    client_id: number;

    @Index()
    @Column({ type: "bigint", default: 0})
    rollover_count: number;

    @Index()
    @Column({type:"bigint", nullable: false, default: 0 })
    bonus_id: number;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false })
    bonus_type: string;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false })
    name: string;

    @Index()
    @Column({type:"bigint", nullable: false, default: 0 })
    expiry_date_in_timestamp: number;

    @Index()
    @Column({type:"bigint", nullable: false, default: 1 })
    status: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: false })
    amount: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: false })
    balance: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: false, default: 0 })
    used_amount: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 0 })
    rolled_amount: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 0 })
    pending_amount: number;

    @Index()
    @Column({ type: "bigint", default: 0})
    completed_rollover_count: number;

    @Index()
    @Column({ type: "varchar", nullable: true})
    affiliate_id: string;

    @Index()
    @CreateDateColumn()
    created: string;

    @Index()
    @UpdateDateColumn()
    updated: string;

}