import 'package:tech_wall/src/models/material_estoque.dart';

class VendaItemOverride {
  final int id;
  final int vendaId;
  final String materialId;
  final int qtFinal;
  final MaterialEstoqueModel material;

  VendaItemOverride({
    required this.id,
    required this.vendaId,
    required this.materialId,
    required this.qtFinal,
    required this.material,
  });

  factory VendaItemOverride.fromJson(Map<String, dynamic> json) {
    return VendaItemOverride(
      id: json['id'],
      vendaId: json['venda_id'],
      materialId: json['material_id'],
      qtFinal: json['qt_final'],
      material: MaterialEstoqueModel.fromJson(json['material']),
    );
  }
}
