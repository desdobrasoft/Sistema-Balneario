import 'dart:async' show FutureOr;

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:tech_wall/src/api/vendas/dto.dart';
import 'package:tech_wall/src/api/vendas/vendas.dart';
import 'package:tech_wall/src/components/dialogs/boolean.dart';
import 'package:tech_wall/src/components/dialogs/vendas/edit_venda.dart';
import 'package:tech_wall/src/components/dialogs/vendas/view_venda_details_dialog.dart';
import 'package:tech_wall/src/components/responsive_table.dart';
import 'package:tech_wall/src/models/status_venda.dart';
import 'package:tech_wall/src/models/venda.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/compare.dart';
import 'package:tech_wall/src/utils/get_localization.dart';

class SalesRecordTable extends StatefulWidget {
  const SalesRecordTable({super.key, required this.data, this.onDataChange});

  final List<VendaModel> data;
  final FutureOr<void> Function()? onDataChange;

  @override
  State<SalesRecordTable> createState() => SalesRecordTableState();
}

class SalesRecordTableState extends State<SalesRecordTable> {
  late ColorScheme _scheme;

  @override
  void initState() {
    super.initState();
    _sort(3, false); // Ordena por data (decrescente) inicialmente
  }

  Future<void> _onPressedVerDetalhes(VendaModel sale) async {
    Navigator.of(context).pop(); // Fecha o menu de ações
    await DialogService.instance.showDialog(
      ViewVendaDetailsDialog(venda: sale),
    );
  }

  // AÇÃO DE EDITAR: Abre o diálogo para alterar o status da venda e do pagamento.
  Future<void> _onPressedEditar(VendaModel sale) async {
    // Fecha o menu de ações antes de abrir o diálogo
    Navigator.of(context).pop();
    final success = await DialogService.instance.showDialog(
      UpdateVendaStatusDialog(venda: sale),
    );
    if (success == true) {
      widget.onDataChange?.call();
    }
  }

  // AÇÃO DE EXCLUIR: Na verdade, cancela a venda para manter o histórico.
  Future<void> _onPressedCancelar(VendaModel sale) async {
    // Fecha o menu de ações antes de abrir o diálogo
    Navigator.of(context).pop();
    final accept = await DialogService.instance.showDialog(
      BooleanDialog(
        title: 'Cancelar Venda',
        content:
            'Tem certeza que deseja cancelar a venda #${sale.id}?\nEsta ação não pode ser desfeita.',
      ),
    );

    if (accept != true) return;

    final success = await VendasApi.updateVenda(
      vendaId: sale.id,
      dto: const UpdateVendaDto(status: StatusVenda.canceled),
    );

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
        ResponsiveColumn(label: 'ID Venda', onSort: _sort),
        ResponsiveColumn(label: 'Cliente', onSort: _sort),
        ResponsiveColumn(label: 'Modelo', onSort: _sort),
        ResponsiveColumn(label: 'Data', onSort: _sort),
        ResponsiveColumn(label: 'Preço', onSort: _sort),
        ResponsiveColumn(label: 'Status', onSort: _sort),
      ],
      rows: List.generate(widget.data.length, (i) {
        final sale = widget.data[i];
        final rowColor = i.isEven
            ? _scheme.surfaceContainerHigh
            : _scheme.surfaceContainerLow;

        final dateTime = DateTime.tryParse(sale.dataVenda);
        final date = DateFormat.yMd(
          localization(context).localeName,
        ).format(dateTime ?? DateTime.now());

        final currencyFormatter = NumberFormat.currency(
          locale: localization(context).localeName,
          symbol: 'R\$ ',
        );
        final price = currencyFormatter.format(sale.preco);

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(sale.id.toString()),
            // CORREÇÃO: Exibindo o nome do cliente na coluna de cliente
            ResponsiveCell(sale.cliente?.nome ?? 'N/A'),
            // CORREÇÃO: Exibindo o nome do modelo na coluna de modelo
            ResponsiveCell(sale.modelo?.nome ?? 'N/A'),
            ResponsiveCell(date),
            ResponsiveCell(price),
            ResponsiveCell(sale.statusVenda.description),
          ],
          actions: [
            PopupMenuItem(
              child: ListTile(
                leading: Icon(Icons.visibility),
                title: Text("Ver Detalhes"),
                onTap: () => _onPressedVerDetalhes(sale),
              ),
            ),
            PopupMenuItem(
              child: ListTile(
                leading: Icon(Icons.edit),
                title: Text("Alterar Status"),
                // IMPLEMENTADO: Chamando a função de editar
                onTap: () => _onPressedEditar(sale),
              ),
            ),
            PopupMenuItem(
              child: ListTile(
                leading: Icon(Icons.cancel_outlined, color: Colors.red),
                title: Text("Cancelar Venda"),
                // IMPLEMENTADO: Chamando a função de cancelar
                onTap: () => _onPressedCancelar(sale),
              ),
            ),
          ],
        );
      }),
    );
  }

  int _compare(VendaModel a, VendaModel b, bool ascending, int index) {
    switch (index) {
      case 0:
        return compare(a.id, b.id, ascending);
      case 1:
        // CORREÇÃO: Comparando pelo nome do cliente
        return compare(a.cliente?.nome, b.cliente?.nome, ascending);
      case 2:
        // CORREÇÃO: Comparando pelo nome do modelo
        return compare(a.modelo?.nome, b.modelo?.nome, ascending);
      case 3:
        return compare(a.dataVenda, b.dataVenda, ascending);
      case 4:
        return compare(a.preco, b.preco, ascending);
      case 5:
        return compare(
          a.statusVenda.description,
          b.statusVenda.description,
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