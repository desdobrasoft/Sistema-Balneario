import 'package:tech_wall/src/models/materiais_estoque.dart';

class MaterialNecessarioModelo {
  final int qtModelo;
  final MateriaisEstoqueModel material;

  const MaterialNecessarioModelo({
    required this.qtModelo,
    required this.material,
  });

  factory MaterialNecessarioModelo.fromJson(Map? json) {
    return MaterialNecessarioModelo(
      qtModelo: json?[_Keys.qtModelo],
      material: MateriaisEstoqueModel.fromJson(json?[_Keys.material]),
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
