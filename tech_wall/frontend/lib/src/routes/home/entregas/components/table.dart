import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:tech_wall/src/components/dialogs/entregas/update_entrega.dart';
import 'package:tech_wall/src/components/responsive_table.dart';
import 'package:tech_wall/src/models/entrega.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/compare.dart';

class EntregasTable extends StatefulWidget {
  const EntregasTable({super.key, required this.data, this.onDataChange});

  final List<EntregaModel> data;
  final FutureOr<void> Function()? onDataChange;

  @override
  State<EntregasTable> createState() => _EntregasTableState();
}

class _EntregasTableState extends State<EntregasTable> {
  @override
  void initState() {
    super.initState();
    _sort(4, true); // Ordena por previsão de entrega
  }

  Future<void> _onPressedEditar(EntregaModel entrega) async {
    final success = await DialogService.instance.showDialog(
      UpdateEntregaDialog(entrega: entrega),
    );
    if (success == true) {
      widget.onDataChange?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return ResponsiveTable(
      actionsLabel: 'Ações',
      columns: [
        ResponsiveColumn(label: 'ID Venda', onSort: _sort),
        ResponsiveColumn(label: 'Cliente', onSort: _sort),
        ResponsiveColumn(label: 'Endereço', onSort: _sort),
        ResponsiveColumn(label: 'Previsão', onSort: _sort),
        ResponsiveColumn(label: 'Transportadora', onSort: _sort),
        ResponsiveColumn(label: 'Status', onSort: _sort),
      ],
      rows: List.generate(widget.data.length, (i) {
        final entrega = widget.data[i];
        final dateTime = DateTime.tryParse(entrega.previsaoEntrega);
        final date = dateTime == null
            ? 'N/A'
            : DateFormat('dd/MM/yyyy').format(dateTime);

        return ResponsiveRow(
          color: i.isEven
              ? scheme.surfaceContainerHigh
              : scheme.surfaceContainerLow,
          cells: [
            ResponsiveCell(entrega.venda.id.toString()),
            ResponsiveCell(entrega.venda.cliente?.nome ?? 'N/A'),
            ResponsiveCell(entrega.enderecoEntrega),
            ResponsiveCell(date),
            ResponsiveCell(entrega.transportadora ?? 'Não definida'),
            ResponsiveCell(entrega.status.description),
          ],
          actions: [
            PopupMenuItem(
              onTap: () => _onPressedEditar(entrega),
              child: const ListTile(
                leading: Icon(Icons.edit),
                title: Text("Atualizar Entrega"),
              ),
            ),
          ],
        );
      }),
    );
  }

  int _compare(EntregaModel a, EntregaModel b, bool ascending, int index) {
    return switch (index) {
      0 => compare(a.venda.id, b.venda.id, ascending),
      1 => compare(a.venda.cliente?.nome, b.venda.cliente?.nome, ascending),
      2 => compare(a.enderecoEntrega, b.enderecoEntrega, ascending),
      3 => compare(a.previsaoEntrega, b.previsaoEntrega, ascending),
      4 => compare(a.transportadora, b.transportadora, ascending),
      5 => compare(a.status.description, b.status.description, ascending),
      _ => 0,
    };
  }

  void _sort(int index, bool ascending) {
    setState(
      () => widget.data.sort((a, b) => _compare(a, b, ascending, index)),
    );
  }
}
