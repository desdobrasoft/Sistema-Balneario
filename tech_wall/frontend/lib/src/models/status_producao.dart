enum StatusProducao {
  agendado('Agendado', 'AGENDADO'),
  materiaisPendentes('Materiais Pendentes de Alocação', 'MATERIAIS_PENDENTES'),
  preparando('Preparando Materiais', 'PREPARANDO_MATERIAIS'),
  montando('Montando Kit no Contêiner', 'MONTANDO_KIT'),
  prontoEnvio('Pronto para Envio', 'PRONTO_PARA_ENVIO'),
  emEspera('Em Espera', 'EM_ESPERA'),
  cancelado('Cancelado', 'CANCELADO');

  final String description;
  final String prisma;

  const StatusProducao(this.description, this.prisma);

  factory StatusProducao.from(String description) {
    return StatusProducao.values.firstWhere(
      (status) =>
          status.description.toLowerCase() == description.toLowerCase() ||
          status.prisma.toLowerCase() == description.toLowerCase(),
    );
  }
}
