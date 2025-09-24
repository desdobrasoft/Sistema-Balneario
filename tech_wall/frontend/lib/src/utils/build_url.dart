import 'package:tech_wall/src/services/env/env.dart';

String buildUrl([String? endpoint]) {
  final env = EnvManager.env;
  final aux = endpoint ?? '';

  final String endp;

  if (aux.isEmpty) {
    endp = '';
  } else {
    endp = aux.startsWith('/') ? aux : '/$aux';
  }

  // Se o host não estiver definido, assume um caminho relativo para o proxy Nginx.
  if (env.backendHost.isEmpty) {
    return endp;
  }

  // Caso contrário, constrói a URL completa (útil para desenvolvimento local).
  return 'http://${env.backendHost}'
      ':${env.backendPort}'
      '$endp';
}
