import 'package:casa_facil/src/components/responsive_table.dart';
import 'package:casa_facil/src/models/customer.dart';
import 'package:casa_facil/src/utils/compare.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:flutter/material.dart';

class CustomersTable extends StatefulWidget {
  const CustomersTable({super.key, required this.data});

  final List<CustomerModel> data;

  @override
  State<CustomersTable> createState() => _CustomersTableState();
}

class _CustomersTableState extends State<CustomersTable> {
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
      columns: [
        ResponsiveColumn(
          label: localization(context).customerTableNameLabel,
          onSort: _sort,
        ),
        ResponsiveColumn(
          label: localization(context).customerTableEmailLabel,
          onSort: _sort,
        ),
        ResponsiveColumn(
          label: localization(context).customerTablePhoneLabel,
          onSort: _sort,
        ),
        ResponsiveColumn(
          label: localization(context).customerTableAddressLabel,
          onSort: _sort,
        ),
        ResponsiveColumn(
          label: localization(context).customerTableSalesLabel,
          onSort: _sort,
        ),
      ],
      rows: List.generate(widget.data.length, (i) {
        final customer = widget.data[i];
        final rowColor = i % 2 == 0
            ? _scheme.surfaceContainerHigh
            : _scheme.surfaceContainerLow;

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(customer.name),
            ResponsiveCell(customer.email),
            ResponsiveCell(customer.phone),
            ResponsiveCell(customer.address),
            ResponsiveCell('${customer.salesHistoryCount}'),
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

  int _compare(CustomerModel a, CustomerModel b, bool ascending, int index) {
    switch (index) {
      case 0:
        return compare(a.name, b.name, ascending);
      case 1:
        return compare(a.email, b.email, ascending);
      case 2:
        return compare(a.phone, b.phone, ascending);
      case 3:
        return compare(a.address, b.address, ascending);
      case 4:
        return compare(a.salesHistoryCount, b.salesHistoryCount, ascending);
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
