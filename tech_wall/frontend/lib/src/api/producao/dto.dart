import 'package:tech_wall/src/models/status_producao.dart';

class UpdateOrdemProducaoDto {
  final StatusProducao status;
  final String? notas;
  final String? dataAgendamento;

  const UpdateOrdemProducaoDto({
    required this.status,
    this.notas,
    this.dataAgendamento,
  });

  Map<String, dynamic> toMap() => {
    'status': status.prisma.toUpperCase(),
    if (notas != null) 'notas': notas,
    if (dataAgendamento != null) 'data_agendamento': dataAgendamento,
  };
}

class CreateInternalOrderDto {
  final int modeloId;

  const CreateInternalOrderDto({required this.modeloId});

  Map<String, dynamic> toMap() => {'modeloId': modeloId};
}
