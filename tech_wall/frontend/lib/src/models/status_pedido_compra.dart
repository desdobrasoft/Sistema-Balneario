enum StatusPedidoCompra {
  solicitado('Solicitado', 'SOLICITADO'),
  entregue('Entregue', 'ENTREGUE'),
  entregueComAlteracao('Entregue com alteração', 'ENTREGUE_COM_ALTERACAO'),
  resolvido('Resolvido', 'RESOLVIDO');

  final String description;
  final String prisma;

  const StatusPedidoCompra(this.description, this.prisma);

  factory StatusPedidoCompra.from(String? description) {
    return StatusPedidoCompra.values.firstWhere(
      (status) =>
          status.description.toLowerCase() == description?.toLowerCase() ||
          status.prisma.toLowerCase() == description?.toLowerCase(),
    );
  }
}
