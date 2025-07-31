import 'dart:convert' show jsonEncode;

class CreateClienteDto {
  final String nome;
  final String? email;
  final String? nroContato;

  const CreateClienteDto({required this.nome, this.email, this.nroContato});

  Map<String, dynamic> toMap() => {
    'nome': nome,
    if (email != null && email!.isNotEmpty) 'email': email,
    if (nroContato != null && nroContato!.isNotEmpty) 'nro_contato': nroContato,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class UpdateClienteDto {
  final String? nome;
  final String? email;
  final String? nroContato;

  const UpdateClienteDto({this.nome, this.email, this.nroContato});

  Map<String, dynamic> toMap() => {
    if (nome != null && nome!.isNotEmpty) 'nome': nome,
    if (email != null && email!.isNotEmpty) 'email': email,
    if (nroContato != null && nroContato!.isNotEmpty) 'nro_contato': nroContato,
  };

  @override
  String toString() => jsonEncode(toMap());
}
