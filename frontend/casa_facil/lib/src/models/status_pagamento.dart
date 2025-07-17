enum StatusPagamento {
  pending('Pendente'),
  partially('Pago Parcialmente'),
  paid('Pago'),
  expired('Vencido'),
  canceled('Cancelado');

  final String description;

  const StatusPagamento(this.description);

  factory StatusPagamento.from(String description) {
    return StatusPagamento.values.firstWhere(
      (status) => status.description.toLowerCase() == description.toLowerCase(),
    );
  }
}
