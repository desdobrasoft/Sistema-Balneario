import 'dart:convert';

enum Routes {
  login(_loginName, _loginPath),

  home(_homeName, _homePath),
  dashboard(_dashboardName, _dashboardPath),
  customers(_customersName, _customersPath),
  houseCatalog(_houseCatalogName, _houseCatalogPath),
  salesRecord(_salesRecordName, _salesRecordPath),
  orderTracking(_orderTrackingName, _orderTrackingPath),
  deliveryManagement(_deliveryManagementName, _deliveryManagementPath),
  finance(_financeName, _financePath),
  stock(_stockName, _stockPath),

  settings(_settingsName, _settingsPath);

  static const _loginName = 'login';
  static const _homeName = 'home';
  static const _dashboardName = 'painel';
  static const _customersName = 'usuarios';
  static const _houseCatalogName = 'catalogo';
  static const _salesRecordName = 'registro-vendas';
  static const _orderTrackingName = 'rastreio-produto';
  static const _deliveryManagementName = 'gerenciamento-entrega';
  static const _financeName = 'financeiro';
  static const _stockName = 'estoque';
  static const _settingsName = 'configuracoes';

  static const _loginPath = '/$_loginName';
  static const _homePath = '/';
  static const _dashboardPath = '/$_dashboardName';
  static const _customersPath = '/$_customersName';
  static const _houseCatalogPath = '/$_houseCatalogName';
  static const _salesRecordPath = '/$_salesRecordName';
  static const _orderTrackingPath = '/$_orderTrackingName';
  static const _deliveryManagementPath = '/$_deliveryManagementName';
  static const _financePath = '/$_financeName';
  static const _stockPath = '/$_stockName';
  static const _settingsPath = '/$_settingsName';

  final String name;
  final String path;

  const Routes(this.name, this.path);

  factory Routes.fromPath(String? path) {
    switch (path) {
      case _loginPath:
        return Routes.login;
      case _homePath:
        return Routes.home;
      case _dashboardPath:
        return Routes.dashboard;
      case _customersPath:
        return Routes.customers;
      case _houseCatalogPath:
        return Routes.houseCatalog;
      case _salesRecordPath:
        return Routes.salesRecord;
      case _orderTrackingPath:
        return Routes.orderTracking;
      case _deliveryManagementPath:
        return Routes.deliveryManagement;
      case _financePath:
        return Routes.finance;
      case _stockPath:
        return Routes.stock;
      case _settingsPath:
        return Routes.settings;
      default:
        throw ArgumentError.value(path);
    }
  }

  Map<String, String> toMap() => {
    login.name: login.path,
    home.name: home.path,
    dashboard.name: dashboard.path,
    customers.name: customers.path,
    houseCatalog.name: houseCatalog.path,
    salesRecord.name: salesRecord.path,
    orderTracking.name: orderTracking.path,
    deliveryManagement.name: deliveryManagement.path,
    finance.name: finance.path,
    stock.name: stock.path,
    settings.name: settings.path,
  };

  @override
  String toString() => jsonEncode(toMap());
}
