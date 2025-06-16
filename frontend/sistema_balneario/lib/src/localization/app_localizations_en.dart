// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Balneário System';

  @override
  String get loginUsernameLabel => 'User';

  @override
  String get loginUsernameHint => 'exemple@email.com';

  @override
  String get loginUsernameError => 'User is required';

  @override
  String get loginPasswordLabel => 'Password';

  @override
  String get loginPasswordHint => '••••••';

  @override
  String get loginPasswordError => 'Password is required';

  @override
  String get loginSubmitButtonLabel => 'Login';

  @override
  String get homeNavigationDashboardLabel => 'Dashboard';

  @override
  String get homeNavigationSettingsLabel => 'Settings';

  @override
  String get homePopupLogoutLabel => 'Logout';
}
