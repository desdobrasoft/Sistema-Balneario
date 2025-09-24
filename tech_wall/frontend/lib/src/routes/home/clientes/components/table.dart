import 'dart:async' show FutureOr;

import 'package:brasil_fields/brasil_fields.dart' show UtilBrasilFields;
import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/clientes/clientes.dart';
import 'package:tech_wall/src/components/dialogs/boolean.dart';
import 'package:tech_wall/src/components/dialogs/edit_cliente.dart';
import 'package:tech_wall/src/components/responsive_table.dart';
import 'package:tech_wall/src/models/cliente.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/compare.dart';
import 'package:tech_wall/src/utils/get_localization.dart';

class ClientesTable extends StatefulWidget {
  const ClientesTable({super.key, required this.data, this.onDataChange});

  final List<ClienteModel> data;
  final FutureOr<void> Function()? onDataChange;

  @override
  State<ClientesTable> createState() => _ClientesTableState();
}

class _ClientesTableState extends State<ClientesTable> {
  late ColorScheme _scheme;

  @override
  void initState() {
    super.initState();
    // Ordena inicialmente por nome
    _sort(0, true);
  }

  @override
  Widget build(BuildContext context) {
    _scheme = Theme.of(context).colorScheme;

    return ResponsiveTable(
      actionsLabel: localization(context).tableActionsLabel,
      columns: [
        ResponsiveColumn(label: 'Nome', onSort: _sort),
        ResponsiveColumn(label: 'Email', onSort: _sort),
        ResponsiveColumn(label: 'Nº Contato', onSort: _sort),
        ResponsiveColumn(label: 'Nº Vendas', onSort: _sort),
      ],
      rows: List.generate(widget.data.length, (i) {
        final cliente = widget.data[i];
        final rowColor = i % 2 == 0
            ? _scheme.surfaceContainerHigh
            : _scheme.surfaceContainerLow;

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(cliente.nome),
            ResponsiveCell(cliente.email),
            ResponsiveCell(UtilBrasilFields.obterTelefone(cliente.nroContato)),
            ResponsiveCell(cliente.historicoVendas.toString()),
          ],
          actions: [
            PopupMenuItem(
              child: ListTile(
                leading: const Icon(Icons.edit),
                title: const Text('Editar'),
                onTap: () => _onPressedEditar(cliente),
              ),
            ),
            PopupMenuItem(
              child: ListTile(
                leading: const Icon(Icons.delete),
                title: const Text('Excluir'),
                onTap: () => _onPressedExcluir(cliente),
              ),
            ),
          ],
        );
      }),
    );
  }

  Future<void> _onPressedEditar(ClienteModel cliente) async {
    final success = await DialogService.instance.showDialog(
      EditCliente(cliente: cliente),
    );

    if (success == true) {
      widget.onDataChange?.call();
    }
  }

  Future<void> _onPressedExcluir(ClienteModel cliente) async {
    final accept = await DialogService.instance.showDialog(
      BooleanDialog(
        title: 'Remover',
        content: 'Realmente deseja remover o cliente ${cliente.nome}?',
      ),
    );

    if (accept != true) return;

    final success = await ClientesApi.removeCliente(cliente);

    if (success) {
      widget.onDataChange?.call();
    }
  }

  int _compare(ClienteModel a, ClienteModel b, bool ascending, int index) {
    switch (index) {
      case 0: // Nome
        return compare(a.nome, b.nome, ascending);
      case 1: // Email
        return compare(a.email, b.email, ascending);
      case 2: // Nº Contato
        return compare(a.nroContato, b.nroContato, ascending);
      case 3: // Nº Vendas
        return compare(a.historicoVendas, b.historicoVendas, ascending);
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
