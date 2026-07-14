import { DataTableParamsDto, DataTableResult } from '../dto/data-table.dto';
import { getIdsByNumericPartialMatch } from './prisma-search.utils';

/**
 * Configuração declarativa para o PrismaDatatableHelper.execute().
 *
 * @template T - Tipo do objeto retornado após mapeamento (mapRow).
 */
export interface DatatableExecuteConfig<T = any> {
  /** Delegate do modelo Prisma (ex: prisma.tipoPlaca) */
  prismaModel: any;
  /** Instância do PrismaService (necessário para queryRawUnsafe em buscas numéricas) */
  prismaClient?: any;
  /** Payload do DataTables (params do request) */
  query: DataTableParamsDto;
  /** Campos de texto buscáveis. Suporta notação com '.' para relações (ex: 'tipoPlaca.nome') */
  searchableFields?: string[];
  /**
   * Campos numéricos buscáveis via raw SQL CAST.
   * Requer `prismaClient` e `tableName` para funcionar.
   */
  numericSearchFields?: string[];
  /** Nome da tabela no banco (snake_case) para buscas numéricas */
  tableName?: string;
  /** Filtros fixos aplicados ao where (ex: { deletedAt: null }) */
  baseWhere?: any;
  /** Includes do Prisma para carregar relações */
  include?: any;
  /** Select do Prisma (alternativa ao include — não usar ambos) */
  select?: any;
  /** Ordenação padrão quando o DataTables não envia ordenação. Default: { id: 'desc' } */
  defaultOrderBy?: any;
  /**
   * Função de transformação de cada row retornada pelo banco.
   * Se não fornecida, retorna os dados crus do Prisma.
   */
  mapRow?: (row: any) => T;
  /**
   * Hook para adicionar condições de busca customizadas (ex: busca em enums).
   * Recebe o searchValue e deve retornar um array de condições OR adicionais.
   * Retorne um array vazio se não houver condições extras.
   */
  customSearchEnhancer?: (
    searchValue: string,
  ) => Promise<Record<string, unknown>[]> | Record<string, unknown>[];
  /**
   * Se true, filtra os campos retornados com base nas colunas solicitadas pelo DataTables.
   * Default: true (quando mapRow é fornecido, aplica-se ao resultado de mapRow).
   */
  filterRequestedFields?: boolean;
  /**
   * Where fixo para a contagem total (recordsTotal).
   * Se não fornecido, usa o baseWhere.
   */
  totalCountWhere?: any;
  /**
   * Hook para mapear uma coluna solicitada para ordenação (ex: 'statusExibicao')
   * para uma instrução de ordenação real do Prisma.
   */
  orderByTranslator?: (field: string, dir: 'asc' | 'desc') => any;
}

export class PrismaDatatableHelper {
  /**
   * Método legado mantido para retrocompatibilidade.
   * Novos services devem usar `PrismaDatatableHelper.execute()`.
   */
  static buildPrismaQuery(
    params: DataTableParamsDto,
    searchableFields: string[],
    baseWhere: any = {},
  ) {
    const skip = params.start || 0;
    const take = params.length || 10;
    let where = { ...baseWhere };
    let orderBy: any = undefined;

    // Build Search
    if (params.search && params.search.value) {
      const searchVal = params.search.value;
      const orConditions = searchableFields.map((field) => {
        const parts = field.split('.');
        if (parts.length > 1) {
          const result: any = {};
          let current = result;
          for (let i = 0; i < parts.length - 1; i++) {
            current[parts[i]] = {};
            current = current[parts[i]];
          }
          current[parts[parts.length - 1]] = {
            contains: searchVal,
            mode: 'insensitive',
          };
          return result;
        }
        return {
          [field]: { contains: searchVal, mode: 'insensitive' },
        };
      });

      where = {
        ...baseWhere,
        OR: baseWhere.OR ? [...baseWhere.OR, ...orConditions] : orConditions,
      };
    }

    // Build Order
    if (params.order && params.order.length > 0 && params.columns) {
      const orderConfig = params.order[0]; // Single column sort for simplicity
      if (orderConfig.column !== undefined) {
        const column = params.columns[orderConfig.column];
        if (column && column.data && column.orderable !== false) {
          // Trata relacionamentos (ex: 'usuario.nome')
          const fields = column.data.split('.');
          if (fields.length > 1) {
            orderBy = {};
            let current = orderBy;
            for (let i = 0; i < fields.length - 1; i++) {
              current[fields[i]] = {};
              current = current[fields[i]];
            }
            current[fields[fields.length - 1]] = orderConfig.dir || 'asc';
          } else {
            orderBy = { [column.data]: orderConfig.dir || 'asc' };
          }
        }
      }
    } else {
      // Default fallback
      orderBy = { id: 'desc' };
    }

    return { skip, take, where, orderBy };
  }

