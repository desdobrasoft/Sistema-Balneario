import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:tech_wall/src/api/auth.dart';
import 'package:tech_wall/src/components/dialogs/users/edit_user.dart';
import 'package:tech_wall/src/routes/routes.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/get_localization.dart';
import 'package:tech_wall/src/utils/show_snackbar.dart';

enum _Options { atualizarDados, logout }

class HomePopupMenu extends StatelessWidget {
  const HomePopupMenu({super.key});

  static const _popupDuration = Durations.short4;

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<_Options>(
      popUpAnimationStyle: AnimationStyle(
        curve: Curves.easeOutCirc,
        duration: _popupDuration,
        reverseCurve: Curves.easeInCirc,
        reverseDuration: _popupDuration,
      ),
      icon: Icon(Icons.more_vert),
      onSelected: (value) async {
        switch (value) {
          case _Options.atualizarDados:
            final success = await DialogService.instance.showDialog(
              EditUser(isOwner: true),
              ignoreOpenDialog: true,
            );

            if (success == true) {
              showSnackbar('Dados atualizados com sucesso.');
            }
            break;
          case _Options.logout:
            await AuthApi.api.logout();
            if (context.mounted) {
              context.goNamed(Routes.login.name);
            }
        }
      },
      itemBuilder: (context) => [
        PopupMenuItem(
          value: _Options.atualizarDados,
          child: ListTile(
            leading: const Icon(Icons.edit_note),
            title: Text('Atualizar Meus Dados'),
            onTap: null,
          ),
        ),
        PopupMenuItem(
          value: _Options.logout,
          child: ListTile(
            leading: const Icon(Icons.logout),
            title: Text(localization(context).homePopupLogoutLabel),
            onTap: null,
          ),
        ),
      ],
    );
  }
}
