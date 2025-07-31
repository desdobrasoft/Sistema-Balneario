import 'dart:async' show FutureOr;

import 'package:casa_facil/src/components/responsive_table.dart';
import 'package:casa_facil/src/models/materiais_estoque.dart';
import 'package:casa_facil/src/utils/compare.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:flutter/material.dart';

class InventoryTable extends StatefulWidget {
  const InventoryTable({super.key, required this.data, this.onDataChange});

  final List<MateriaisEstoque> data;
  final FutureOr<void> Function()? onDataChange;

  @override
  State<InventoryTable> createState() => InventoryTableState();
}

class InventoryTableState extends State<InventoryTable> {
  late ColorScheme _scheme;

  @override
  Widget build(BuildContext context) {
    _scheme = Theme.of(context).colorScheme;

    return ResponsiveTable(
      actionsLabel: localization(context).tableActionsLabel,
      // TODO: Atualizar .arb.
      columns: [
        ResponsiveColumn(label: 'Material', onSort: _sort),
        ResponsiveColumn(label: 'Unidade', onSort: _sort),
        ResponsiveColumn(label: 'Em estoque', onSort: _sort),
        ResponsiveColumn(label: 'Mínimo', onSort: _sort),
        ResponsiveColumn(label: 'Status', onSort: _sort),
      ],
      rows: List.generate(widget.data.length, (i) {
        final item = widget.data[i];
        final rowColor = i % 2 == 0
            ? _scheme.surfaceContainerHigh
            : _scheme.surfaceContainerLow;

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(item.nome),
            ResponsiveCell(''),
            ResponsiveCell(item.qtEstoque),
            ResponsiveCell(item.limBaixoEstoque),
            ResponsiveCell(
              item.qtEstoque >= item.limBaixoEstoque ? 'OK' : 'Sem estoque',
            ),
          ],
          actions: [
            PopupMenuItem(
              child: ListTile(
                leading: const Icon(Icons.edit),
                title: const Text('Editar'),
                onTap: () {},
              ),
            ),
            PopupMenuItem(
              child: ListTile(
                leading: const Icon(Icons.delete),
                title: const Text('Excluir'),
                onTap: () {},
              ),
            ),
          ],
        );
      }),
    );
  }

  int _compare(
    MateriaisEstoque a,
    MateriaisEstoque b,
    bool ascending,
    int index,
  ) {
    switch (index) {
      case 0:
        return compare(a.nome, b.nome, ascending);
      case 1:
        return compare('', '', ascending);
      case 2:
        return compare(a.qtEstoque, b.qtEstoque, ascending);
      case 3:
        return compare(a.limBaixoEstoque, b.limBaixoEstoque, ascending);
      case 4:
        return compare(
          a.qtEstoque >= a.limBaixoEstoque,
          b.qtEstoque >= b.limBaixoEstoque,
          ascending,
        );
      default:
        return 0;
    }
  }

  void _sort(int index, bool ascending) {
    setState(() {
      widget.data.sort((a, b) => _compare(a, b, ascending, index));
    });
  }
}
