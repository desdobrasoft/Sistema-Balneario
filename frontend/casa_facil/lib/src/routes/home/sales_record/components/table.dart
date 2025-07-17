import 'package:casa_facil/src/components/responsive_table.dart';
import 'package:casa_facil/src/localization/app_localizations.dart';
import 'package:casa_facil/src/models/venda.dart';
import 'package:casa_facil/src/utils/compare.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class SalesRecordTable extends StatefulWidget {
  const SalesRecordTable({super.key, required this.data});

  final List<VendaModel> data;

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

        final dateTime = DateTime.tryParse(sale.dataVenda);
        final date = DateFormat.yMd(
          AppLocalizations.of(context)!.localeName,
        ).format(dateTime ?? DateTime(2000, 1, 1));

        final currencyFormatter = NumberFormat.currency(
          locale: localization(context).localeName,
          symbol: 'R\$',
        );
        final price = currencyFormatter.format(sale.preco);

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(sale.id),
            ResponsiveCell(sale.modelo?.nome),
            ResponsiveCell(sale.cliente?.nome),
            ResponsiveCell(date),
            ResponsiveCell(price),
            ResponsiveCell(sale.statusVenda.description),
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

  int _compare(VendaModel a, VendaModel b, bool ascending, int index) {
    switch (index) {
      case 0:
        return compare(a.id, b.id, ascending);
      case 1:
        return compare(a.modelo?.nome, b.modelo?.nome, ascending);
      case 2:
        return compare(a.cliente?.nome, b.cliente?.nome, ascending);
      case 3:
        return compare(a.dataVenda, b.dataVenda, ascending);
      case 4:
        return compare(a.preco, b.preco, ascending);
      case 5:
        return compare(
          a.statusVenda.description,
          b.statusVenda.description,
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
