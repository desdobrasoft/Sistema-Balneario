import 'dart:convert' show jsonEncode;

class MaterialPlacaDto {
  final String materialId;
  final int quantidade;

  const MaterialPlacaDto({
    required this.materialId,
    required this.quantidade,
  });

  Map<String, dynamic> toMap() => {
        'material_id': materialId,
        'quantidade': quantidade,
      };
}

class CreatePlacaDto {
  final String nome;
  final String? descricao;
  final double? altura;
  final double? largura;
  final double? espessura;
  final String? tipoTrama;
  final List<MaterialPlacaDto>? materiais;

  const CreatePlacaDto({
    required this.nome,
    this.descricao,
    this.altura,
    this.largura,
    this.espessura,
    this.tipoTrama,
    this.materiais,
  });

  Map<String, dynamic> toMap() => {
        'nome': nome,
        if (descricao != null) 'descricao': descricao,
        if (altura != null) 'altura': altura,
        if (largura != null) 'largura': largura,
        if (espessura != null) 'espessura': espessura,
        if (tipoTrama != null) 'tipo_trama': tipoTrama,
        if (materiais != null)
          'materiais': materiais!.map((m) => m.toMap()).toList(),
      };

  @override
  String toString() => jsonEncode(toMap());
}

class UpdatePlacaDto {
  final String? nome;
  final String? descricao;
  final double? altura;
  final double? largura;
  final double? espessura;
  final String? tipoTrama;
  final List<MaterialPlacaDto>? materiais;

  const UpdatePlacaDto({
    this.nome,
    this.descricao,
    this.altura,
    this.largura,
    this.espessura,
    this.tipoTrama,
    this.materiais,
  });

  Map<String, dynamic> toMap() => {
        if (nome != null) 'nome': nome,
        if (descricao != null) 'descricao': descricao,
        if (altura != null) 'altura': altura,
        if (largura != null) 'largura': largura,
        if (espessura != null) 'espessura': espessura,
        if (tipoTrama != null) 'tipo_trama': tipoTrama,
        if (materiais != null)
          'materiais': materiais!.map((m) => m.toMap()).toList(),
      };

  @override
  String toString() => jsonEncode(toMap());
}

class GerenciarProducaoPlacaDto {
  final int? adicionarAguardando;
  final int? iniciarProducao;
  final int? finalizarProducao;

  const GerenciarProducaoPlacaDto({
    this.adicionarAguardando,
    this.iniciarProducao,
    this.finalizarProducao,
  });

  Map<String, dynamic> toMap() => {
        if (adicionarAguardando != null)
          'adicionarAguardando': adicionarAguardando,
        if (iniciarProducao != null) 'iniciarProducao': iniciarProducao,
        if (finalizarProducao != null) 'finalizarProducao': finalizarProducao,
      };

  @override
  String toString() => jsonEncode(toMap());
}

class BaixaProducaoPlacaDto {
  final int quantidade;
  const BaixaProducaoPlacaDto({required this.quantidade});
  Map<String, dynamic> toMap() => {'quantidade': quantidade};
}