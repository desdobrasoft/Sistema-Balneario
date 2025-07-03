enum SaleStatus {
  waitingSchedule(_waitingScheduleDesc),
  scheduled(_scheduledDesc),
  assembling(_assemblingDesc),
  alocated(_alocatedDesc),
  ready(_readyDesc),
  shipped(_shippedDesc),
  delivered(_deliveredDesc),
  waitingRestock(_waitingRestockDesc),
  canceled(_canceledDesc);

  static const _waitingScheduleDesc = 'Aguardando Agendamento de Produção';
  static const _scheduledDesc = 'Produção Agendada';
  static const _assemblingDesc = 'Kit em Preparação';
  static const _alocatedDesc = 'Materiais Alocados';
  static const _readyDesc = 'Pronto para Envio';
  static const _shippedDesc = 'Enviado';
  static const _deliveredDesc = 'Entregue';
  static const _waitingRestockDesc = 'Aguardando Reposição de Estoque';
  static const _canceledDesc = 'Cancelada';

  final String description;

  const SaleStatus(this.description);

  factory SaleStatus.fromDescription(String description) {
    return SaleStatus.values.firstWhere(
      (status) => status.description.toLowerCase() == description.toLowerCase(),
    );
  }
}
