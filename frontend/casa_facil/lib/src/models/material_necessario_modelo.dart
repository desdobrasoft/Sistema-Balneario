import 'package:casa_facil/src/models/materiais_estoque.dart';

class MaterialNecessarioModelo {
  final int qtModelo;
  final MateriaisEstoque material;

  const MaterialNecessarioModelo({
    required this.qtModelo,
    required this.material,
  });

  factory MaterialNecessarioModelo.fromJson(Map? json) {
    return MaterialNecessarioModelo(
      qtModelo: json?[_Keys.qtModelo],
      material: MateriaisEstoque.fromJson(json?[_Keys.material]),
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
