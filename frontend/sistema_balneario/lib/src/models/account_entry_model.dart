import 'dart:convert' show jsonEncode;

import 'package:sistema_balneario/src/models/financial_transaction_type.dart';
import 'package:sistema_balneario/src/models/payment_status.dart';
import 'package:sistema_balneario/src/models/sale.dart';

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const description = 'description';
  static const type = 'type';
  static const amount = 'amount';
  static const dueDate = 'dueDate';
  static const paymentDate = 'paymentDate';
  static const status = 'status';
  static const relatedSaleId = 'relatedSaleId';
  static const relatedPurchaseOrderId = 'relatedPurchaseOrderId';
  static const notes = 'notes';
}

class AccountEntryModel {
  final String id;
  final String description;
  final FinancialTransactionType type;
  final double amount;
  final String dueDate;
  final String? paymentDate;
  final PaymentStatus status;
  final String? relatedSaleId;
  final String? relatedPurchaseOrderId;
  final String? notes;

  Sale? sale;

  AccountEntryModel({
    required this.id,
    required this.description,
    required this.type,
    required this.amount,
    required this.dueDate,
    this.paymentDate,
    required this.status,
    this.relatedSaleId,
    this.relatedPurchaseOrderId,
    this.notes,
  });

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.description: description,
    _Keys.type: type.description,
    _Keys.amount: amount,
    _Keys.dueDate: dueDate,
    _Keys.paymentDate: paymentDate,
    _Keys.status: status.description,
    _Keys.relatedSaleId: relatedSaleId,
    _Keys.relatedPurchaseOrderId: relatedPurchaseOrderId,
    _Keys.notes: notes,
  };

  @override
  String toString() => jsonEncode(toMap());
}
