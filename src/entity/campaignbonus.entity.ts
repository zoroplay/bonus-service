import {Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn,} from "typeorm";

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

    @Index()
    @Column({ type: "int", default: "0" })
    bonus_id: number;

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