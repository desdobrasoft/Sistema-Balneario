class PlacaEspecificacaoModel {
  final int id;
  final String materialId;
  final double? altura;
  final double? largura;
  final double? espessura;
  final String? tipoTrama;

  const PlacaEspecificacaoModel({
    required this.id,
    required this.materialId,
    this.altura,
    this.largura,
    this.espessura,
    this.tipoTrama,
  });

  factory PlacaEspecificacaoModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      // Return a default or empty instance if json is null
      return PlacaEspecificacaoModel(id: 0, materialId: '');
    }
    return PlacaEspecificacaoModel(
      id: json['id'],
      materialId: json['material_id'],
      altura: json['altura'] != null ? double.tryParse(json['altura']) : null,
      largura: json['largura'] != null ? double.tryParse(json['largura']) : null,
      espessura: json['espessura'] != null ? double.tryParse(json['espessura']) : null,
      tipoTrama: json['tipo_trama'],
    );
  }
}
