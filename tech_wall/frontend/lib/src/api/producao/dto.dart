import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/status_producao.dart';

class UpdateOrdemProducaoDto {
  final StatusProducao status;
  final String? notas;
  final DateTime? dataAgendamento;

  const UpdateOrdemProducaoDto({
    required this.status,
    this.notas,
    this.dataAgendamento,
  });

  Map<String, dynamic> toMap() => {
    'status': status.prisma,
    if (notas?.isNotEmpty == true) 'notas': notas,
    if (dataAgendamento != null)
      'data_agendamento': dataAgendamento!.toIso8601String(),
  };

  @override
  String toString() => jsonEncode(toMap());
}
