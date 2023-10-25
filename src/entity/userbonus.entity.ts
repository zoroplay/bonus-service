import {Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn,} from "typeorm";

@Entity()
@Index(['client_id', 'bonus_type','user_id'], { unique: true })
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
    @Column({ type: "varchar", length: 100, nullable: false })
    bonus_type: string;

    @Index()
    @Column({type:"bigint", nullable: false, default: 0 })
    expiry_date_in_timestamp: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: false })
    amount: number;

    @Index()
    @CreateDateColumn()
    created: string;

    @Index()
    @UpdateDateColumn()
    updated: string;

}