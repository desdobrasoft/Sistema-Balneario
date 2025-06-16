import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:sistema_balneario/src/api/login.dart';
import 'package:sistema_balneario/src/routes/routes.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';

enum _Options { logout }

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
          case _Options.logout:
            await AuthApi.api.logout();
            if (context.mounted) {
              context.goNamed(Routes.login.name);
            }
        }
      },
      itemBuilder: (context) => [
        PopupMenuItem(
          value: _Options.logout,
          child: Text(localization(context).homePopupLogoutLabel),
        ),
      ],
    );
  }
}
