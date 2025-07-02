import 'dart:convert';

enum Routes {
  login(_loginName, _loginPath),

  home(_homeName, _homePath),
  dashboard(_dashboardName, _dashboardPath),
  users(_usersName, _usersPath),
  customers(_customersName, _customersPath),
  houseCatalog(_houseCatalogName, _houseCatalogPath),
  salesRecord(_salesRecordName, _salesRecordPath),
  progress(_progressName, _progressPath),
  deliveryManagement(_deliveryManagementName, _deliveryManagementPath),
  finance(_financeName, _financePath),
  stock(_stockName, _stockPath),

  settings(_settingsName, _settingsPath);

  static const _loginName = 'login';
  static const _homeName = 'home';
  static const _dashboardName = 'painel';
  static const _usersName = 'usuarios';
  static const _customersName = 'clientes';
  static const _houseCatalogName = 'catalogo';
  static const _salesRecordName = 'registro-vendas';
  static const _progressName = 'progresso-montagem';
  static const _deliveryManagementName = 'gerenciamento-entrega';
  static const _financeName = 'financeiro';
  static const _stockName = 'estoque';
  static const _settingsName = 'configuracoes';

  static const _loginPath = '/$_loginName';
  static const _homePath = '/';
  static const _dashboardPath = '/$_dashboardName';
  static const _usersPath = '/$_usersName';
  static const _customersPath = '/$_customersName';
  static const _houseCatalogPath = '/$_houseCatalogName';
  static const _salesRecordPath = '/$_salesRecordName';
  static const _progressPath = '/$_progressName';
  static const _deliveryManagementPath = '/$_deliveryManagementName';
  static const _financePath = '/$_financeName';
  static const _stockPath = '/$_stockName';
  static const _settingsPath = '/$_settingsName';

  final String name;
  final String path;

  const Routes(this.name, this.path);

  factory Routes.fromPath(String? path) {
    return Routes.values.firstWhere(
      (route) => route.path.toLowerCase() == path?.toLowerCase(),
    );
  }

  static Map<String, String> toMap() => {
    for (var r in Routes.values) r.name: r.path,
  };

  @override
  String toString() => jsonEncode(toMap());
}
