import 'dart:convert' show jsonEncode;

import 'package:flutter_dotenv/flutter_dotenv.dart' show dotenv;

class _Keys {
  const _Keys._();

  static const backendHost = 'BACKEND_HOST';
  static const backendPort = 'BACKEND_PORT';
  static const apiAutenticacao = 'API_AUTENTICACAO';
  static const login = 'LOGIN';
  static const users = 'USERS';
}

class EnvManager {
  EnvManager._();

  static final env = EnvManager._();

  late final String backendHost;
  late final int backendPort;
  late final String apiAutenticacao;
  late final String login;
  late final String users;

  Future<void> init() async {
    await dotenv.load(fileName: '.env');

    backendHost = dotenv.get(_Keys.backendHost);
    backendPort = dotenv.getInt(_Keys.backendPort);
    apiAutenticacao = dotenv.get(_Keys.apiAutenticacao);
    login = dotenv.get(_Keys.login);
    users = dotenv.get(_Keys.users);
  }

  Map<String, Object?> toMap() => {
    _Keys.backendHost: backendHost,
    _Keys.backendPort: backendPort,
    _Keys.apiAutenticacao: apiAutenticacao,
    _Keys.login: login,
    _Keys.users: users,
  };

  @override
  String toString() => jsonEncode(toMap());
}
