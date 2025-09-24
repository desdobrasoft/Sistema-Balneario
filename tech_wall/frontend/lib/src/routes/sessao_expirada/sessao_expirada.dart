import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/constants/constants.dart' show gapxl;
import 'package:tech_wall/src/routes/routes.dart';

class SessaoExpirada extends StatelessWidget {
  static const double _iconSize = 80;
  static const double _maxWidth = 400;

  const SessaoExpirada({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: _maxWidth),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            spacing: gapxl,
            children: [
              Icon(
                Icons.timer_off_outlined,
                size: _iconSize,
                color: theme.colorScheme.primary,
              ),
              Text(
                'Sua sessão expirou',
                style: theme.textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              Text(
                'Por segurança, sua sessão foi finalizada por inatividade. '
                'Por favor, faça o login novamente para continuar.',
                style: theme.textTheme.bodyLarge,
                textAlign: TextAlign.center,
              ),
              AppButton(
                label: 'Voltar para o Login',
                icon: const Icon(Icons.login),
                onPressed: () {
                  context.go(Routes.login.path);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
