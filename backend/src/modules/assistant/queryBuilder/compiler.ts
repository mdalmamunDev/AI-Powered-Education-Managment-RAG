// ─────────────────────────────────────────────────────────────
// compiler.ts — validates an AnalyticsQuery against CATALOG,
// builds the matching Prisma call, executes it, and resolves
// any FK columns in groupBy results back to human labels.
// ─────────────────────────────────────────────────────────────

import { prisma } from '../../../../prisma/prisma';
import { toIsoDate } from '../../../helpers/globals';
import { CATALOG, findTarget, findField, CatalogTarget, CatalogField, FieldOp, RelationInfo } from './catalog';

// ── Types ────────────────────────────────────────────────────

export interface Filter {
  field: string;
  op: FieldOp;
  value: any;
}

export interface AggregateSpec {
  field: string;
  op: 'count' | 'sum' | 'avg' | 'min' | 'max';
}

export interface SortSpec {
  field: string;
  order: 'asc' | 'desc';
}

export interface AnalyticsQuery {
  target: string;
  action: 'count' | 'list' | 'aggregate';
  filters?: Filter[];
  groupBy?: string[];
  aggregate?: AggregateSpec;
  sort?: SortSpec;
  limit?: number;
}

export interface QueryResult {
  action: string;
  target: string;
  data: any;
  query: AnalyticsQuery;
}

// ── Validation error ────────────────────────────────────────

export class QueryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryValidationError';
  }
}

// ── Helpers ──────────────────────────────────────────────────

function mapOp(field: CatalogField, op: FieldOp, value: any): any {
  const isText = field.type === 'text';
  switch (op) {
    case 'eq':
      return isText ? { equals: value, mode: 'insensitive' as const } : { equals: value };
    case 'neq':
      return isText ? { not: { equals: value, mode: 'insensitive' as const } } : { not: value };
    case 'contains':
      return { contains: value, mode: 'insensitive' as const };
    case 'gt':
      return { gt: value };
    case 'gte':
      return { gte: value };
    case 'lt':
      return { lt: value };
    case 'lte':
      return { lte: value };
    case 'in':
      return { in: Array.isArray(value) ? value : [value] };
    case 'between':
      return { gte: value[0], lte: value[1] };
    default:
      return { equals: value };
  }
}

function buildWhere(filters: Filter[], target: CatalogTarget): Record<string, any> {
  const where: Record<string, any> = {};
  for (const f of filters) {
    const field = findField(target, f.field);
    if (!field) {
      throw new QueryValidationError(
        `Unknown field "${f.field}" on ${target.name}. Allowed: ${target.fields.map((x) => x.path).join(', ')}`
      );
    }
    if (!field.ops.includes(f.op)) {
      throw new QueryValidationError(
        `Operation "${f.op}" not allowed on "${field.path}". Allowed: ${field.ops.join(', ')}`
      );
    }

    let value = f.value;
    if (field.type === 'date') {
      value = f.op === 'between' ? [toIsoDate(value[0]), toIsoDate(value[1])] : toIsoDate(value);
    }

    const prismaOp = mapOp(field, f.op, value);

    // Walk dotted relation paths into nested where objects
    const parts = field.path.split('.');
    let cursor = where;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cursor[parts[i]]) cursor[parts[i]] = {};
      cursor = cursor[parts[i]];
    }
    cursor[parts[parts.length - 1]] = prismaOp;
  }
  return where;
}

function buildOrderBy(sort: SortSpec, target: CatalogTarget): Record<string, any> {
  const field = findField(target, sort.field);
  const path = field?.path ?? sort.field;
  const parts = path.split('.');
  if (parts.length === 1) return { [path]: sort.order };
  let cursor: Record<string, any> = {};
  let root = cursor;
  for (let i = 0; i < parts.length - 1; i++) {
    cursor[parts[i]] = {};
    cursor = cursor[parts[i]];
  }
  cursor[parts[parts.length - 1]] = sort.order;
  return root;
}

// ── FK resolution for groupBy ───────────────────────────────

