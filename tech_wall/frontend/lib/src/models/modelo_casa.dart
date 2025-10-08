import 'dart:convert' show JsonEncoder;

import 'package:tech_wall/src/models/material_necessario_modelo.dart';
import 'package:tech_wall/src/models/placas_necessarias_modelo.dart';

class ModeloCasaModel {
  final int id;
  final String nome;
  final String? descricao;
  final int tempoFabricacao;
  final String? imagemBase64;
  final double preco;
  final int qtVendido;
  final List<MaterialNecessarioModelo> materiais;
  final List<PlacasNecessariasModelo> placas;

  const ModeloCasaModel({
    required this.id,
    required this.nome,
    this.descricao,
    required this.tempoFabricacao,
    this.imagemBase64,
    required this.preco,
    required this.qtVendido,
    required this.materiais,
    required this.placas,
  });

  factory ModeloCasaModel.fromJson(Map? json) {
    Object? parser = json?[_Keys.materiais];
    final materiais = parser is List
        ? List<MaterialNecessarioModelo>.from(
            parser.map((l) => MaterialNecessarioModelo.fromJson(l)),
          )
        : List<MaterialNecessarioModelo>.empty(growable: false);

    final int id = json?[_Keys.id];
    final String nome = json?[_Keys.nome];
    final String? descricao = json?[_Keys.descricao];
    final int tempoFabricacao = json?[_Keys.tempoFabricacao];
    final String? imagemBase64 = json?[_Keys.imagemBase64];
    final double preco = double.parse('${json?[_Keys.preco]}');
    final int qtVendido = json?[_Keys.qtVendido];

    parser = json?[_Keys.placas];
    final placas = parser is List
        ? List<PlacasNecessariasModelo>.from(
            parser.map((l) => PlacasNecessariasModelo.fromJson(l)),
          )
        : List<PlacasNecessariasModelo>.empty(growable: false);

    return ModeloCasaModel(
      id: id,
      nome: nome,
      descricao: descricao,
      tempoFabricacao: tempoFabricacao,
      imagemBase64: imagemBase64,
      preco: preco,
      qtVendido: qtVendido,
      materiais: materiais,
      placas: placas,
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.descricao: descricao,
    _Keys.id: id,
    _Keys.imagemBase64: imagemBase64,
    _Keys.materiais: materiais.map((m) => m.toMap()).toList(),
    _Keys.nome: nome,
    _Keys.preco: preco,
    _Keys.tempoFabricacao: tempoFabricacao,
    _Keys.placas: placas,
  };

  @override
  String toString() => JsonEncoder.withIndent('  ').convert(toMap());

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ModeloCasaModel &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const nome = 'nome';
  static const descricao = 'descricao';
  static const imagemBase64 = 'imagem_base64';
  static const materiais = 'materiais_modelo_casa';
  static const preco = 'preco';
  static const tempoFabricacao = 'tempo_fabricacao';
  static const qtVendido = 'qt_vendido';
  static const placas = 'placas_modelo_casa';
}
