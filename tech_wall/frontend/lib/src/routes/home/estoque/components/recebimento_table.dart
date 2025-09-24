import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:tech_wall/src/components/dialogs/pedidos/receber_pedido.dart';
import 'package:tech_wall/src/components/responsive_table.dart';
import 'package:tech_wall/src/models/pedido_compra.dart';
import 'package:tech_wall/src/models/status_pedido_compra.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';

class RecebimentoTable extends StatelessWidget {
  const RecebimentoTable({super.key, required this.data, this.onDataChange});
  final List<PedidoCompraModel> data;
  final FutureOr<void> Function()? onDataChange;

  Future<void> _receberPedido(
    BuildContext context,
    PedidoCompraModel pedido,
  ) async {
    final success = await DialogService.instance.showDialog(
      ReceberPedidoDialog(pedido: pedido),
    );
    if (success == true) onDataChange?.call();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final pedidosPendentes = data
        .where((p) => p.status == StatusPedidoCompra.solicitado)
        .toList();

    if (pedidosPendentes.isEmpty) {
      return const Center(
        child: Text('Nenhum pedido de compra aguardando recebimento.'),
      );
    }

    return ResponsiveTable(
      actionsLabel: 'Ações',
      columns: const [
        ResponsiveColumn(label: 'Material'),
        ResponsiveColumn(label: 'Qt. Solicitada'),
        ResponsiveColumn(label: 'Fornecedor'),
        ResponsiveColumn(label: 'Data do Pedido'),
      ],
      rows: List.generate(pedidosPendentes.length, (i) {
        final pedido = pedidosPendentes[i];
        return ResponsiveRow(
          color: i.isEven
              ? scheme.surfaceContainerHigh
              : scheme.surfaceContainerLow,
          cells: [
            ResponsiveCell(pedido.material.item),
            ResponsiveCell(pedido.qtSolicitada.toString()),
            ResponsiveCell(pedido.fornecedor ?? 'Não informado'),
            ResponsiveCell(
              DateFormat(
                'dd/MM/yyyy',
              ).format(DateTime.parse(pedido.dataPedido)),
            ),
          ],
          actions: [
            PopupMenuItem(
              onTap: () => _receberPedido(context, pedido),
              child: const ListTile(
                leading: Icon(Icons.inventory_2_outlined),
                title: Text("Receber Pedido"),
              ),
            ),
          ],
        );
      }),
    );
  }
}
