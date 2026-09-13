#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/37a4bfdab8d2a97f5c62910d5e185e0e947812490fd296ad34146d2da6f14dee/contract';
import startContract from '../../snapshots/37a4bfdab8d2a97f5c62910d5e185e0e947812490fd296ad34146d2da6f14dee/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e9bc2086adc2eef23d05d8c44d32b60b65a38720df1782eaad744ef9237a501b/contract';
import endContract from '../../snapshots/e9bc2086adc2eef23d05d8c44d32b60b65a38720df1782eaad744ef9237a501b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createIndex({
        schema: 'public',
        table: 'event',
        index: 'event_buildingId_eventDate_idx_aa856c4a',
        columns: ['buildingId', 'eventDate'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'event',
        index: 'event_eventDate_session_eventStatus_paymentStatus_idx_a6d3c5fb',
        columns: ['eventDate', 'session', 'eventStatus', 'paymentStatus'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
