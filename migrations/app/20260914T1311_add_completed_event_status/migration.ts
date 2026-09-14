#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/08fbeede9d358938ff4e4242f12a56be909bc5d0d313766240ad83449d354de3/contract';
import startContract from '../../snapshots/08fbeede9d358938ff4e4242f12a56be909bc5d0d313766240ad83449d354de3/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/708a9e973d9b79d50c8a28bcc858201d3f9b65d6c4f36687328ee95778ddb6f1/contract';
import endContract from '../../snapshots/708a9e973d9b79d50c8a28bcc858201d3f9b65d6c4f36687328ee95778ddb6f1/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'event',
        constraint: 'event_eventStatus_check_3f65f91a',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'event',
        constraint: 'event_eventStatus_check_026b7fc1',
        expression: "\"eventStatus\" IN ('ACTIVE', 'COMPLETED', 'CANCELLED')",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
