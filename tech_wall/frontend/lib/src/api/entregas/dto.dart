import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/status_entrega.dart';

class UpdateEntregaDto {
  final StatusEntrega? status;
  final String? transportadora;
  final DateTime? previsaoEntrega;
  final String? notas;

  const UpdateEntregaDto({
    this.status,
    this.transportadora,
    this.previsaoEntrega,
    this.notas,
  });

  Map<String, dynamic> toMap() => {
    if (status != null) 'status': status!.prisma,
    if (transportadora != null) 'transportadora': transportadora,
    if (previsaoEntrega != null)
      'previsao_entrega': previsaoEntrega!.toIso8601String(),
    if (notas != null) 'notas': notas,
  };

  @override
  String toString() => jsonEncode(toMap());
}
