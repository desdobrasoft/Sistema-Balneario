import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/models/pedido_compra.dart';
import 'package:tech_wall/src/models/status_pedido_compra.dart';

class LowStockCard extends StatelessWidget {
  const LowStockCard({
    super.key,
    required this.materiais,
    required this.pedidos,
    this.onTap,
  });

  final List<MaterialEstoqueModel> materiais;
  final List<PedidoCompraModel> pedidos;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Filtra materiais com estoque baixo
    final lowStockMateriais = materiais
        .where((m) => m.quantidade < m.limBaixoEstoque)
        .toList();

    // Filtra materiais que JÁ têm um pedido de compra solicitado
    final pendingOrderMaterialIds = pedidos
        .where((p) => p.status == StatusPedidoCompra.solicitado)
        .map((p) => p.material.id)
        .toSet();

    // A contagem final são os materiais com estoque baixo que NÃO têm um pedido pendente
    final finalCount = lowStockMateriais
        .where((m) => !pendingOrderMaterialIds.contains(m.id))
        .length;

    return AppCard.outlined(
      onTap: finalCount > 0 ? onTap : null,
      content: SizedBox(
        height: 100,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Itens com Estoque Baixo',
                    style: theme.textTheme.titleMedium,
                  ),
                ),
                Icon(
                  Icons.warning_amber_rounded,
                  color: finalCount > 0 ? Colors.orange : Colors.grey,
                ),
              ],
            ),
            Align(
              alignment: Alignment.bottomLeft,
              child: AutoSizeText(
                finalCount.toString(),
                maxLines: 1,
                style: theme.textTheme.headlineLarge?.copyWith(
                  color: finalCount > 0
                      ? theme.colorScheme.primary
                      : theme.colorScheme.onSurface.withAlpha(
                          (255 * 0.5).round(),
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
