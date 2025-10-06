import 'package:tech_wall/src/models/material_estoque.dart';

class MaterialPlaca {
  final String materialId;
  final int quantidade;
  final MaterialEstoqueModel? material;

  MaterialPlaca({
    required this.materialId,
    required this.quantidade,
    this.material,
  });

  factory MaterialPlaca.fromJson(Map<String, dynamic> json) {
    return MaterialPlaca(
      materialId: json['material_id'],
      quantidade: json['quantidade'],
      material: json['materiais_estoque'] != null
          ? MaterialEstoqueModel.fromJson(json['materiais_estoque'])
          : null,
    );
  }
}
