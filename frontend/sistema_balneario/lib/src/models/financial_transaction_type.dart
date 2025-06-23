enum FinancialTransactionType {
  expenses(_expensesDesc),
  revenue(_revenueDesc);

  static const _expensesDesc = 'Despesa';
  static const _revenueDesc = 'Receita';

  final String description;

  const FinancialTransactionType(this.description);

  factory FinancialTransactionType.fromDescription(String description) {
    return FinancialTransactionType.values.firstWhere(
      (type) => type.description.toLowerCase() == description.toLowerCase(),
    );
  }
}
