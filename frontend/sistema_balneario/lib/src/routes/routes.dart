import 'dart:convert';

enum Routes {
  login(_loginName, _loginPath),

  home(_homeName, _homePath),
  dashboard(_dashboardName, _dashboardPath),
  settings(_settingsName, _settingsPath);

  static const _loginName = 'login';
  static const _homeName = 'home';
  static const _dashboardName = 'dashboard';
  static const _settingsName = 'dashboard';

  static const _loginPath = '/$_loginName';
  static const _homePath = '/';
  static const _dashboardPath = '/$_dashboardName';
  static const _settingsPath = '/$_settingsName';

  final String name;
  final String path;

  const Routes(this.name, this.path);

  static Map<String, String> json = {
    login.name: login.path,

    home.name: home.path,
    dashboard.name: dashboard.path,
    settings.name: settings.path,
  };

  @override
  String toString() => jsonEncode(json);
}
