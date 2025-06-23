import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:sistema_balneario/src/components/responsive_table.dart';
import 'package:sistema_balneario/src/localization/app_localizations.dart';
import 'package:sistema_balneario/src/models/delivery.dart';
import 'package:sistema_balneario/src/utils/compare.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';

class DeliveryManagementTable extends StatefulWidget {
  const DeliveryManagementTable({super.key, required this.data});

  final List<Delivery> data;

  @override
  State<DeliveryManagementTable> createState() =>
      DeliveryManagementTableState();
}

class DeliveryManagementTableState extends State<DeliveryManagementTable> {
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
        ResponsiveColumn(label: 'Endereço de Entrega', onSort: _sort),
        ResponsiveColumn(label: 'Data Agendada (Entrega)', onSort: _sort),
        ResponsiveColumn(label: 'Transportadora', onSort: _sort),
        ResponsiveColumn(label: 'Status', onSort: _sort),
      ],
      rows: List.generate(widget.data.length, (i) {
        final delivery = widget.data[i];
        final rowColor = i % 2 == 0
            ? _scheme.surfaceContainerHigh
            : _scheme.surfaceContainerLow;

        final dateTime = DateTime.tryParse(delivery.scheduledDate);
        final date = DateFormat.yMd(
          AppLocalizations.of(context)!.localeName,
        ).format(dateTime ?? DateTime(2000, 1, 1));

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(delivery.saleId),
            ResponsiveCell(delivery.customer?.name),
            ResponsiveCell(delivery.model?.name),
            ResponsiveCell(delivery.deliveryAddress),
            ResponsiveCell(date),
            ResponsiveCell(delivery.transportCompany ?? 'N/A'),
            ResponsiveCell(delivery.status.description),
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

  int _compare(Delivery a, Delivery b, bool ascending, int index) {
    switch (index) {
      case 0:
        return compare(a.saleId, b.saleId, ascending);
      case 1:
        return compare(a.customer?.name, b.customer?.name, ascending);
      case 2:
        return compare(a.model?.name, b.model?.name, ascending);
      case 3:
        return compare(a.deliveryAddress, b.deliveryAddress, ascending);
      case 4:
        return compare(
          DateTime.parse(a.scheduledDate),
          DateTime.parse(b.scheduledDate),
          ascending,
        );
      case 5:
        return compare(a.transportCompany, b.transportCompany, ascending);
      case 6:
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
