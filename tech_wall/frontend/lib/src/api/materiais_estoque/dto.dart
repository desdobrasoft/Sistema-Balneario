import 'dart:convert' show jsonEncode;

class PlacaEspecificacaoDto {
  final double? altura;
  final double? largura;
  final double? espessura;
  final String? tipoTrama;

  const PlacaEspecificacaoDto({
    this.altura,
    this.largura,
    this.espessura,
    this.tipoTrama,
  });

  Map<String, dynamic> toMap() => {
        'altura': altura,
        'largura': largura,
        'espessura': espessura,
        'tipo_trama': tipoTrama,
      };
}

class CreateMaterialDto {
  final String id;
  final String item;
  final int? quantidade;
  final String? unidade;
  final String? observacao;
  final int tipoId;
  final int? limBaixoEstoque;
  final PlacaEspecificacaoDto? placaEspecificacao;

  const CreateMaterialDto({
    required this.id,
    required this.item,
    this.quantidade,
    this.unidade,
    this.observacao,
    required this.tipoId,
    this.limBaixoEstoque,
    this.placaEspecificacao,
  });

  Map<String, Object?> toMap() => {
        'id': id,
        'item': item,
        if (quantidade != null) 'quantidade': quantidade,
        if (unidade?.isNotEmpty == true) 'unidade': unidade,
        if (observacao?.isNotEmpty == true) 'observacao': observacao,
        'tipo_id': tipoId,
        if (limBaixoEstoque != null) 'lim_baixo_estoque': limBaixoEstoque,
        if (placaEspecificacao != null)
          'placa_especificacao': placaEspecificacao!.toMap(),
      };

  @override
  String toString() => jsonEncode(toMap());
}

class UpdateMaterialDto {
  final String? item;
  final int? quantidade;
  final String? unidade;
  final String? observacao;
  final int? tipoId;
  final int? limBaixoEstoque;
  final PlacaEspecificacaoDto? placaEspecificacao;

  const UpdateMaterialDto({
    this.item,
    this.quantidade,
    this.unidade,
    this.observacao,
    this.tipoId,
    this.limBaixoEstoque,
    this.placaEspecificacao,
  });

  Map<String, Object?> toMap() => {
        if (item?.isNotEmpty == true) 'item': item,
        if (quantidade != null) 'quantidade': quantidade,
        if (unidade?.isNotEmpty == true) 'unidade': unidade,
        if (observacao?.isNotEmpty == true) 'observacao': observacao,
        if (tipoId != null) 'tipo_id': tipoId,
        if (limBaixoEstoque != null) 'lim_baixo_estoque': limBaixoEstoque,
        if (placaEspecificacao != null)
          'placa_especificacao': placaEspecificacao!.toMap(),
      };

  @override
  String toString() => jsonEncode(toMap());
}