import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/components/responsive_table.dart';
import 'package:tech_wall/src/models/invoice.dart';
import 'package:tech_wall/src/utils/compare.dart';
import 'package:tech_wall/src/utils/get_localization.dart';

class Invoices extends StatefulWidget {
  const Invoices({super.key});

  @override
  State<Invoices> createState() => _InvoicesState();
}

class _InvoicesState extends State<Invoices> {
  final _data = [];

  late ColorScheme _scheme;

  @override
  void initState() {
    super.initState();
    _sort(0, true);
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(
      locale: localization(context).localeName,
      symbol: 'R\$',
    );

    _scheme = Theme.of(context).colorScheme;

    return AppCard.outlined(
      actions: [
        PopupMenuItem(
          child: ListTile(
            leading: Icon(Icons.add),
            title: Text('Registrar NF'),
          ),
        ),
      ],
      title: 'Lançamentos Financeiros',
      subtitle: 'Visualize e gerencie suas receitas e despesas',
      content: ResponsiveTable(
        actionsLabel: localization(context).tableActionsLabel,
        columns: [
          ResponsiveColumn(label: 'NF', onSort: _sort),
          ResponsiveColumn(label: 'Tipo', onSort: _sort),
          ResponsiveColumn(label: 'Data emissão', onSort: _sort),
          ResponsiveColumn(label: 'Cliente/Fornecedor', onSort: _sort),
          ResponsiveColumn(label: 'Valor total', onSort: _sort),
          ResponsiveColumn(label: 'Status', onSort: _sort),
        ],
        rows: List.generate(_data.length, (i) {
          final invoice = _data[i];
          final rowColor = i % 2 == 0
              ? _scheme.surfaceContainerHigh
              : _scheme.surfaceContainerLow;

          final dateTime = DateTime.tryParse(invoice.issueDate);
          final date = dateTime == null
              ? '---'
              : DateFormat.yMd(
                  localization(context).localeName,
                ).format(dateTime);

          return ResponsiveRow(
            color: rowColor,
            cells: [
              ResponsiveCell(invoice.invoiceNumber),
              ResponsiveCell(invoice.type.description),
              ResponsiveCell(date),
              ResponsiveCell(invoice.customerName ?? invoice.supplierName),
              ResponsiveCell(currencyFormatter.format(invoice.totalAmount)),
              ResponsiveCell(invoice.status.description),
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
      ),
    );
  }

  int _compare(Invoice a, Invoice b, bool ascending, int index) {
    return switch (index) {
      0 => compare(a.invoiceNumber, b.invoiceNumber, ascending),
      1 => compare(a.type.description, b.type.description, ascending),
      3 => compare(a.issueDate, b.issueDate, ascending),
      2 => compare(
        a.customerName ?? a.supplierName,
        b.customerName ?? b.supplierName,
        ascending,
      ),
      4 => compare(a.totalAmount, b.totalAmount, ascending),
      5 => compare(a.status.description, b.status.description, ascending),
      _ => 0,
    };
  }

  void _sort(int index, bool ascending) {
    setState(() {
      _data.sort((a, b) => _compare(a, b, ascending, index));
    });
  }
}
