enum StatusVenda {
  waitingSchedule('Aguardando Agendamento de Produção'),
  scheduled('Produção Agendada'),
  assembling('Kit em Preparação'),
  alocated('Materiais Alocados'),
  ready('PrPronto para Envio'),
  shipped('Enviado'),
  delivered('Entregue'),
  waitingRestock('Aguardando Reposição de Estoque'),
  canceled('Cancelada');

  final String description;

  const StatusVenda(this.description);

  factory StatusVenda.from(String description) {
    return StatusVenda.values.firstWhere(
      (status) => status.description.toLowerCase() == description.toLowerCase(),
    );
  }
}
