import 'dart:convert' show jsonEncode;

import 'package:sistema_balneario/src/models/model_material_item.dart';

class _Keys {
  const _Keys._();

  static const description = 'description';
  static const id = 'id';
  static const imageUrl = 'imageUrl';
  static const materials = 'materials';
  static const name = 'name';
  static const price = 'price';
  static const productionTime = 'productionTime';
}

class HouseModel {
  final String description;
  final String id;
  final String? imageUrl;
  final List<ModelMaterialItem> materials;
  final String name;
  final double price;
  final String productionTime;

  const HouseModel({
    required this.description,
    required this.id,
    this.imageUrl,
    required this.materials,
    required this.name,
    required this.price,
    required this.productionTime,
  });

  factory HouseModel.fromJson(Map? json) {
    dynamic aux = json?[_Keys.materials];
    final materials = List<ModelMaterialItem>.from(
      (aux as List).map((l) => ModelMaterialItem.fromJson(l)),
    );

    return HouseModel(
      description: json?[_Keys.description],
      id: json?[_Keys.id],
      imageUrl: json?[_Keys.imageUrl],
      materials: materials,
      name: json?[_Keys.name],
      price: json?[_Keys.price],
      productionTime: json?[_Keys.productionTime],
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.description: description,
    _Keys.id: id,
    _Keys.imageUrl: imageUrl,
    _Keys.materials: materials,
    _Keys.name: name,
    _Keys.price: price,
    _Keys.productionTime: productionTime,
  };

  @override
  String toString() => jsonEncode(toMap());
}
