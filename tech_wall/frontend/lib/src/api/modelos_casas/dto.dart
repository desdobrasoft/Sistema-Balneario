import 'dart:convert' show jsonEncode;

class MaterialRequeridoDto {
  final String materialId;
  final int qtModelo;

  const MaterialRequeridoDto({
    required this.materialId,
    required this.qtModelo,
  });

  Map<String, Object?> toMap() => {
    'materialId': materialId,
    'qt_modelo': qtModelo,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class PlacaRequeridaDto {
  final int placaId;
  final int qtPlaca;

  const PlacaRequeridaDto({required this.placaId, required this.qtPlaca});

  Map<String, Object?> toMap() => {'placaId': placaId, 'qt_placa': qtPlaca};

  @override
  String toString() => jsonEncode(toMap());
}

class CreateModeloCasaDto {
  final String nome;
  final String? descricao;
  final int tempoFabricacao;
  final String? urlImagem;
  final double preco;
  final List<MaterialRequeridoDto>? materiais;
  final List<PlacaRequeridaDto>? placas;

  const CreateModeloCasaDto({
    required this.nome,
    this.descricao,
    required this.tempoFabricacao,
    this.urlImagem,
    required this.preco,
    this.materiais,
    this.placas,
  });

  Map<String, Object?> toMap() => {
    'nome': nome,
    if (descricao?.isNotEmpty == true) 'descricao': descricao,
    'tempo_fabricacao': tempoFabricacao,
    if (urlImagem?.isNotEmpty == true) 'url_imagem': urlImagem,
    'preco': preco,
    if (materiais != null)
      'materiais': materiais!.map((m) => m.toMap()).toList(),
    if (placas != null) 'placas': placas!.map((p) => p.toMap()).toList(),
  };

  @override
  String toString() => jsonEncode(toMap());
}

class UpdateModeloCasaDto {
  final String? nome;
  final String? descricao;
  final int? tempoFabricacao;
  final String? urlImagem;
  final double? preco;
  final List<MaterialRequeridoDto>? materiais;
  final List<PlacaRequeridaDto>? placas;

  const UpdateModeloCasaDto({
    this.nome,
    this.descricao,
    this.tempoFabricacao,
    this.urlImagem,
    this.preco,
    this.materiais,
    this.placas,
  });

  Map<String, Object?> toMap() => {
    if (nome?.isNotEmpty == true) 'nome': nome,
    if (descricao?.isNotEmpty == true) 'descricao': descricao,
    if (tempoFabricacao != null) 'tempo_fabricacao': tempoFabricacao,
    if (urlImagem?.isNotEmpty == true) 'url_imagem': urlImagem,
    if (preco != null) 'preco': preco,
    if (materiais != null)
      'materiais': materiais!.map((m) => m.toMap()).toList(),
    if (placas != null) 'placas': placas!.map((p) => p.toMap()).toList(),
  };

  @override
  String toString() => jsonEncode(toMap());
}
