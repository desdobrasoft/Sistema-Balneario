import 'dart:convert' show JsonEncoder;

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
  String toString() => JsonEncoder.withIndent('  ').convert(toMap());
}

class PlacaRequeridaDto {
  final int placaId;
  final int qtPlaca;

  const PlacaRequeridaDto({required this.placaId, required this.qtPlaca});

  Map<String, Object?> toMap() => {'placaId': placaId, 'qt_placa': qtPlaca};

  @override
  String toString() => JsonEncoder.withIndent('  ').convert(toMap());
}

class CreateModeloCasaDto {
  final String nome;
  final String? descricao;
  final int tempoFabricacao;
  final String? imagemBase64;
  final double preco;
  final List<MaterialRequeridoDto>? materiais;
  final List<PlacaRequeridaDto>? placas;

  const CreateModeloCasaDto({
    required this.nome,
    this.descricao,
    required this.tempoFabricacao,
    this.imagemBase64,
    required this.preco,
    this.materiais,
    this.placas,
  });

  Map<String, Object?> toMap() => {
    'nome': nome,
    if (descricao?.isNotEmpty == true) 'descricao': descricao,
    if (imagemBase64?.isNotEmpty == true) 'imagem_base64': imagemBase64,
    'preco': preco,
    if (materiais != null)
      'materiais': materiais!.map((m) => m.toMap()).toList(),
    if (placas != null) 'placas': placas!.map((p) => p.toMap()).toList(),
  };

  @override
  String toString() => JsonEncoder.withIndent('  ').convert(toMap());
}

class UpdateModeloCasaDto {
  final String? nome;
  final String? descricao;
  final int? tempoFabricacao;
  final String? imagemBase64;
  final double? preco;
  final List<MaterialRequeridoDto>? materiais;
  final List<PlacaRequeridaDto>? placas;

  const UpdateModeloCasaDto({
    this.nome,
    this.descricao,
    this.tempoFabricacao,
    this.imagemBase64,
    this.preco,
    this.materiais,
    this.placas,
  });

  Map<String, Object?> toMap() => {
    if (nome?.isNotEmpty == true) 'nome': nome,
    if (descricao?.isNotEmpty == true) 'descricao': descricao,
    if (tempoFabricacao != null) 'tempo_fabricacao': tempoFabricacao,
    if (imagemBase64?.isNotEmpty == true) 'imagem_base64': imagemBase64,
    if (preco != null) 'preco': preco,
    if (materiais != null)
      'materiais': materiais!.map((m) => m.toMap()).toList(),
    if (placas != null) 'placas': placas!.map((p) => p.toMap()).toList(),
  };

  @override
  String toString() => JsonEncoder.withIndent('  ').convert(toMap());
}
