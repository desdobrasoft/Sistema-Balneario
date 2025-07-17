import 'dart:convert' show jsonEncode;

class Cliente {
  final int id;
  final String nome;
  final String email;
  final String nroContato;
  final int historicoVendas;

  const Cliente({
    required this.id,
    required this.nome,
    required this.email,
    required this.nroContato,
    required this.historicoVendas,
  });

  Cliente.fromJson(Map? json)
    : id = json?[_Keys.id],
      nome = json?[_Keys.nome],
      email = json?[_Keys.email],
      nroContato = json?[_Keys.nroContato],
      historicoVendas = json?[_Keys.historicoVendas];

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.nome: nome,
    _Keys.email: email,
    _Keys.nroContato: nroContato,
    _Keys.historicoVendas: historicoVendas,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const nome = 'nome';
  static const email = 'email';
  static const nroContato = 'nro_contato';
  static const historicoVendas = 'historico_vendas';
}
