enum StatusVenda {
  waitingSchedule(
    'Aguardando Agendamento de Produção',
    'AGUARDANDO_AGENDAMENTO_PRODUCAO',
  ),
  scheduled('Produção Agendada', 'PRODUCAO_AGENDADA'),
  assembling('Kit em Preparação', 'KIT_EM_PREPARACAO'),
  alocated('Materiais Alocados', 'MATERIAIS_ALOCADOS'),
  ready('Pronto para Envio', 'PRONTO_PARA_ENVIO'),
  shipped('Enviado', 'ENVIADO'),
  delivered('Entregue', 'ENTREGUE'),
  waitingRestock(
    'Aguardando Reposição de Estoque',
    'AGUARDANDO_REPOSICAO_ESTOQUE',
  ),
  canceled('Cancelada', 'CANCELADA');

  final String description;
  final String prisma;

  const StatusVenda(this.description, this.prisma);

  factory StatusVenda.from(String description) {
    return StatusVenda.values.firstWhere(
      (status) =>
          status.description.toLowerCase() == description.toLowerCase() ||
          status.prisma.toLowerCase() == description.toLowerCase(),
    );
  }
}
