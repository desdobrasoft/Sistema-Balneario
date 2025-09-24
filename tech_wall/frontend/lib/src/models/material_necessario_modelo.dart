import 'package:tech_wall/src/models/material_estoque.dart';

class MaterialNecessarioModelo {
  final int qtModelo;
  final MaterialEstoqueModel material;

  const MaterialNecessarioModelo({
    required this.qtModelo,
    required this.material,
  });

  factory MaterialNecessarioModelo.fromJson(Map? json) {
    return MaterialNecessarioModelo(
      qtModelo: json?[_Keys.qtModelo],
      material: MaterialEstoqueModel.fromJson(json?[_Keys.material]),
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.qtModelo: qtModelo,
    _Keys.material: material.toMap(),
  };
}

class _Keys {
  const _Keys._();

  static const qtModelo = 'qt_modelo';
  static const material = 'materiais_estoque';
}
