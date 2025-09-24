import 'dart:convert' show JsonEncoder;

class TipoMaterialModel {
  final int id;
  final String nome;

  const TipoMaterialModel({required this.id, required this.nome});

  factory TipoMaterialModel.fromJson(Map<String, dynamic> json) {
    return TipoMaterialModel(id: json['id'], nome: json['nome']);
  }

  Map<String, Object?> toMap() => {'id': id, 'nome': nome};

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TipoMaterialModel &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => JsonEncoder.withIndent('  ').convert(toMap());
}
