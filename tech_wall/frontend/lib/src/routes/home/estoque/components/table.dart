import 'dart:async' show FutureOr;

import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/components/dialogs/boolean.dart';
import 'package:tech_wall/src/components/dialogs/materiais_estoque/edit_material.dart';
import 'package:tech_wall/src/components/responsive_table.dart';
import 'package:tech_wall/src/models/materiais_estoque.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/compare.dart';
import 'package:tech_wall/src/utils/get_localization.dart';

class InventoryTable extends StatefulWidget {
  const InventoryTable({super.key, required this.data, this.onDataChange});

  final List<MateriaisEstoque> data;
  final FutureOr<void> Function()? onDataChange;

  @override
  State<InventoryTable> createState() => InventoryTableState();
}

class InventoryTableState extends State<InventoryTable> {
  late ColorScheme _scheme;

  @override
  void initState() {
    super.initState();
    _sort(0, true); // Ordena por nome inicialmente
  }

  // AÇÃO DE EDITAR
  Future<void> _onPressedEditar(MateriaisEstoque item) async {
    final success = await DialogService.instance.showDialog(
      EditMaterial(material: item),
    );
    if (success == true) {
      widget.onDataChange?.call();
    }
  }

  // AÇÃO DE EXCLUIR
  Future<void> _onPressedExcluir(MateriaisEstoque item) async {
    final accept =
        await DialogService.instance.showDialog(
          BooleanDialog(
            title: 'Remover Material',
            content:
                'Tem certeza que deseja remover o material "${item.nome}"?',
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
        ResponsiveColumn(label: 'Material', onSort: _sort),
        ResponsiveColumn(label: 'Em estoque', onSort: _sort),
        ResponsiveColumn(label: 'Mínimo', onSort: _sort),
        ResponsiveColumn(label: 'Status', onSort: _sort),
      ],
      rows: List.generate(widget.data.length, (i) {
        final item = widget.data[i];
        final rowColor = i.isEven
            ? _scheme.surfaceContainerHigh
            : _scheme.surfaceContainerLow;
        final isLowStock = item.qtEstoque < item.limBaixoEstoque;

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(item.nome),
            ResponsiveCell(item.qtEstoque.toString()),
            ResponsiveCell(item.limBaixoEstoque.toString()),
            ResponsiveCell(
              isLowStock ? 'Estoque Baixo' : 'OK',
              // Adiciona uma cor para destacar o status
              // style: TextStyle(
              //   color: isLowStock ? Colors.orange[800] : Colors.green[800],
              //   fontWeight: FontWeight.bold,
              // ),
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
    MateriaisEstoque a,
    MateriaisEstoque b,
    bool ascending,
    int index,
  ) {
    switch (index) {
      case 0: // Material (Nome)
        return compare(a.nome, b.nome, ascending);
      case 1: // Em estoque
        return compare(a.qtEstoque, b.qtEstoque, ascending);
      case 2: // Mínimo
        return compare(a.limBaixoEstoque, b.limBaixoEstoque, ascending);
      case 3: // Status
        return compare(
          a.qtEstoque >= a.limBaixoEstoque,
          b.qtEstoque >= b.limBaixoEstoque,
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
