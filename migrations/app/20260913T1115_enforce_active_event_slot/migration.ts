#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/08fbeede9d358938ff4e4242f12a56be909bc5d0d313766240ad83449d354de3/contract';
import endContract from '../../snapshots/08fbeede9d358938ff4e4242f12a56be909bc5d0d313766240ad83449d354de3/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e9bc2086adc2eef23d05d8c44d32b60b65a38720df1782eaad744ef9237a501b/contract';
import startContract from '../../snapshots/e9bc2086adc2eef23d05d8c44d32b60b65a38720df1782eaad744ef9237a501b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createIndex({
        schema: 'public',
        table: 'event',
        index: 'event_active_slot_d8db796a',
        columns: ['buildingId', 'eventDate', 'session'],
        extras: { where: '("eventStatus" = \'ACTIVE\')', unique: true },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
