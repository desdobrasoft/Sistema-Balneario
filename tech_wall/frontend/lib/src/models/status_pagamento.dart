enum StatusPagamento {
  pending('Pendente', 'PENDENTE'),
  partially('Pago Parcialmente', 'PAGO_PARCIALMENTE'),
  paid('Pago', 'PAGO'),
  expired('Vencido', 'VENCIDO'),
  canceled('Cancelado', 'CANCELADO');

  final String description;
  final String prisma;

  const StatusPagamento(this.description, this.prisma);

  factory StatusPagamento.from(String description) {
    return StatusPagamento.values.firstWhere(
      (status) =>
          status.description.toLowerCase() == description.toLowerCase() ||
          status.prisma.toLowerCase() == description.toLowerCase(),
    );
  }
}
