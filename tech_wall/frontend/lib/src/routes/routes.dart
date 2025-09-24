import 'dart:convert';

enum Routes {
  login(_loginName, _loginPath),
  sessaoExpirada(_sessaoExpiradaName, _sessaoExpiradaPath),
  home(_homeName, _homePath),
  dashboard(_dashboardName, _dashboardPath),
  usuarios(_usuariosName, _usuariosPath),
  clientes(_clientesName, _clientesPath),
  modelos(_modelosName, _modelosPath),
  vendas(_vendasName, _vendasPath),
  producao(_producaoName, _producaoPath),
  entregas(_entregasName, _entregasPath),
  financeiro(_financeiroName, _financeiroPath),
  estoque(_estoqueName, _estoquePath);

  static const _loginName = 'login';
  static const _sessaoExpiradaName = 'sessao-expirada';
  static const _homeName = 'home';
  static const _dashboardName = 'painel';
  static const _usuariosName = 'usuarios';
  static const _clientesName = 'clientes';
  static const _modelosName = 'catalogo';
  static const _vendasName = 'registro-vendas';
  static const _producaoName = 'progresso-montagem';
  static const _entregasName = 'gerenciamento-entrega';
  static const _financeiroName = 'financeiro';
  static const _estoqueName = 'estoque';

  static const _loginPath = '/$_loginName';
  static const _sessaoExpiradaPath = '/$_sessaoExpiradaName';
  static const _homePath = '/';
  static const _dashboardPath = '/$_dashboardName';
  static const _usuariosPath = '/$_usuariosName';
  static const _clientesPath = '/$_clientesName';
  static const _modelosPath = '/$_modelosName';
  static const _vendasPath = '/$_vendasName';
  static const _producaoPath = '/$_producaoName';
  static const _entregasPath = '/$_entregasName';
  static const _financeiroPath = '/$_financeiroName';
  static const _estoquePath = '/$_estoqueName';

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