async function resolveGroupNames(
  groups: any[],
  mappings: { field: string; relation: RelationInfo | null }[]
): Promise<any[]> {
  const toResolve: Map<string, { model: string; fkField: string; displayField: string; ids: Set<number> }> = new Map();

  for (const m of mappings) {
    if (!m.relation) continue;
    const key = m.relation.model;
    if (!toResolve.has(key)) {
      toResolve.set(key, { model: m.relation.model, fkField: m.relation.fkField, displayField: m.relation.displayField, ids: new Set() });
    }
    const entry = toResolve.get(key)!;
    for (const g of groups) {
      const id = g[m.relation!.fkField];
      if (id != null) entry.ids.add(id);
    }
  }

  const idToLabel: Map<string, Map<number, string>> = new Map();
  await Promise.all(
    [...toResolve.values()].map(async (entry) => {
      const related = (prisma as any)[entry.model];
      if (!related) return;
      const rows = await related.findMany({
        where: { id: { in: [...entry.ids] } },
        select: { id: true, [entry.displayField]: true },
      });
      const map = new Map<number, string>();
      for (const r of rows) map.set(r.id, r[entry.displayField] ?? r.id);
      idToLabel.set(entry.model, map);
    })
  );

  return groups.map((g) => {
    const out: Record<string, any> = {};
    for (const m of mappings) {
      if (m.relation) {
        const map = idToLabel.get(m.relation.model);
        const id = g[m.relation.fkField];
        out[m.field] = map?.get(id) ?? id;
      } else {
        out[m.field] = g[m.field];
      }
    }
    return out;
  });
}

// ── Main entry ──────────────────────────────────────────────

export async function executeQuery(query: AnalyticsQuery): Promise<QueryResult> {
  const target = findTarget(query.target);
  if (!target) {
    throw new QueryValidationError(
      `Unknown target "${query.target}". Available: ${CATALOG.map((t) => t.name).join(', ')}`
    );
  }

  const model = (prisma as any)[target.model];
  if (!model) throw new QueryValidationError(`Prisma model "${target.model}" not found`);

  const action = query.action ?? 'count';
  const where = query.filters?.length ? buildWhere(query.filters, target) : {};

  let data: any;

  if (action === 'count') {
    data = await model.count({ where });
  } else if (action === 'list') {
    const limit = Math.min(query.limit ?? 20, 100);
    const orderBy = query.sort ? buildOrderBy(query.sort, target) : undefined;
    data = await model.findMany({ where, orderBy, take: limit });
  } else if (action === 'aggregate') {
    data = await executeAggregate(query, target, model, where);
  } else {
    throw new QueryValidationError(`Unknown action "${action}"`);
  }

  return { action, target: target.name, data, query };
}

async function executeAggregate(
  query: AnalyticsQuery,
  target: CatalogTarget,
  model: any,
  where: Record<string, any>
): Promise<any> {
  const groupBy = query.groupBy ?? [];
  const agg = query.aggregate ?? { field: '*', op: 'count' };

  // Map groupBy fields — dotted relation paths become FK columns
  const scalarBy: string[] = [];
  const mappings: { field: string; relation: RelationInfo | null }[] = [];

  for (const gb of groupBy) {
    const field = findField(target, gb);
    if (field?.relation) {
      scalarBy.push(field.relation.fkField);
      mappings.push({ field: gb, relation: field.relation });
    } else {
      scalarBy.push(gb);
      mappings.push({ field: gb, relation: null });
    }
  }

  const aggPayload: Record<string, any> = {};
  if (agg.op === 'count') {
    aggPayload._count = { _all: true };
  } else {
    aggPayload[`_${agg.op}`] = { [agg.field]: true };
  }

  if (scalarBy.length > 0) {
    const groups = await model.groupBy({ by: scalarBy, where, ...aggPayload });
    const resolved = await resolveGroupNames(groups, mappings);

    return resolved.map((r: any, i: number) => {
      const raw = groups[i];
      if (agg.op === 'count') {
        r._count = raw._count?._all ?? 0;
      } else {
        r[`${agg.op}_${agg.field}`] = raw[`_${agg.op}`]?.[agg.field];
      }
      return r;
    });
  }

  // No groupBy — plain aggregate
  const result = await model.aggregate({ where, ...aggPayload });
  if (agg.op === 'count') return { count: result._count?._all ?? 0 };
  return { [`${agg.op}_${agg.field}`]: result[`_${agg.op}`]?.[agg.field] };
}