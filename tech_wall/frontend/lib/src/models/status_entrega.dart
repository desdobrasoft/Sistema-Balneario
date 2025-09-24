enum StatusEntrega {
  agendado('Pendente Contrato de Transportadora', 'PENDENTE_TRANSPORTADORA'),
  materiaisPendentes('Coleta Agendada', 'COLETA_AGENDADA'),
  preparando('Em Trânsito', 'EM_TRANSITO'),
  montando('Entregue', 'ENTREGUE'),
  emEspera('Atrasada', 'ATRASADA'),
  cancelada('Cancelada', 'CANCELADA');

  final String description;
  final String prisma;

  const StatusEntrega(this.description, this.prisma);

  factory StatusEntrega.from(String description) {
    return StatusEntrega.values.firstWhere(
      (status) =>
          status.description.toLowerCase() == description.toLowerCase() ||
          status.prisma.toLowerCase() == description.toLowerCase(),
    );
  }
}
