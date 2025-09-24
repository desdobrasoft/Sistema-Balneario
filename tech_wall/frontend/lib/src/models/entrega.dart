import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/status_entrega.dart';
import 'package:tech_wall/src/models/venda.dart';

class EntregaModel {
  final int id;
  final String enderecoEntrega;
  final String previsaoEntrega;
  final String? transportadora;
  final StatusEntrega status;
  final VendaModel venda;

  const EntregaModel({
    required this.id,
    required this.enderecoEntrega,
    required this.previsaoEntrega,
    this.transportadora,
    required this.status,
    required this.venda,
  });

  factory EntregaModel.fromJson(Map<dynamic, dynamic>? json) {
    final data = json ?? {};
    return EntregaModel(
      id: data[_Keys.id] ?? 0,
      enderecoEntrega: data[_Keys.enderecoEntrega] ?? '',
      previsaoEntrega: data[_Keys.previsaoEntrega] ?? '',
      transportadora: data[_Keys.transportadora],
      status: StatusEntrega.from(data[_Keys.status]),
      venda: VendaModel.fromJson(data[_Keys.venda]),
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.enderecoEntrega: enderecoEntrega,
    _Keys.previsaoEntrega: previsaoEntrega,
    _Keys.transportadora: transportadora,
    _Keys.status: status.description,
    _Keys.venda: venda.toMap(),
  };

  @override
  String toString() => jsonEncode(toMap());
}

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const enderecoEntrega = 'endereco_entrega';
  static const previsaoEntrega = 'previsao_entrega';
  static const transportadora = 'transportadora';
  static const status = 'status';
  static const venda = 'vendas';
}
