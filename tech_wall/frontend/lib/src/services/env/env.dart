import 'dart:convert' show JsonEncoder;

class EnvManager {
  EnvManager._();

  static final env = EnvManager._();

  final String backendHost = String.fromEnvironment(_Keys.backendHost);
  final int backendPort = int.fromEnvironment(_Keys.backendPort);
  final String auth = String.fromEnvironment(_Keys.auth);
  final String login = String.fromEnvironment(_Keys.login);
  final String logout = String.fromEnvironment(_Keys.logout);
  final String refresh = String.fromEnvironment(_Keys.refresh);
  final String materiais = String.fromEnvironment(_Keys.materiais);
  final String modeloCasa = String.fromEnvironment(_Keys.modeloCasa);
  final String movimentacoesMateriais = String.fromEnvironment(
    _Keys.movimentacoesMateriais,
  );
  final String clientes = String.fromEnvironment(_Keys.clientes);
  final String users = String.fromEnvironment(_Keys.users);
  final String vendas = String.fromEnvironment(_Keys.vendas);
  final String currentUser = String.fromEnvironment(_Keys.currentUser);
  final String financeiro = String.fromEnvironment(_Keys.financeiro);
  final String lancamentos = String.fromEnvironment(_Keys.lancamentos);
  final String producao = String.fromEnvironment(_Keys.producao);
  final String entregas = String.fromEnvironment(_Keys.entregas);
  final String pedidosCompra = String.fromEnvironment(_Keys.pedidosCompra);
  final String compraReceber = String.fromEnvironment(_Keys.compraReceber);
  final String compraResolver = String.fromEnvironment(_Keys.compraResolver);

  Map<String, Object?> toMap() => {
    _Keys.backendHost: backendHost,
    _Keys.backendPort: backendPort,
    _Keys.auth: auth,
    _Keys.login: login,
    _Keys.logout: logout,
    _Keys.refresh: refresh,
    _Keys.clientes: clientes,
    _Keys.materiais: materiais,
    _Keys.modeloCasa: modeloCasa,
    _Keys.movimentacoesMateriais: movimentacoesMateriais,
    _Keys.users: users,
    _Keys.currentUser: currentUser,
    _Keys.financeiro: financeiro,
    _Keys.lancamentos: lancamentos,
    _Keys.producao: producao,
    _Keys.entregas: entregas,
    _Keys.pedidosCompra: pedidosCompra,
    _Keys.compraReceber: compraReceber,
    _Keys.compraResolver: compraResolver,
  };

  @override
  String toString() => JsonEncoder.withIndent('  ').convert(toMap());
}

abstract class _Keys {
  const _Keys._();

  static const backendHost = 'BACKEND_HOST';
  static const backendPort = 'BACKEND_PORT';
  static const auth = 'AUTH';
  static const login = 'LOGIN';
  static const logout = 'LOGOUT';
  static const refresh = 'REFRESH';
  static const clientes = 'CLIENTES';
  static const materiais = 'MATERIAIS';
  static const modeloCasa = 'MODELO_CASA';
  static const movimentacoesMateriais = 'MOVIMENTACOES_MATERIAIS';
  static const users = 'USERS';
  static const vendas = 'VENDAS';
  static const currentUser = 'CURRENT_USER';
  static const financeiro = 'FINANCEIRO';
  static const lancamentos = 'LANCAMENTOS';
  static const producao = 'PRODUCAO';
  static const entregas = 'ENTREGAS';
  static const pedidosCompra = 'PEDIDOS_COMPRA';
  static const compraReceber = 'COMPRA_RECEBER';
  static const compraResolver = 'COMPRA_RESOLVER';
}
