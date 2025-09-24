import 'dart:convert' show JsonEncoder;

import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/models/status_pedido_compra.dart';
import 'package:tech_wall/src/models/user.dart';

class PedidoCompraModel {
  final int id;
  final int qtSolicitada;
  final int? qtEntregue;
  final String? fornecedor;
  final double? valorUnitario;
  final String dataPedido;
  final StatusPedidoCompra status;
  final MaterialEstoqueModel material;
  final UserModel? solicitante;

  const PedidoCompraModel({
    required this.id,
    required this.qtSolicitada,
    this.qtEntregue,
    this.fornecedor,
    this.valorUnitario,
    required this.dataPedido,
    required this.status,
    required this.material,
    this.solicitante,
  });

  factory PedidoCompraModel.fromJson(Map<dynamic, dynamic>? json) {
    final data = json ?? {};
    return PedidoCompraModel(
      id: data[_Keys.id] ?? 0,
      qtSolicitada: data[_Keys.qtSolicitada] ?? 0,
      qtEntregue: data[_Keys.qtEntregue],
      fornecedor: data[_Keys.fornecedor],
      valorUnitario: double.tryParse(data[_Keys.valorUnitario].toString()),
      dataPedido: data[_Keys.dataPedido] ?? '',
      status: StatusPedidoCompra.from(data[_Keys.status]),
      material: MaterialEstoqueModel.fromJson(data[_Keys.material]),
      solicitante: data[_Keys.solicitante] != null
          ? UserModel.fromJson(data[_Keys.solicitante])
          : null,
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.qtSolicitada: qtSolicitada,
    if (qtEntregue != null) _Keys.qtEntregue: qtEntregue,
    if (fornecedor != null) _Keys.fornecedor: fornecedor,
    if (valorUnitario != null) _Keys.valorUnitario: valorUnitario,
    _Keys.dataPedido: dataPedido,
    _Keys.status: status.prisma,
    _Keys.material: material.toMap(),
    if (solicitante != null) _Keys.solicitante: solicitante?.toMap(),
  };

  @override
  String toString() => JsonEncoder.withIndent('  ').convert(toMap());
}

abstract class _Keys {
  const _Keys._();

  static const id = 'id';
  static const qtSolicitada = 'qt_solicitada';
  static const qtEntregue = 'qt_entregue';
  static const fornecedor = 'fornecedor';
  static const valorUnitario = 'valor_unitario';
  static const dataPedido = 'data_pedido';
  static const status = 'status';
  static const material = 'materiais_estoque';
  static const solicitante = 'users';
}
