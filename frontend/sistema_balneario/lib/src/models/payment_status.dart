enum PaymentStatus {
  pending(_pendingDesc),
  partially(_partiallyDesc),
  paid(_paidDesc),
  expired(_expiredDesc),
  canceled(_canceledDesc);

  static const _pendingDesc = 'Pendente';
  static const _partiallyDesc = 'Pago Parcialmente';
  static const _paidDesc = 'Pago';
  static const _expiredDesc = 'Vencido';
  static const _canceledDesc = 'Cancelado';

  final String description;

  const PaymentStatus(this.description);

  factory PaymentStatus.fromDescription(String description) {
    return PaymentStatus.values.firstWhere(
      (status) => status.description.toLowerCase() == description.toLowerCase(),
    );
  }
}
