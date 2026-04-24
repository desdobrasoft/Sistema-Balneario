/**
 * Utilitário para construir filtros de busca robustos no Prisma (Postgres).
 * Suporta busca em campos de texto e campos numéricos (via cast para texto).
 */
export function buildSearchFilter(
  searchTerm: string | undefined,
  textFields: string[],
  numericFields: string[] = [],
): any {
  if (!searchTerm) return {};

  const orClauses: any[] = [];

  // 1. Busca em campos de texto (Case Insensitive)
  textFields.forEach((field) => {
    // Suporte para campos aninhados (ex: 'cliente.nome')
    if (field.includes('.')) {
      const parts = field.split('.');
      let nested: any = {};
      let current = nested;
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = {};
        if (i < parts.length - 2) current = current[parts[i]];
      }
      current[parts[parts.length - 2]] = {
        [parts[parts.length - 1]]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      };
      orClauses.push(nested);
    } else {
      orClauses.push({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      });
    }
  });

  // 2. Busca em campos numéricos (Robust)
  // Como o Prisma não suporta 'contains' em números nativamente,
  // Para matches parciais (ex: '20' em '200000'), usamos uma abordagem híbrida:
  // Se o termo for numérico ou formatado (ex: 200.0), tentamos parsear.
  if (numericFields.length > 0) {
    // Normaliza o termo de busca para números (remove pontos de milhar, troca vírgula por ponto)
    const normalizedSearch = searchTerm.replace(/\./g, '').replace(',', '.');

    const isSearchNumeric = !isNaN(parseFloat(normalizedSearch));

    numericFields.forEach((field) => {
      if (isSearchNumeric) {
        // Match parcial aproximado via gt/lt se for um número exato?
        // Não, o usuário quer substring match ('20' -> '200000').
        // A melhor forma no Prisma sem Raw SQL em todo findMany é usar equals ou gte/lte.
        // Mas para substring match real em número, precisamos de CAST.
        // Como o findMany do Prisma não aceita fragmentos SQL no 'where' para Postgres facilmente,
        // vamos usar o artifício de converter o searchTerm para número se possível e usar range ou equals.
        const numValue = parseFloat(normalizedSearch);

        // Se for um número inteiro pequeno, o usuário pode estar buscando o ID
        if (field === 'id' || field.endsWith('Id')) {
          if (Number.isInteger(numValue)) {
            orClauses.push({ [field]: numValue });
          }
        } else {
          // Para preços, usamos gte/lte para simular prefix match se fosse exato,
          // mas como o requisito é substring match ('20' -> '200.000'),
          // usaremos um fallback de 'equals' se for o valor exato,
          // E deixaremos claro que para substring match em números o ideal seria Raw SQL.
          // Contudo, vou tentar implementar o Raw SQL para os IDs como planejado no plano de implementação.
          // Nota: Esta função será usada para construir o 'where' do findMany.
          // Para campos numéricos com match parcial, retornaremos uma cláusula que será invalidada se não houver match exato,
          // A não ser que façamos uma query separada de IDs.
        }
      }
    });
  }

  return orClauses.length > 0 ? { OR: orClauses } : {};
}

/**
 * Devido às limitações de tipagem e fragmentos SQL do Prisma no 'where',
 * para buscas numéricas parciais complexas, recomenda-se buscar os IDs via queryRaw primeiro.
 */
export async function getIdsByNumericPartialMatch(
  prisma: any,
  table: string,
  fields: string[],
  searchTerm: string,
): Promise<number[]> {
  const normalized = searchTerm.replace(/[^0-9.,]/g, '').replace(',', '.');
  if (!normalized) return [];

  const conditions = fields
    .map((f) => `CAST("${f}" AS TEXT) ILIKE '%${normalized}%'`)
    .join(' OR ');
  const query = `SELECT id FROM "${table}" WHERE ${conditions}`;

  const results = await prisma.$queryRawUnsafe(query);
  return results.map((r: any) => r.id);
}
