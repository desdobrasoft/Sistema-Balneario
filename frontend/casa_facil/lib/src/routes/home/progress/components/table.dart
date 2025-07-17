import 'package:casa_facil/src/components/responsive_table.dart';
import 'package:casa_facil/src/localization/app_localizations.dart';
import 'package:casa_facil/src/models/production_order.dart';
import 'package:casa_facil/src/utils/compare.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ProgressTable extends StatefulWidget {
  const ProgressTable({super.key, required this.data});

  final List<ProductionOrder> data;

  @override
  State<ProgressTable> createState() => ProgressTableState();
}

class ProgressTableState extends State<ProgressTable> {
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
        ResponsiveColumn(label: 'Modelo', onSort: _sort),
        ResponsiveColumn(label: 'Cliente', onSort: _sort),
        ResponsiveColumn(label: 'Data Agendada', onSort: _sort),
        ResponsiveColumn(label: 'Status do Kit', onSort: _sort),
        ResponsiveColumn(label: 'Alocação', onSort: _sort),
        ResponsiveColumn(label: 'Notas', onSort: _sort),
      ],
      rows: List.generate(widget.data.length, (i) {
        final order = widget.data[i];
        final rowColor = i % 2 == 0
            ? _scheme.surfaceContainerHigh
            : _scheme.surfaceContainerLow;

        final dateTime = DateTime.tryParse(order.scheduledDate);
        final date = DateFormat.yMd(
          AppLocalizations.of(context)!.localeName,
        ).format(dateTime ?? DateTime(2000, 1, 1));

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(order.saleId),
            ResponsiveCell(order.model?.nome),
            ResponsiveCell(order.customer?.nome),
            ResponsiveCell(date),
            ResponsiveCell(order.status.description),
            ResponsiveCell(
              order.materialsAllocated == true ? 'Alocados' : 'Pendente',
            ),
            ResponsiveCell(order.notes),
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

  int _compare(
    ProductionOrder a,
    ProductionOrder b,
    bool ascending,
    int index,
  ) {
    switch (index) {
      case 0:
        return compare(a.saleId, b.saleId, ascending);
      case 1:
        return compare(a.model?.nome, b.model?.nome, ascending);
      case 2:
        return compare(a.customer?.nome, b.customer?.nome, ascending);
      case 3:
        return compare(a.scheduledDate, b.scheduledDate, ascending);
      case 4:
        return compare(a.status.description, b.status.description, ascending);
      case 5:
        return compare(a.notes, b.notes, ascending);
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
