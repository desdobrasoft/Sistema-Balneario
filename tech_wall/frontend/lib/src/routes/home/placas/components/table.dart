import 'dart:async';

import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/placas/placas.dart';
import 'package:tech_wall/src/components/dialogs/boolean.dart';
import 'package:tech_wall/src/components/dialogs/placas/add_edit_placa.dart';
import 'package:tech_wall/src/components/dialogs/placas/baixa_producao.dart';
import 'package:tech_wall/src/components/dialogs/placas/gerenciar_producao.dart';
import 'package:tech_wall/src/components/responsive_table.dart';
import 'package:tech_wall/src/models/placa.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/compare.dart';

class PlacasTable extends StatefulWidget {
  const PlacasTable({super.key, required this.data, this.onDataChange});

  final List<Placa> data;
  final FutureOr<void> Function()? onDataChange;

  @override
  State<PlacasTable> createState() => _PlacasTableState();
}

class _PlacasTableState extends State<PlacasTable> {
  late ColorScheme _scheme;

  @override
  void initState() {
    super.initState();
    _sort(0, true); // Sort by name initially
  }

  Future<void> _onPressedGerenciar(Placa item) async {
    final success = await DialogService.instance.showDialog(
      GerenciarProducaoDialog(placa: item),
    );
    if (success == true) {
      widget.onDataChange?.call();
    }
  }

  Future<void> _onPressedBaixa(Placa item) async {
    final success = await DialogService.instance.showDialog(
      BaixaProducaoDialog(placa: item),
    );
    if (success == true) {
      widget.onDataChange?.call();
    }
  }

  Future<void> _onPressedEditar(Placa item) async {
    final success = await DialogService.instance.showDialog(
      AddEditPlacaDialog(placa: item),
    );
    if (success == true) {
      widget.onDataChange?.call();
    }
  }

  Future<void> _onPressedExcluir(Placa item) async {
    final accept =
        await DialogService.instance.showDialog(
          BooleanDialog(
            title: 'Remover Placa',
            content: 'Tem certeza que deseja remover a placa "${item.nome}"?',
          ),
        ) ==
        true;

    if (!accept) return;
    try {
      await PlacasApi.remove(item.id);
      widget.onDataChange?.call();
    } catch (e) {
      // Handle error
    }
  }

  @override
  Widget build(BuildContext context) {
    _scheme = Theme.of(context).colorScheme;

    return ResponsiveTable(
      actionsLabel: 'Ações',
      columns: [
        ResponsiveColumn(label: 'Nome', onSort: _sort),
        ResponsiveColumn(label: 'Dimensões (A x L x E)', onSort: _sort),
        ResponsiveColumn(label: 'Aguardando', onSort: _sort),
        ResponsiveColumn(label: 'Em Produção', onSort: _sort),
        ResponsiveColumn(label: 'Prontas', onSort: _sort),
      ],
      rows: List.generate(widget.data.length, (i) {
        final item = widget.data[i];
        final rowColor = i.isEven
            ? _scheme.surfaceContainerHigh
            : _scheme.surfaceContainerLow;

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(item.nome),
            ResponsiveCell(
              '${item.altura ?? 'N/A'} x ${item.largura ?? 'N/A'} x ${item.espessura ?? 'N/A'}',
            ),
            ResponsiveCell(item.qtAguardandoProducao.toString()),
            ResponsiveCell(item.qtEmProducao.toString()),
            ResponsiveCell(item.qtPronta.toString()),
          ],
          actions: [
            PopupMenuItem(
              onTap: () => _onPressedGerenciar(item),
              child: const ListTile(
                leading: Icon(Icons.settings),
                title: Text('Gerenciar Produção'),
              ),
            ),
            PopupMenuItem(
              onTap: () => _onPressedBaixa(item),
              child: const ListTile(
                leading: Icon(Icons.check_circle_outline),
                title: Text('Dar Baixa Direta'),
              ),
            ),
            PopupMenuItem(
              onTap: () => _onPressedEditar(item),
              child: const ListTile(
                leading: Icon(Icons.edit),
                title: Text('Editar'),
              ),
            ),
            PopupMenuItem(
              onTap: () => _onPressedExcluir(item),
              child: const ListTile(
                leading: Icon(Icons.delete),
                title: Text('Excluir'),
              ),
            ),
          ],
        );
      }),
    );
  }

  int _compare(Placa a, Placa b, bool ascending, int index) {
    switch (index) {
      case 0: // Nome
        return compare(a.nome, b.nome, ascending);
      case 1: // Dimensoes
        return compare(a.altura, b.altura, ascending);
      case 2: // Aguardando
        return compare(
          a.qtAguardandoProducao,
          b.qtAguardandoProducao,
          ascending,
        );
      case 3: // Em Produção
        return compare(a.qtEmProducao, b.qtEmProducao, ascending);
      case 4: // Prontas
        return compare(a.qtPronta, b.qtPronta, ascending);
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
