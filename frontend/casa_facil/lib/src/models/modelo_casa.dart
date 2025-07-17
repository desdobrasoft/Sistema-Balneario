import 'dart:convert' show jsonEncode;

import 'package:casa_facil/src/models/material_necessario_modelo.dart';

class ModeloCasaModel {
  final int id;
  final String nome;
  final String descricao;
  final String tempoFabricacao;
  final String? urlImagem;
  final List<MaterialNecessarioModelo> materiais;
  final double preco;
  final int qtVendido;

  const ModeloCasaModel({
    required this.descricao,
    required this.id,
    this.urlImagem,
    required this.materiais,
    required this.nome,
    required this.preco,
    required this.tempoFabricacao,
    required this.qtVendido,
  });

  factory ModeloCasaModel.fromJson(Map? json) {
    Object? parser = json?[_Keys.materiais];
    final materiais = List<MaterialNecessarioModelo>.from(
      (parser as List).map((l) => MaterialNecessarioModelo.fromJson(l)),
    );

    return ModeloCasaModel(
      descricao: json?[_Keys.descricao],
      id: json?[_Keys.id],
      urlImagem: json?[_Keys.urlImagem],
      materiais: materiais,
      nome: json?[_Keys.nome],
      preco: json?[_Keys.preco],
      tempoFabricacao: json?[_Keys.tempoFabricacao],
      qtVendido: json?[_Keys.qtVendido],
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.descricao: descricao,
    _Keys.id: id,
    _Keys.urlImagem: urlImagem,
    _Keys.materiais: materiais.map((m) => m.toMap()).toList(),
    _Keys.nome: nome,
    _Keys.preco: preco,
    _Keys.tempoFabricacao: tempoFabricacao,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const nome = 'nome';
  static const descricao = 'descricao';
  static const urlImagem = 'url_imagem';
  static const materiais = 'materiais_modelo_casa';
  static const preco = 'preco';
  static const tempoFabricacao = 'tempo_fabricacao';
  static const qtVendido = 'qt_vendido';
}
