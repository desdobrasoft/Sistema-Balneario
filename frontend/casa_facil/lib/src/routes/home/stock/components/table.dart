import 'package:casa_facil/src/components/responsive_table.dart';
import 'package:casa_facil/src/models/stock_item.dart';
import 'package:casa_facil/src/utils/compare.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:flutter/material.dart';

class InventoryTable extends StatefulWidget {
  const InventoryTable({super.key, required this.data});

  final List<StockItem> data;

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
            ResponsiveCell(item.name),
            ResponsiveCell(item.unit),
            ResponsiveCell(item.quantityInStock),
            ResponsiveCell(item.lowStockThreshold),
            ResponsiveCell(
              item.quantityInStock >= item.lowStockThreshold
                  ? 'OK'
                  : 'Sem estoque',
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

  int _compare(StockItem a, StockItem b, bool ascending, int index) {
    switch (index) {
      case 0:
        return compare(a.name, b.name, ascending);
      case 1:
        return compare(a.unit, b.unit, ascending);
      case 2:
        return compare(a.quantityInStock, b.quantityInStock, ascending);
      case 3:
        return compare(a.lowStockThreshold, b.lowStockThreshold, ascending);
      case 4:
        return compare(
          a.quantityInStock >= a.lowStockThreshold,
          b.quantityInStock >= b.lowStockThreshold,
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
