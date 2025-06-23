import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:sistema_balneario/src/components/responsive_table.dart';
import 'package:sistema_balneario/src/localization/app_localizations.dart';
import 'package:sistema_balneario/src/models/sale.dart';
import 'package:sistema_balneario/src/utils/compare.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';

class SalesRecordTable extends StatefulWidget {
  const SalesRecordTable({super.key, required this.data});

  final List<Sale> data;

  @override
  State<SalesRecordTable> createState() => SalesRecordTableState();
}

class SalesRecordTableState extends State<SalesRecordTable> {
  late ColorScheme _scheme;

  @override
  void initState() {
    super.initState();
    _sort(0, true);
  }

  @override
  Widget build(BuildContext context) {
    _scheme = Theme.of(context).colorScheme;

    return ResponsiveTable(
      actionsLabel: localization(context).tableActionsLabel,
      // TODO: Atualizar .arb.
      columns: [
        ResponsiveColumn(label: 'ID Venda', onSort: _sort),
        ResponsiveColumn(label: 'Cliente', onSort: _sort),
        ResponsiveColumn(label: 'Modelo', onSort: _sort),
        ResponsiveColumn(label: 'Data', onSort: _sort),
        ResponsiveColumn(label: 'Preço', onSort: _sort),
        ResponsiveColumn(label: 'Status', onSort: _sort),
      ],
      rows: List.generate(widget.data.length, (i) {
        final sale = widget.data[i];
        final rowColor = i % 2 == 0
            ? _scheme.surfaceContainerHigh
            : _scheme.surfaceContainerLow;

        final dateTime = DateTime.tryParse(sale.saleDate);
        final date = DateFormat.yMd(
          AppLocalizations.of(context)!.localeName,
        ).format(dateTime ?? DateTime(2000, 1, 1));

        final currencyFormatter = NumberFormat.currency(
          locale: localization(context).localeName,
          symbol: 'R\$',
        );
        final price = currencyFormatter.format(sale.price);

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(sale.id),
            ResponsiveCell(sale.model?.name),
            ResponsiveCell(sale.customer?.name),
            ResponsiveCell(date),
            ResponsiveCell(price),
            ResponsiveCell(sale.status.description),
          ],
          actions: [
            PopupMenuItem(
              child: ListTile(
                leading: const Icon(Icons.edit),
                title: const Text("Editar"),
                onTap: () {},
              ),
            ),
            PopupMenuItem(
              child: ListTile(
                leading: const Icon(Icons.delete),
                title: const Text("Excluir"),
                onTap: () {},
              ),
            ),
          ],
        );
      }),
    );
  }

  int _compare(Sale a, Sale b, bool ascending, int index) {
    switch (index) {
      case 0:
        return compare(a.id, b.id, ascending);
      case 1:
        return compare(a.model?.name, b.model?.name, ascending);
      case 2:
        return compare(a.customer?.name, b.customer?.name, ascending);
      case 3:
        return compare(a.saleDate, b.saleDate, ascending);
      case 4:
        return compare(a.price, b.price, ascending);
      case 5:
        return compare(a.status.description, b.status.description, ascending);
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
