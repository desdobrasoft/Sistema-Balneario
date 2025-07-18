import 'dart:convert' show jsonEncode;

import 'package:flutter_dotenv/flutter_dotenv.dart' show dotenv;

class _Keys {
  const _Keys._();

  static const backendHost = 'BACKEND_HOST';
  static const backendPort = 'BACKEND_PORT';
  static const apiAutenticacao = 'API_AUTENTICACAO';
  static const login = 'LOGIN';
  static const clientes = 'CLIENTES';
  static const materiais = 'MATERIAIS';
  static const modeloCasa = 'MODELO_CASA';
  static const users = 'USERS';
  static const vendas = 'VENDAS';
  static const currentUser = 'CURRENT_USER';
}

class EnvManager {
  EnvManager._();

  static final env = EnvManager._();

  late final String backendHost;
  late final int backendPort;
  late final String apiAutenticacao;
  late final String login;
  late final String materiais;
  late final String modeloCasa;
  late final String clientes;
  late final String users;
  late final String vendas;
  late final String currentUser;

  Future<void> init() async {
    await dotenv.load(fileName: '.env');

    backendHost = dotenv.get(_Keys.backendHost);
    backendPort = dotenv.getInt(_Keys.backendPort);
    apiAutenticacao = dotenv.get(_Keys.apiAutenticacao);
    login = dotenv.get(_Keys.login);
    clientes = dotenv.get(_Keys.clientes);
    materiais = dotenv.get(_Keys.materiais);
    modeloCasa = dotenv.get(_Keys.modeloCasa);
    users = dotenv.get(_Keys.users);
    vendas = dotenv.get(_Keys.vendas);
    currentUser = dotenv.get(_Keys.currentUser);
  }

  Map<String, Object?> toMap() => {
    _Keys.backendHost: backendHost,
    _Keys.backendPort: backendPort,
    _Keys.apiAutenticacao: apiAutenticacao,
    _Keys.login: login,
    _Keys.clientes: clientes,
    _Keys.materiais: materiais,
    _Keys.modeloCasa: modeloCasa,
    _Keys.users: users,
    _Keys.currentUser: currentUser,
  };

  @override
  String toString() => jsonEncode(toMap());
}
