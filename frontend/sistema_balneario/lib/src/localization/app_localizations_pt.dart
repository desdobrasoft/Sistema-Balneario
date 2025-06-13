// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Portuguese (`pt`).
class AppLocalizationsPt extends AppLocalizations {
  AppLocalizationsPt([String locale = 'pt']) : super(locale);

  @override
  String get appTitle => 'Sistema Balneário';

  @override
  String get loginUsernameLabel => 'Usuário';

  @override
  String get loginUsernameHint => 'exemplo@email.com';

  @override
  String get loginPasswordLabel => 'Senha';

  @override
  String get loginPasswordHint => '••••••';

  @override
  String get loginSubmitButtonLabel => 'Login';
}

/// The translations for Portuguese, as used in Brazil (`pt_BR`).
class AppLocalizationsPtBr extends AppLocalizationsPt {
  AppLocalizationsPtBr() : super('pt_BR');

  @override
  String get appTitle => 'Sistema Balneário';

  @override
  String get loginUsernameLabel => 'Usuário';

  @override
  String get loginUsernameHint => 'exemplo@email.com';

  @override
  String get loginPasswordLabel => 'Senha';

  @override
  String get loginPasswordHint => '••••••';

  @override
  String get loginSubmitButtonLabel => 'Login';
}
