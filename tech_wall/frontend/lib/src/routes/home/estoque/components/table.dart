import 'dart:async' show FutureOr;

import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/components/dialogs/boolean.dart';
import 'package:tech_wall/src/components/dialogs/materiais_estoque/edit_material.dart';
import 'package:tech_wall/src/components/responsive_table.dart';
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/compare.dart';
import 'package:tech_wall/src/utils/get_localization.dart';

class InventoryTable extends StatefulWidget {
  const InventoryTable({super.key, required this.data, this.onDataChange});

  final List<MaterialEstoqueModel> data;
  final FutureOr<void> Function()? onDataChange;

  @override
  State<InventoryTable> createState() => InventoryTableState();
}

class InventoryTableState extends State<InventoryTable> {
  late ColorScheme _scheme;

  @override
  void initState() {
    super.initState();
    _sort(0, true); // Ordena por item inicialmente
  }

  // AÇÃO DE EDITAR
  Future<void> _onPressedEditar(MaterialEstoqueModel item) async {
    final success = await DialogService.instance.showDialog(
      EditMaterial(material: item),
    );
    if (success == true) {
      widget.onDataChange?.call();
    }
  }

  // AÇÃO DE EXCLUIR
  Future<void> _onPressedExcluir(MaterialEstoqueModel item) async {
    final accept =
        await DialogService.instance.showDialog(
          BooleanDialog(
            title: 'Remover Material',
            content:
                'Tem certeza que deseja remover o material "${item.item}"?',
          ),
        ) ==
        true;

    if (!accept) return;
    final success = await MateriaisEstoqueApi.removeMaterial(item);
    if (success) {
      widget.onDataChange?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    _scheme = Theme.of(context).colorScheme;

    return ResponsiveTable(
      actionsLabel: localization(context).tableActionsLabel,
      columns: [
        ResponsiveColumn(label: 'Item', onSort: _sort),
        ResponsiveColumn(label: 'Quantidade', onSort: _sort),
        ResponsiveColumn(label: 'Unidade', onSort: _sort),
        ResponsiveColumn(label: 'Tipo', onSort: _sort),
        ResponsiveColumn(label: 'Observação', onSort: _sort),
        ResponsiveColumn(label: 'Status', onSort: _sort),
      ],
      rows: List.generate(widget.data.length, (i) {
        final item = widget.data[i];
        final rowColor = i.isEven
            ? _scheme.surfaceContainerHigh
            : _scheme.surfaceContainerLow;
        final isLowStock = item.quantidade < item.limBaixoEstoque;

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(item.item),
            ResponsiveCell(item.quantidade.toString()),
            ResponsiveCell(item.unidade ?? '-'),
            ResponsiveCell(item.tipo?.nome ?? '-'),
            ResponsiveCell(item.observacao ?? '-'),
            ResponsiveCell(
              isLowStock ? 'Estoque Baixo' : 'OK',
            ),
          ],
          actions: [
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

  int _compare(
    MaterialEstoqueModel a,
    MaterialEstoqueModel b,
    bool ascending,
    int index,
  ) {
    switch (index) {
      case 0: // Item
        return compare(a.item, b.item, ascending);
      case 1: // Quantidade
        return compare(a.quantidade, b.quantidade, ascending);
      case 2: // Unidade
        return compare(a.unidade, b.unidade, ascending);
      case 3: // Tipo
        return compare(a.tipo?.nome, b.tipo?.nome, ascending);
      case 4: // Observação
        return compare(a.observacao, b.observacao, ascending);
      case 5: // Status
        return compare(
          a.quantidade >= a.limBaixoEstoque,
          b.quantidade >= b.limBaixoEstoque,
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