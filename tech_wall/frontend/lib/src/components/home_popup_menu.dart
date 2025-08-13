import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:tech_wall/src/api/auth.dart';
import 'package:tech_wall/src/components/dialogs/users/edit_user.dart';
import 'package:tech_wall/src/routes/routes.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/preferences/preferences.dart';
import 'package:tech_wall/src/utils/get_localization.dart';
import 'package:tech_wall/src/utils/show_snackbar.dart';

class HomePopupMenu extends StatelessWidget {
  const HomePopupMenu({super.key});

  // Função auxiliar para obter o nome do tema, agora recebendo o contexto.
  String _getThemeModeName(ThemeMode mode, BuildContext context) {
    switch (mode) {
      case ThemeMode.system:
        return 'Padrão do Sistema';
      case ThemeMode.light:
        return 'Claro';
      case ThemeMode.dark:
        return 'Escuro';
    }
  }

  // Função auxiliar para obter o ícone do tema.
  IconData _getThemeIcon(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.system:
        return Icons.brightness_auto_outlined;
      case ThemeMode.light:
        return Icons.light_mode_outlined;
      case ThemeMode.dark:
        return Icons.dark_mode_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Usando MenuAnchor para permitir submenus.
    return MenuAnchor(
      builder: (context, controller, child) {
        return IconButton(
          onPressed: () {
            if (controller.isOpen) {
              controller.close();
            } else {
              controller.open();
            }
          },
          icon: const Icon(Icons.settings),
        );
      },
      // menuChildren espera uma lista de Widgets.
      menuChildren: [
        // Usando MenuItemButton em vez de PopupMenuItem.
        MenuItemButton(
          leadingIcon: const Icon(Icons.edit_note),
          onPressed: () async {
            final success = await DialogService.instance.showDialog(
              const EditUser(isOwner: true),
            );
            if (success == true) {
              showSnackbar('Dados atualizados com sucesso.');
            }
          },
          child: const Text('Atualizar Meus Dados'),
        ),
        // SubmenuButton funciona corretamente dentro de MenuAnchor.
        SubmenuButton(
          leadingIcon: const Icon(Icons.brightness_4), // Parâmetro corrigido
          menuChildren: ThemeMode.values.map((mode) {
            return MenuItemButton(
              // Adicionando o ícone para cada opção do submenu.
              leadingIcon: Icon(_getThemeIcon(mode)),
              onPressed: () {
                Preferences.instance.save(tema: mode);
              },
              child: Text(_getThemeModeName(mode, context)),
            );
          }).toList(),
          child: const Text('Alterar Tema'), // Parâmetro corrigido
        ),
        // Usando Divider em vez de PopupMenuDivider.
        const Divider(),
        MenuItemButton(
          leadingIcon: const Icon(Icons.logout),
          onPressed: () async {
            await AuthApi.api.logout();
            if (context.mounted) {
              context.goNamed(Routes.login.name);
            }
          },
          child: Text(localization(context).homePopupLogoutLabel),
        ),
      ],
    );
  }
}
