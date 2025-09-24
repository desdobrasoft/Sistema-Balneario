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

  return 'http://${env.backendHost}'
      ':${env.backendPort}'
      '$endp';
}
