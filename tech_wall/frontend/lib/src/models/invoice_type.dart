enum InvoiceType {
  purchase(_purchaseDesc),
  sale(_saleDesc);

  static const _purchaseDesc = 'Compra';
  static const _saleDesc = 'Venda';

  final String description;

  const InvoiceType(this.description);

  factory InvoiceType.fromDescription(String description) {
    return InvoiceType.values.firstWhere(
      (type) => type.description.toLowerCase() == description.toLowerCase(),
    );
  }
}
