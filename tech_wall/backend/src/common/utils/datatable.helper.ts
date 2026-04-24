import { DataTableParamsDto } from '../dto/data-table.dto';

export class PrismaDatatableHelper {
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
}
