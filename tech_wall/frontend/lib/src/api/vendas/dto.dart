import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/status_pagamento.dart';
import 'package:tech_wall/src/models/status_venda.dart';

/// DTO para criar um novo registro de venda.
class CreateVendaDto {
  final int clienteId;
  final int modeloId;
  final DateTime dataVenda;
  final double preco;
  final String enderecoEntrega;

  const CreateVendaDto({
    required this.clienteId,
    required this.modeloId,
    required this.dataVenda,
    required this.preco,
    required this.enderecoEntrega,
  });

  Map<String, dynamic> toMap() => {
    'clienteId': clienteId,
    'modeloId': modeloId,
    'data_venda': dataVenda.toIso8601String(),
    'preco': preco,
    'endereco_entrega': enderecoEntrega,
  };

  @override
  String toString() => jsonEncode(toMap());
}

/// DTO para atualizar o status de uma venda existente.
class UpdateVendaDto {
  final StatusVenda? status;
  final StatusPagamento? statusPagamento;

  const UpdateVendaDto({this.status, this.statusPagamento});

  Map<String, dynamic> toMap() => {
    if (status != null) 'status': status!.prisma,
    if (statusPagamento != null) 'status_pagamento': statusPagamento!.prisma,
  };

  @override
  String toString() => jsonEncode(toMap());
}
