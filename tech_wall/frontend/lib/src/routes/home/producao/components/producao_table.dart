import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:tech_wall/src/api/producao/producao.dart';
import 'package:tech_wall/src/components/dialogs/boolean.dart';
import 'package:tech_wall/src/components/dialogs/producao/iniciar_producao_dialog.dart';
import 'package:tech_wall/src/components/dialogs/producao/update_status_producao.dart';
import 'package:tech_wall/src/components/responsive_table.dart';
import 'package:tech_wall/src/models/ordem_producao.dart';
import 'package:tech_wall/src/models/status_producao.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/compare.dart';

class ProducaoTable extends StatefulWidget {
  const ProducaoTable({super.key, required this.data, this.onDataChange});

  final List<OrdemProducaoModel> data;
  final FutureOr<void> Function()? onDataChange;

  @override
  State<ProducaoTable> createState() => _ProducaoTableState();
}

class _ProducaoTableState extends State<ProducaoTable> {
  @override
  void initState() {
    super.initState();
    _sort(0, true);
  }

  Future<void> _iniciarProducao(OrdemProducaoModel ordem) async {
    final success = await DialogService.instance.showDialog(
      IniciarProducaoDialog(ordem: ordem),
    );
    if (success == true) {
      widget.onDataChange?.call();
    }
  }

  Future<void> _updateStatus(OrdemProducaoModel ordem) async {
    final success = await DialogService.instance.showDialog(
      UpdateStatusProducaoDialog(ordem: ordem),
    );
    if (success == true) {
      widget.onDataChange?.call();
    }
  }

  Future<void> _finalizarProducao(OrdemProducaoModel ordem) async {
    final confirmed =
        await DialogService.instance.showDialog(
          BooleanDialog(
            title: 'Finalizar Produção',
            content:
                'Tem certeza que deseja finalizar a produção para a venda #${ordem.venda.id}? Esta ação irá gerar o registro de entrega e não poderá ser desfeita.',
          ),
        ) ==
        true;

    if (!confirmed) return;

    final success = await ProducaoApi.finalizarProducao(ordem.id);
    if (success) {
      widget.onDataChange?.call();
    }
  }

  Future<void> _removerOrdem(OrdemProducaoModel ordem) async {
    final confirmed =
        await DialogService.instance.showDialog(
          BooleanDialog(
            title: 'Remover Ordem de Produção',
            content:
                'ATENÇÃO: Tem certeza que deseja remover permanentemente a ordem de produção da venda #${ordem.venda.id}? Esta ação não pode ser desfeita.',
          ),
        ) ==
        true;

    if (!confirmed) return;

    final success = await ProducaoApi.remove(ordem.id);
    if (success) {
      widget.onDataChange?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return ResponsiveTable(
      actionsLabel: 'Ações',
      columns: [
        ResponsiveColumn(label: 'ID Venda', onSort: _sort),
        ResponsiveColumn(label: 'Cliente', onSort: _sort),
        ResponsiveColumn(label: 'Modelo', onSort: _sort),
        ResponsiveColumn(label: 'Data Agendada', onSort: _sort),
        ResponsiveColumn(label: 'Status do Kit', onSort: _sort),
      ],
      rows: List.generate(widget.data.length, (i) {
        final ordem = widget.data[i];
        final rowColor = i.isEven
            ? scheme.surfaceContainerHigh
            : scheme.surfaceContainerLow;
        final dateTime = DateTime.tryParse(ordem.dataAgendamento ?? '');
        final date = dateTime == null
            ? 'Não agendado'
            : DateFormat('dd/MM/yyyy').format(dateTime);

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(ordem.venda.id.toString()),
            ResponsiveCell(ordem.venda.cliente?.nome ?? 'N/A'),
            ResponsiveCell(ordem.venda.modelo?.nome ?? 'N/A'),
            ResponsiveCell(date),
            ResponsiveCell(ordem.status.description),
          ],
          actions: _buildActionsForStatus(ordem),
        );
      }),
    );
  }

  List<PopupMenuEntry> _buildActionsForStatus(OrdemProducaoModel ordem) {
    switch (ordem.status) {
      case StatusProducao.materiaisPendentes:
        return [
          PopupMenuItem(
            onTap: () => _iniciarProducao(ordem),
            child: const ListTile(
              leading: Icon(Icons.play_circle_outline),
              title: Text("Iniciar Produção"),
            ),
          ),
        ];
      case StatusProducao.prontoEnvio:
        return [
          PopupMenuItem(
            onTap: () => _removerOrdem(ordem),
            child: const ListTile(
              leading: Icon(Icons.delete_forever, color: Colors.red),
              title: Text("Remover", style: TextStyle(color: Colors.red)),
            ),
          ),
        ];
      default:
        return [
          PopupMenuItem(
            onTap: () => _updateStatus(ordem),
            child: const ListTile(
              leading: Icon(Icons.edit_note),
              title: Text("Alterar Status"),
            ),
          ),
          PopupMenuItem(
            onTap: () => _finalizarProducao(ordem),
            child: const ListTile(
              leading: Icon(Icons.check_circle_outline),
              title: Text("Finalizar Produção"),
            ),
          ),
          const PopupMenuDivider(),
          PopupMenuItem(
            onTap: () => _removerOrdem(ordem),
            child: const ListTile(
              leading: Icon(Icons.delete_forever, color: Colors.red),
              title: Text("Remover", style: TextStyle(color: Colors.red)),
            ),
          ),
        ];
    }
  }

  int _compare(
    OrdemProducaoModel a,
    OrdemProducaoModel b,
    bool ascending,
    int index,
  ) {
    switch (index) {
      case 0:
        return compare(a.venda.id, b.venda.id, ascending);
      case 1:
        return compare(a.venda.cliente?.nome, b.venda.cliente?.nome, ascending);
      case 2:
        return compare(a.venda.modelo?.nome, b.venda.modelo?.nome, ascending);
      case 3:
        return compare(a.dataAgendamento, b.dataAgendamento, ascending);
      case 4:
        return compare(a.status.description, b.status.description, ascending);
      default:
        return 0;
    }
  }

  void _sort(int index, bool ascending) {
    setState(
      () => widget.data.sort((a, b) => _compare(a, b, ascending, index)),
    );
  }
}
