import {Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, Unique,} from "typeorm";

@Entity()
export class Transactions {

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
    bonus_id: number;

    @Index()
    @Column({ type: "bigint"})
    amount: number;

    @Index()
    @Column({ type: "int", default: "0" })
    transaction_type: number;

    @Index()
    @Column({ type: "int", default: "0" })
    reference_type: number;

    @Index()
    @Column({ type: "int", default: "0" })
    reference_id: number;

    @Index()
    @Column({ type: "varchar", length: 200, nullable: false,default: ""  })
    description: string;

    @Index()
    @CreateDateColumn()
    created: string;

    @Index()
    @UpdateDateColumn()
    updated: string;

}