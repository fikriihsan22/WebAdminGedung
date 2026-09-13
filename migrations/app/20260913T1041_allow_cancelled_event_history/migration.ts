#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/37a4bfdab8d2a97f5c62910d5e185e0e947812490fd296ad34146d2da6f14dee/contract';
import endContract from '../../snapshots/37a4bfdab8d2a97f5c62910d5e185e0e947812490fd296ad34146d2da6f14dee/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e20545220350c192fe0216fd9c951b3986d0e9b3448769159032fade600998a1/contract';
import startContract from '../../snapshots/e20545220350c192fe0216fd9c951b3986d0e9b3448769159032fade600998a1/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'event',
        constraint: 'event_buildingId_eventDate_session_eventStatus_key',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
