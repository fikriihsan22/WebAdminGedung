#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/08fbeede9d358938ff4e4242f12a56be909bc5d0d313766240ad83449d354de3/contract';
import startContract from '../../snapshots/08fbeede9d358938ff4e4242f12a56be909bc5d0d313766240ad83449d354de3/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/7692f2c084c62818be815f65ee3e09f412217308254772bd7a124d1fdef68b28/contract';
import endContract from '../../snapshots/7692f2c084c62818be815f65ee3e09f412217308254772bd7a124d1fdef68b28/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
  rawSql,
} from '@prisma/orm-postgres/migration';

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
      this.dropIndex({ schema: 'public', table: 'event', index: 'event_active_slot_d8db796a' }),
      this.createTable({
        schema: 'public',
        table: 'bookingSpace',
        columns: [
          col('buildingId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'event',
        column: col('spaceId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      rawSql({
        id: 'data_migration.backfill-event-spaceId',
        label: 'Data transform: create default booking spaces and backfill event spaceId',
        operationClass: 'data',
        target: { id: 'postgres' },
        precheck: [{
          description: 'Check events or buildings need default booking spaces',
          sql: 'SELECT EXISTS (SELECT 1 FROM "public"."event" WHERE "spaceId" IS NULL) OR EXISTS (SELECT 1 FROM "public"."building" b WHERE NOT EXISTS (SELECT 1 FROM "public"."bookingSpace" s WHERE s."buildingId" = b."id")) AS ok',
          params: [],
        }],
        execute: [
          {
            description: 'Create one Gedung Utama booking space per existing building',
            sql: 'INSERT INTO "public"."bookingSpace" ("id", "buildingId", "name", "isActive", "sortOrder", "createdAt", "updatedAt") SELECT b."id", b."id", \'Gedung Utama\', TRUE, 0, NOW(), NOW() FROM "public"."building" b ON CONFLICT ("id") DO NOTHING',
            params: [],
          },
          {
            description: 'Assign each historic event to its building default space',
            sql: 'UPDATE "public"."event" SET "spaceId" = "buildingId" WHERE "spaceId" IS NULL',
            params: [],
          },
        ],
        postcheck: [{
          description: 'Verify every building has a booking space and every event has one',
          sql: 'SELECT NOT EXISTS (SELECT 1 FROM "public"."event" WHERE "spaceId" IS NULL) AND NOT EXISTS (SELECT 1 FROM "public"."building" b WHERE NOT EXISTS (SELECT 1 FROM "public"."bookingSpace" s WHERE s."buildingId" = b."id")) AS ok',
          params: [],
        }],
      }),
      this.setNotNull({ schema: 'public', table: 'event', column: 'spaceId' }),
      this.addUnique({
        schema: 'public',
        table: 'bookingSpace',
        constraint: 'bookingSpace_id_buildingId_key',
        columns: ['id', 'buildingId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'bookingSpace',
        constraint: 'bookingSpace_buildingId_name_key',
        columns: ['buildingId', 'name'],
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'event',
        constraint: 'event_eventStatus_check_026b7fc1',
        expression: "\"eventStatus\" IN ('ACTIVE', 'COMPLETED', 'CANCELLED')",
      }),
      this.createIndex({
        schema: 'public',
        table: 'bookingSpace',
        index: 'bookingSpace_buildingId_idx_c40fd7b4',
        columns: ['buildingId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'bookingSpace',
        index: 'bookingSpace_buildingId_isActive_sortOrder_idx_e75a5aee',
        columns: ['buildingId', 'isActive', 'sortOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'event',
        index: 'event_active_space_slot_9709ae04',
        columns: ['spaceId', 'eventDate', 'session'],
        extras: { where: '("eventStatus" = \'ACTIVE\')', unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'event',
        index: 'event_spaceId_buildingId_idx_47ed4392',
        columns: ['spaceId', 'buildingId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'event',
        index: 'event_spaceId_eventDate_idx_aeffb60b',
        columns: ['spaceId', 'eventDate'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'bookingSpace',
        foreignKey: {
          name: 'bookingSpace_buildingId_fkey',
          columns: ['buildingId'],
          references: { schema: 'public', table: 'building', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'event',
        foreignKey: {
          name: 'event_spaceId_buildingId_fkey',
          columns: ['spaceId', 'buildingId'],
          references: { schema: 'public', table: 'bookingSpace', columns: ['id', 'buildingId'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