  /**
   * Executa uma consulta DataTable completa de forma genérica.
   *
   * Automatiza: busca (texto + numérica), ordenação (incluindo relações com '.'),
   * paginação, contagem, mapeamento de dados e filtragem de campos.
   *
   * @example
   * ```typescript
   * return PrismaDatatableHelper.execute({
   *   prismaModel: this.prisma.tipoPlaca,
   *   prismaClient: this.prisma,
   *   query,
   *   searchableFields: ['nome'],
   *   numericSearchFields: ['id', 'altura', 'largura', 'espessura'],
   *   tableName: 'tipos_placa',
   *   baseWhere: { deletedAt: null },
   *   mapRow: (tp) => ({
   *     id: tp.id,
   *     nome: tp.nome,
   *     altura: Number(tp.altura).toFixed(2),
   *   }),
   * });
   * ```
   */
  static async execute<T = any>(
    config: DatatableExecuteConfig<T>,
  ): Promise<DataTableResult<T>> {
    const {
      prismaModel,
      prismaClient,
      query,
      searchableFields = [],
      numericSearchFields = [],
      tableName,
      baseWhere = {},
      include,
      select,
      defaultOrderBy = { id: 'desc' },
      mapRow,
      customSearchEnhancer,
      filterRequestedFields = true,
      totalCountWhere,
    } = config;

    // === Pagination ===
    const skip = query.start || 0;
    const take = query.length || 10;

    // === Order ===
    const orderBy = PrismaDatatableHelper.buildOrderBy(
      query,
      defaultOrderBy,
      config.orderByTranslator,
    );

    // === Search: build WHERE ===
    let where: any = { ...baseWhere };

    if (query.search?.value) {
      const searchVal = query.search.value;
      const orConditions: Record<string, unknown>[] = [];

      // 1. Text fields (string contains insensitive, suporta relações com '.')
      for (const field of searchableFields) {
        orConditions.push(
          PrismaDatatableHelper.buildNestedCondition(field, {
            contains: searchVal,
            mode: 'insensitive',
          }),
        );
      }

      // 2. Numeric fields (via raw SQL CAST)
      if (numericSearchFields.length > 0 && prismaClient && tableName) {
        const idsByNumeric = await getIdsByNumericPartialMatch(
          prismaClient,
          tableName,
          numericSearchFields,
          searchVal,
        );
        if (idsByNumeric.length > 0) {
          orConditions.push({ id: { in: idsByNumeric } });
        }
      }

      // 3. Custom search enhancer (enum matching, etc.)
      if (customSearchEnhancer) {
        const extraConditions = await customSearchEnhancer(searchVal);
        orConditions.push(...extraConditions);
      }

      // Merge OR conditions with baseWhere
      if (orConditions.length > 0) {
        where = {
          ...baseWhere,
          OR: baseWhere.OR ? [...baseWhere.OR, ...orConditions] : orConditions,
        };
      }
    }

    // === Apply custom filters ===
    if (query.filter) {
      where = { ...where, ...query.filter };
    }

    // === Query options ===
    const findOptions: any = {
      where,
      skip,
      take,
      orderBy,
    };

    if (select) {
      findOptions.select = select;
    } else if (include) {
      findOptions.include = include;
    }

    // === Execute queries ===
    const countWhere = totalCountWhere ?? baseWhere;

    const rawData = await prismaModel.findMany(findOptions);
    const total = await prismaModel.count({ where: countWhere });
    const filtered = await prismaModel.count({ where });

    // === Map rows ===
    let data: any[];
    if (mapRow) {
      data = rawData.map(mapRow);
    } else {
      data = rawData;
    }

    // === Filter requested fields ===
    if (filterRequestedFields && query.columns) {
      const requestedFields = query.columns
        .map((c) => c.data)
        .filter((d) => d && d !== 'null') as string[];

      if (requestedFields.length > 0) {
        data = data.map((item: Record<string, unknown>) => {
          const result: Record<string, unknown> = {};
          requestedFields.forEach((field) => {
            const value = PrismaDatatableHelper.resolveFieldValue(item, field);
            if (value !== undefined) {
              // Campos com '.' devem ser montados como objetos aninhados
              // para que o DataTables acesse corretamente (ex: row.tipoPlaca.nome)
              if (field.includes('.')) {
                PrismaDatatableHelper.setNestedValue(result, field, value);
              } else {
                result[field] = value;
              }
            }
          });
          return result;
        });
      }
    }

    return {
      draw: query.draw || 1,
      data,
      recordsTotal: total,
      recordsFiltered: filtered,
    };
  }

