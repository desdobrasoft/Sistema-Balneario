import 'dart:convert' show jsonEncode;

class CreateMaterialDto {
  final String id;
  final String nome;
  final int? qtEstoque;
  final int? limBaixoEstoque;

  const CreateMaterialDto({
    required this.id,
    required this.nome,
    this.qtEstoque,
    this.limBaixoEstoque,
  });

  Map<String, Object?> toMap() => {
    'id': id,
    'nome': nome,
    if (qtEstoque != null) 'qt_estoque': qtEstoque,
    if (limBaixoEstoque != null) 'lim_baixo_estoque': limBaixoEstoque,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class UpdateMaterialDto {
  final String? nome;
  final int? qtEstoque;
  final int? limBaixoEstoque;

  const UpdateMaterialDto({this.nome, this.qtEstoque, this.limBaixoEstoque});

  Map<String, Object?> toMap() => {
    if (nome?.isNotEmpty == true) 'nome': nome,
    if (qtEstoque != null) 'qt_estoque': qtEstoque,
    if (limBaixoEstoque != null) 'lim_baixo_estoque': limBaixoEstoque,
  };

  @override
  String toString() => jsonEncode(toMap());
}
