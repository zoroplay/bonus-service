import {Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne,} from "typeorm";
import { Bonus } from "./bonus.entity";

@Entity()
@Index(['client_id', 'bonus_code'], { unique: true })
export class Campaignbonus {

    @PrimaryGeneratedColumn({ type: "bigint"})
    id: number;

    @Index()
    @Column({ type: "bigint"})
    client_id: number;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false })
    name: string;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false })
    bonus_code: string;

    @Index()
    @Column({ type: "int", default: "0" })
    status: number;

    // @Index()
    @ManyToOne(type => Bonus, {eager: true})
    @JoinColumn({ name: 'bonus_id' })
    bonus: Bonus;

    @Index()
    @Column({ type: "date" })
    start_date: string;

    @Index()
    @Column({ type: "date" })
    end_date: string;

    @Index()
    @CreateDateColumn()
    created: string;

    @Index()
    @UpdateDateColumn()
    updated: string;

}