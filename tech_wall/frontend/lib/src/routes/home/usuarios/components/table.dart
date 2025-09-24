import 'dart:async' show FutureOr;

import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/users/users.dart';
import 'package:tech_wall/src/components/dialogs/boolean.dart';
import 'package:tech_wall/src/components/dialogs/users/edit_user.dart';
import 'package:tech_wall/src/components/responsive_table.dart';
import 'package:tech_wall/src/models/user.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/compare.dart';
import 'package:tech_wall/src/utils/get_localization.dart';

class UsersTable extends StatefulWidget {
  const UsersTable({super.key, required this.data, this.onDataChange});

  final List<UserModel> data;
  final FutureOr<void> Function()? onDataChange;

  @override
  State<UsersTable> createState() => _UsersTableState();
}

class _UsersTableState extends State<UsersTable> {
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
        ResponsiveColumn(label: 'Nome', onSort: _sort),
        ResponsiveColumn(label: 'Email', onSort: _sort),
        ResponsiveColumn(label: 'Funções', onSort: _sort),
        ResponsiveColumn(label: 'Criado em', onSort: _sort),
        ResponsiveColumn(label: 'Última atualização', onSort: _sort),
      ],
      rows: List.generate(widget.data.length, (i) {
        final user = widget.data[i];
        final rowColor = i % 2 == 0
            ? _scheme.surfaceContainerHigh
            : _scheme.surfaceContainerLow;

        return ResponsiveRow(
          color: rowColor,
          cells: [
            ResponsiveCell(user.fullName),
            ResponsiveCell(user.email),
            ResponsiveCell(user.roles.map((r) => r.readable).join(', ')),
            ResponsiveCell(user.createdAt),
            ResponsiveCell(user.updatedAt),
          ],
          actions: [
            PopupMenuItem(
              child: ListTile(
                leading: const Icon(Icons.edit),
                title: const Text('Editar'),
                onTap: () => _onPressedEditar(user),
              ),
            ),
            PopupMenuItem(
              child: ListTile(
                leading: const Icon(Icons.delete),
                title: const Text('Excluir'),
                onTap: () => _onPressedExcluir(user),
              ),
            ),
          ],
        );
      }),
    );
  }

  Future<void> _onPressedEditar(UserModel user) async {
    final success = await DialogService.instance.showDialog(
      EditUser(id: user.id),
    );

    if (success == true) {
      widget.onDataChange?.call();
    }
  }

  Future<void> _onPressedExcluir(UserModel user) async {
    final accept = await DialogService.instance.showDialog(
      BooleanDialog(
        title: 'Remover',
        content:
            'Realmente deseja remover o usuário ${user.fullName ?? user.username ?? user.email}?',
      ),
    );

    if (accept != true) return;

    final success = await UsersApi.removeUser(user);

    if (success) {
      widget.onDataChange?.call();
    }
  }

  int _compare(UserModel a, UserModel b, bool ascending, int index) {
    switch (index) {
      case 0:
        return compare(a.username, b.username, ascending);
      case 1:
        return compare(a.email, b.email, ascending);
      case 2:
        return compare(a.isActive, b.isActive, ascending);
      case 3:
        return compare(a.createdAt, b.createdAt, ascending);
      case 4:
        return compare(a.updatedAt, b.updatedAt, ascending);
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
