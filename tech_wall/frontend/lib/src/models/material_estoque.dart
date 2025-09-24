import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/placa_especificacao.dart';
import 'package:tech_wall/src/models/tipo_material.dart';

class MaterialEstoqueModel {
  final String id;
  final String item;
  final int quantidade;
  final String? unidade;
  final String? observacao;
  final TipoMaterialModel? tipo;
  final int limBaixoEstoque;
  final String? ultimaEntrada;
  final String? ultimaSaida;
  final PlacaEspecificacaoModel? placaEspecificacao;

  const MaterialEstoqueModel({
    required this.id,
    required this.item,
    required this.quantidade,
    this.unidade,
    this.observacao,
    this.tipo,
    this.limBaixoEstoque = 0,
    this.ultimaEntrada,
    this.ultimaSaida,
    this.placaEspecificacao,
  });

  factory MaterialEstoqueModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      throw ArgumentError('MaterialEstoqueModel.fromJson: json cannot be null');
    }
    return MaterialEstoqueModel(
      id: json[_Keys.id],
      item: json[_Keys.item],
      quantidade: json[_Keys.quantidade],
      unidade: json[_Keys.unidade],
      observacao: json[_Keys.observacao],
      tipo: json[_Keys.tipo] != null
          ? TipoMaterialModel.fromJson(json[_Keys.tipo])
          : null,
      limBaixoEstoque: json[_Keys.limBaixoEstoque] ?? 0,
      ultimaEntrada: json[_Keys.ultimaEntrada],
      ultimaSaida: json[_Keys.ultimaSaida],
      placaEspecificacao: json[_Keys.placaEspecificacao] != null
          ? PlacaEspecificacaoModel.fromJson(json[_Keys.placaEspecificacao])
          : null,
    );
  }

  Map<String, Object?> toMap() => {
        _Keys.id: id,
        _Keys.item: item,
        _Keys.quantidade: quantidade,
        _Keys.unidade: unidade,
        _Keys.observacao: observacao,
        _Keys.tipo: tipo?.id, // Sending only the id
        _Keys.limBaixoEstoque: limBaixoEstoque,
        _Keys.ultimaEntrada: ultimaEntrada,
        _Keys.ultimaSaida: ultimaSaida,
        _Keys.placaEspecificacao: placaEspecificacao?.toString(), // Or a toMap()
      };

  @override
  String toString() => jsonEncode(toMap());

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MaterialEstoqueModel &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const item = 'item';
  static const quantidade = 'quantidade';
  static const unidade = 'unidade';
  static const observacao = 'observacao';
  static const tipo = 'tipos_materiais';
  static const limBaixoEstoque = 'lim_baixo_estoque';
  static const ultimaEntrada = 'ultima_entrada';
  static const ultimaSaida = 'ultima_saida';
  static const placaEspecificacao = 'placas_especificacoes';
}