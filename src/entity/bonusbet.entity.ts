import {Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, Unique,} from "typeorm";

@Entity()
export class Bonusbet {

    @PrimaryGeneratedColumn({ type: "bigint"})
    id: number;

    @Index()
    @Column({ type: "bigint"})
    client_id: number;

    @Index()
    @Column({ type: "bigint"})
    user_id: number;

    @Index()
    @Column({ type: "bigint"})
    user_bonus_id: number;

    @Index({unique: true})
    @Column({ type: "bigint"})
    bet_id: number;

    @Index()
    @Column({ type: "int", default: "0" })
    rollover_count: number;

    @Index()
    @Column({ type: "int", default: "0" })
    status: number;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false })
    bonus_type: string;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 0 })
    stake: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 0 })
    rolled_amount: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 0 })
    pending_amount: number;

    @Index()
    @CreateDateColumn()
    created: string;

    @Index()
    @UpdateDateColumn()
    updated: string;

}