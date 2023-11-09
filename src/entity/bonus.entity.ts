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
    @Column({ type: "varchar", length: 100, nullable: false })
    target: string;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: true})
    bonusCode: string;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false })
    bonus_type: string;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false  })
    bonus_category: string;


    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 0 })
    bonus_amount: number;

    @Index()
    @Column({ type: "int", default: "0" })
    max_value: number;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false  })
    sport_percentage: string;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false  })
    casino_percentage: string;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false  })
    virtual_percentage: string;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false  })
    no_of_sport_rollover: string;

    @Index()
    @Column({ ttype: "varchar", length: 100, nullable: false  })
    no_of_casino_rollover: string;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false  })
    no_of_virtual_rollover: string;

    @Index()
    @Column({ type: "varchar", length: 100, nullable: false })
    duration: string;

    @Index()
    @CreateDateColumn()
    created: string;

    @Index()
    @UpdateDateColumn()
    updated: string;

}