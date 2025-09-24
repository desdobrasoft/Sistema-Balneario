import 'dart:convert' show JsonEncoder;

import 'package:flutter_dotenv/flutter_dotenv.dart' show dotenv;

class EnvManager {
  EnvManager._();

  static final env = EnvManager._();

  late final String? backendHost;
  late final int? backendPort;
  late final String auth;
  late final String login;
  late final String logout;
  late final String refresh;
  late final String materiais;
  late final String modeloCasa;
  late final String movimentacoesMateriais;
  late final String clientes;
  late final String users;
  late final String vendas;
  late final String currentUser;
  late final String financeiro;
  late final String lancamentos;
  late final String producao;
  late final String entregas;
  late final String pedidosCompra;
  late final String compraReceber;
  late final String compraResolver;
  late final String tiposMateriais;
  late final String dashboard;
  late final String stats;
  late final String tempoMedio;
  late final String analiseEntrega;

  Future<void> init() async {
    await dotenv.load(fileName: '.env');

    backendHost = dotenv.maybeGet(_Keys.backendHost);
    backendPort = int.tryParse('${dotenv.maybeGet(_Keys.backendPort)}');
    auth = dotenv.get(_Keys.auth);
    login = dotenv.get(_Keys.login);
    logout = dotenv.get(_Keys.logout);
    refresh = dotenv.get(_Keys.refresh);
    clientes = dotenv.get(_Keys.clientes);
    materiais = dotenv.get(_Keys.materiais);
    modeloCasa = dotenv.get(_Keys.modeloCasa);
    movimentacoesMateriais = dotenv.get(_Keys.movimentacoesMateriais);
    users = dotenv.get(_Keys.users);
    vendas = dotenv.get(_Keys.vendas);
    currentUser = dotenv.get(_Keys.currentUser);
    financeiro = dotenv.get(_Keys.financeiro);
    lancamentos = dotenv.get(_Keys.lancamentos);
    producao = dotenv.get(_Keys.producao);
    entregas = dotenv.get(_Keys.entregas);
    pedidosCompra = dotenv.get(_Keys.pedidosCompra);
    compraReceber = dotenv.get(_Keys.compraReceber);
    compraResolver = dotenv.get(_Keys.compraResolver);
    tiposMateriais = dotenv.get(_Keys.tiposMateriais);
    dashboard = dotenv.get(_Keys.dashboard);
    stats = dotenv.get(_Keys.stats);
    tempoMedio = dotenv.get(_Keys.tempoMedio);
    analiseEntrega = dotenv.get(_Keys.analiseEntrega);
  }

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
    _Keys.tiposMateriais: tiposMateriais,
    _Keys.dashboard: dashboard,
    _Keys.stats: stats,
    _Keys.tempoMedio: tempoMedio,
    _Keys.analiseEntrega: analiseEntrega,
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
  static const tiposMateriais = 'TIPOS_MATERIAIS';
  static const dashboard = 'DASHBOARD';
  static const stats = 'STATS';
  static const tempoMedio = 'TEMPO_MEDIO';
  static const analiseEntrega = 'ANALISE_ENTREGA';
}
