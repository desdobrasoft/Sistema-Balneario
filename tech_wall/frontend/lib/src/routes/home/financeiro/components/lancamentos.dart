import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:tech_wall/src/api/lancamentos/lancamentos.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/components/dialogs/boolean.dart';
import 'package:tech_wall/src/components/dialogs/finance/add_lancamento.dart';
import 'package:tech_wall/src/components/dialogs/finance/edit_lancamento.dart';
import 'package:tech_wall/src/components/responsive_table.dart';
import 'package:tech_wall/src/models/lancamento.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/compare.dart';
import 'package:tech_wall/src/utils/get_localization.dart';

class Lancamentos extends StatefulWidget {
  const Lancamentos({super.key, required this.data, this.onDataChange});

  final List<LancamentoModel> data;
  final FutureOr<void> Function()? onDataChange;

  @override
  State<Lancamentos> createState() => _LancamentosState();
}

class _LancamentosState extends State<Lancamentos> {
  @override
  void initState() {
    super.initState();
    _sort(3, true); // Ordena por data de vencimento
  }

  Future<void> _addLancamento() async {
    final success = await DialogService.instance.showDialog(
      const AddLancamentoDialog(),
    );
    if (success == true) widget.onDataChange?.call();
  }

  Future<void> _editLancamento(LancamentoModel entry) async {
    final success = await DialogService.instance.showDialog(
      EditLancamentoDialog(lancamento: entry),
    );
    if (success == true) widget.onDataChange?.call();
  }

  Future<void> _removeLancamento(LancamentoModel entry) async {
    final accept = await DialogService.instance.showDialog(
      BooleanDialog(
        title: 'Excluir Lançamento',
        content:
            'Tem certeza que deseja excluir o lançamento "${entry.descricao}"?',
      ),
    );
    if (accept != true) return;
    final success = await LancamentosApi.remove(entry.id);
    if (success) widget.onDataChange?.call();
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'pt_BR',
      symbol: 'R\$',
    );
    final scheme = Theme.of(context).colorScheme;

    return AppCard.outlined(
      actions: [
        PopupMenuItem(
          onTap: _addLancamento,
          child: const ListTile(
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
          ResponsiveColumn(label: 'Valor Total', onSort: _sort),
          ResponsiveColumn(label: 'Valor Pendente', onSort: _sort),
          ResponsiveColumn(label: 'Vencimento', onSort: _sort),
          ResponsiveColumn(label: 'Status', onSort: _sort),
          ResponsiveColumn(label: 'Referência', onSort: _sort),
        ],
        rows: List.generate(widget.data.length, (i) {
          final entry = widget.data[i];
          final dueTime = DateTime.tryParse(entry.dataVencimento ?? '');
          final dueDate = dueTime == null
              ? '---'
              : DateFormat('dd/MM/yyyy').format(dueTime);

          return ResponsiveRow(
            color: i.isEven
                ? scheme.surfaceContainerHigh
                : scheme.surfaceContainerLow,
            cells: [
              ResponsiveCell(entry.descricao ?? 'N/A'),
              ResponsiveCell(entry.tipo.description),
              ResponsiveCell(currencyFormatter.format(entry.valorTotal)),
              ResponsiveCell(currencyFormatter.format(entry.valorPendente)),
              ResponsiveCell(dueDate),
              ResponsiveCell(entry.statusPagamento.description),
              ResponsiveCell(
                entry.venda != null ? 'Venda #${entry.venda!.id}' : 'N/A',
              ),
            ],
            actions: [
              PopupMenuItem(
                onTap: () => _editLancamento(entry),
                child: const ListTile(
                  leading: Icon(Icons.edit),
                  title: Text("Editar / Pagar"),
                ),
              ),
              PopupMenuItem(
                onTap: () => _removeLancamento(entry),
                child: const ListTile(
                  leading: Icon(Icons.delete),
                  title: Text("Excluir"),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  int _compare(
    LancamentoModel a,
    LancamentoModel b,
    bool ascending,
    int index,
  ) {
    return switch (index) {
      0 => compare(a.descricao, b.descricao, ascending),
      1 => compare(a.tipo.description, b.tipo.description, ascending),
      2 => compare(a.valorTotal, b.valorTotal, ascending),
      3 => compare(a.valorPendente, b.valorPendente, ascending),
      4 => compare(a.dataVencimento, b.dataVencimento, ascending),
      5 => compare(
        a.statusPagamento.description,
        b.statusPagamento.description,
        ascending,
      ),
      6 => compare(a.venda?.id, b.venda?.id, ascending),
      _ => 0,
    };
  }

  void _sort(int index, bool ascending) {
    setState(
      () => widget.data.sort((a, b) => _compare(a, b, ascending, index)),
    );
  }
}
