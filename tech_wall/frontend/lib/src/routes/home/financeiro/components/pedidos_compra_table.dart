import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:tech_wall/src/api/pedidos_compra/pedidos_compra.dart';
import 'package:tech_wall/src/components/dialogs/boolean.dart';
import 'package:tech_wall/src/components/responsive_table.dart';
import 'package:tech_wall/src/models/pedido_compra.dart';
import 'package:tech_wall/src/models/status_pedido_compra.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';

class PedidosCompraTable extends StatefulWidget {
  const PedidosCompraTable({super.key, required this.data, this.onDataChange});
  final List<PedidoCompraModel> data;
  final FutureOr<void> Function()? onDataChange;

  @override
  State<PedidosCompraTable> createState() => _PedidosCompraTableState();
}

class _PedidosCompraTableState extends State<PedidosCompraTable> {
  Future<void> _resolverPedido(PedidoCompraModel pedido) async {
    Navigator.of(context).pop();
    final accept = await DialogService.instance.showDialog(
      BooleanDialog(
        title: 'Resolver Pedido',
        content:
            'Confirma que a divergência no pedido #${pedido.id} foi resolvida com o fornecedor?',
      ),
    );
    if (accept != true) return;
    final success = await PedidosCompraApi.resolver(pedido.id);
    if (success) widget.onDataChange?.call();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return ResponsiveTable(
      actionsLabel: 'Ações',
      columns: [
        ResponsiveColumn(label: 'Material', onSort: (i, a) => _sort(i, a)),
        ResponsiveColumn(
          label: 'Qt. Solicitada',
          onSort: (i, a) => _sort(i, a),
        ),
        ResponsiveColumn(label: 'Qt. Entregue', onSort: (i, a) => _sort(i, a)),
        ResponsiveColumn(
          label: 'Data do Pedido',
          onSort: (i, a) => _sort(i, a),
        ),
        ResponsiveColumn(label: 'Status', onSort: (i, a) => _sort(i, a)),
      ],
      rows: List.generate(widget.data.length, (i) {
        final pedido = widget.data[i];
        return ResponsiveRow(
          color: i.isEven
              ? scheme.surfaceContainerHigh
              : scheme.surfaceContainerLow,
          cells: [
            ResponsiveCell(pedido.material.item),
            ResponsiveCell(pedido.qtSolicitada.toString()),
            ResponsiveCell(pedido.qtEntregue?.toString() ?? '---'),
            ResponsiveCell(
              DateFormat(
                'dd/MM/yyyy',
              ).format(DateTime.parse(pedido.dataPedido)),
            ),
            ResponsiveCell(pedido.status.description),
          ],
          actions: [
            if (pedido.status == StatusPedidoCompra.entregueComAlteracao)
              PopupMenuItem(
                onTap: () => _resolverPedido(pedido),
                child: const ListTile(
                  leading: Icon(Icons.check_circle_outline),
                  title: Text("Resolver Pendência"),
                ),
              ),
          ],
        );
      }),
    );
  }

  void _sort(int index, bool ascending) {
    // A ordenação principal já é feita pela API
    setState(() {});
  }
}
