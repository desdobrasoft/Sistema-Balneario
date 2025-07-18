import 'dart:convert' show jsonEncode;

class MaterialRequeridoDto {
  final String materialId;
  final int qtModelo;

  const MaterialRequeridoDto({
    required this.materialId,
    required this.qtModelo,
  });

  toMap() => {'materialId': materialId, 'qt_modelo': qtModelo};

  @override
  String toString() => jsonEncode(toMap());
}

class CreateModeloCasaDto {
  final String nome;
  final String? descricao;
  final int tempoFabricacao;
  final String? urlImagem;
  final double preco;
  final List<MaterialRequeridoDto> materiais;

  const CreateModeloCasaDto({
    required this.nome,
    this.descricao,
    required this.tempoFabricacao,
    this.urlImagem,
    required this.preco,
    required this.materiais,
  });

  Map<String, Object?> toMap() => {
    'nome': nome,
    if (descricao?.isNotEmpty == true) 'descricao': descricao,
    'tempo_fabricacao': tempoFabricacao,
    if (urlImagem?.isNotEmpty == true) 'url_imagem': urlImagem,
    'preco': preco,
    'materiais': materiais.map((m) => m.toMap()).toList(),
  };

  @override
  String toString() => jsonEncode(toMap());
}

class EditModeloCasaDto {
  final int id;
  final String? nome;
  final String? descricao;
  final int? tempoFabricacao;
  final String? urlImagem;
  final double? preco;
  final List<MaterialRequeridoDto>? materiais;

  const EditModeloCasaDto({
    required this.id,
    this.nome,
    this.descricao,
    this.tempoFabricacao,
    this.urlImagem,
    this.preco,
    this.materiais,
  });

  Map<String, Object?> toMap([bool? noID]) => {
    if (noID == true) 'id': id,
    'nome': nome,
    if (descricao?.isNotEmpty == true) 'descricao': descricao,
    'tempo_fabricacao': tempoFabricacao,
    if (urlImagem?.isNotEmpty == true) 'url_imagem': urlImagem,
    'preco': preco,
    'materiais': materiais?.map((m) => m.toMap()).toList(),
  };

  @override
  String toString() => jsonEncode(toMap());
}