  /**
   * Constrói o orderBy do Prisma a partir do payload do DataTables.
   * Suporta relações com notação '.' (ex: 'tipoPlaca.nome').
   */
  private static buildOrderBy(
    query: DataTableParamsDto,
    defaultOrderBy: any,
    translator?: (field: string, dir: 'asc' | 'desc') => any,
  ): any {
    if (query.order && query.order.length > 0 && query.columns) {
      const orderConfig = query.order[0];
      if (orderConfig.column !== undefined) {
        const column = query.columns[orderConfig.column];
        if (column && column.data && column.orderable !== false) {
          if (translator) {
            const customOrder = translator(
              column.data,
              (orderConfig.dir || 'asc') as 'asc' | 'desc',
            );
            if (customOrder) return customOrder;
          }
          return PrismaDatatableHelper.buildNestedCondition(
            column.data,
            orderConfig.dir || 'asc',
          );
        }
      }
    }
    return defaultOrderBy;
  }

  /**
   * Constrói um objeto aninhado a partir de uma string com '.' para uso em
   * where ou orderBy do Prisma.
   *
   * @example
   * buildNestedCondition('tipoPlaca.nome', { contains: 'x', mode: 'insensitive' })
   * // => { tipoPlaca: { nome: { contains: 'x', mode: 'insensitive' } } }
   *
   * buildNestedCondition('nome', 'asc')
   * // => { nome: 'asc' }
   */

  /**
   * Resolve o valor de um campo em um objeto, suportando notação com '.'.
   * Prioridade: chave plana → acesso aninhado → camelCase achatado.
   *
   * @example
   * // Se mapRow retorna { tipoPlacaNome: 'X' } e o frontend pede 'tipoPlaca.nome':
   * resolveFieldValue(item, 'tipoPlaca.nome')
   * // 1. item['tipoPlaca.nome'] → undefined
   * // 2. item.tipoPlaca?.nome → undefined (relação não está no objeto mapeado)
   * // 3. item['tipoPlacaNome'] → 'X' ✓
   */
  private static resolveFieldValue(
    item: Record<string, unknown>,
    field: string,
  ): unknown {
    // 1. Chave plana direta
    if (item[field] !== undefined) return item[field];

    // Sem ponto, não há mais o que tentar
    if (!field.includes('.')) return undefined;

    // 2. Acesso aninhado (ex: item.tipoPlaca.nome)
    const parts = field.split('.');
    let current: unknown = item;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') {
        current = undefined;
        break;
      }
      current = (current as Record<string, unknown>)[part];
    }
    if (current !== undefined) return current;

    // 3. CamelCase achatado (ex: 'tipoPlaca.nome' → 'tipoPlacaNome')
    const camelKey =
      parts[0] +
      parts
        .slice(1)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join('');
    return item[camelKey];
  }

  /**
   * Atribui um valor em um objeto usando notação com '.', criando objetos intermediários.
   * Deep-merge seguro: não sobrescreve objetos existentes no caminho.
   *
   * @example
   * setNestedValue(obj, 'tipoPlaca.nome', 'Mono')
   * // obj = { tipoPlaca: { nome: 'Mono' } }
   */
  private static setNestedValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown,
  ): void {
    const parts = path.split('.');
    let current: Record<string, unknown> = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (
        !(key in current) ||
        typeof current[key] !== 'object' ||
        current[key] === null
      ) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }

  private static buildNestedCondition(
    fieldPath: string,
    value: unknown,
  ): Record<string, unknown> {
    const parts = fieldPath.split('.');
    if (parts.length === 1) {
      return { [parts[0]]: value };
    }

    const result: Record<string, unknown> = {};
    let current: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const nested: Record<string, unknown> = {};
      current[parts[i]] = nested;
      current = nested;
    }
    current[parts[parts.length - 1]] = value;
    return result;
  }
}
