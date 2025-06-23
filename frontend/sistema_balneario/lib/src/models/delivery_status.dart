enum DeliveryStatus {
  pendingCarrier(_pendingCarrierDesc),
  scheduled(_scheduledDesc),
  inTransit(_inTransitDesc),
  delivered(_deliveredDesc),
  late(_lateDesc);

  static const _pendingCarrierDesc = 'Pendente Atribuição Transportadora';
  static const _scheduledDesc = 'Coleta Agendada';
  static const _inTransitDesc = 'Em Trânsito';
  static const _deliveredDesc = 'Entregue no Cliente';
  static const _lateDesc = 'Atrasada';

  final String description;

  const DeliveryStatus(this.description);

  factory DeliveryStatus.fromDescription(String description) {
    return DeliveryStatus.values.firstWhere(
      (status) => status.description.toLowerCase() == description.toLowerCase(),
    );
  }
}
