import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:sistema_balneario/src/components/card.dart';
import 'package:sistema_balneario/src/components/responsive_table.dart';
import 'package:sistema_balneario/src/models/account_entry_model.dart';
import 'package:sistema_balneario/src/utils/compare.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';

class AccountEntries extends StatefulWidget {
  const AccountEntries({super.key, required this.data});

  final List<AccountEntryModel> data;

  @override
  State<AccountEntries> createState() => _AccountEntriesState();
}

class _AccountEntriesState extends State<AccountEntries> {
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
            title: Text('Adicionar lançamento'),
          ),
        ),
      ],
      title: 'Lançamentos Financeiros',
      subtitle: 'Visualize e gerencie suas receitas e despesas',
      content: ResponsiveTable(
        actionsLabel: localization(context).tableActionsLabel,
        columns: [
          ResponsiveColumn(label: 'Descrição', onSort: _sort),
          ResponsiveColumn(label: 'Tipo', onSort: _sort),
          ResponsiveColumn(label: 'Valor', onSort: _sort),
          ResponsiveColumn(label: 'Vencimento', onSort: _sort),
          ResponsiveColumn(label: 'Pagamento', onSort: _sort),
          ResponsiveColumn(label: 'Status', onSort: _sort),
          ResponsiveColumn(label: 'Ref. venda', onSort: _sort),
        ],
        rows: List.generate(widget.data.length, (i) {
          final entry = widget.data[i];
          final rowColor = i % 2 == 0
              ? _scheme.surfaceContainerHigh
              : _scheme.surfaceContainerLow;

          final dueTime = DateTime.tryParse(entry.dueDate);
          final dueDate = dueTime == null
              ? '---'
              : DateFormat.yMd(
                  localization(context).localeName,
                ).format(dueTime);

          final payTime = DateTime.tryParse('${entry.paymentDate}');
          final payDate = payTime == null
              ? '---'
              : DateFormat.yMd(
                  localization(context).localeName,
                ).format(payTime);

          return ResponsiveRow(
            color: rowColor,
            cells: [
              ResponsiveCell(entry.description),
              ResponsiveCell(entry.type.description),
              ResponsiveCell(currencyFormatter.format(entry.amount)),
              ResponsiveCell(dueDate),
              ResponsiveCell(payDate),
              ResponsiveCell(entry.status.description),
              ResponsiveCell(entry.relatedSaleId ?? 'N/A'),
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

  int _compare(
    AccountEntryModel a,
    AccountEntryModel b,
    bool ascending,
    int index,
  ) {
    return switch (index) {
      0 => compare(a.description, b.description, ascending),
      1 => compare(a.type.description, b.type.description, ascending),
      2 => compare(a.amount, b.amount, ascending),
      3 => compare(a.dueDate, b.dueDate, ascending),
      4 => compare(a.paymentDate, b.paymentDate, ascending),
      5 => compare(a.status.description, b.status.description, ascending),
      6 => compare(a.relatedSaleId, b.description, ascending),
      _ => 0,
    };
  }

  void _sort(int index, bool ascending) {
    setState(() {
      widget.data.sort((a, b) => _compare(a, b, ascending, index));
    });
  }
}
