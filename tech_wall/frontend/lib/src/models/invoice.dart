import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/invoice_item.dart';
import 'package:tech_wall/src/models/invoice_type.dart';
import 'package:tech_wall/src/models/status_pagamento.dart';

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const invoiceNumber = 'invoiceNumber';
  static const type = 'type';
  static const issueDate = 'issueDate';
  static const dueDate = 'dueDate';
  static const customerName = 'customerName';
  static const supplierName = 'supplierName';
  static const relatedSaleId = 'relatedSaleId';
  static const relatedAccountEntryId = 'relatedAccountEntryId';
  static const items = 'items';
  static const subtotal = 'subtotal';
  static const taxes = 'taxes';
  static const totalAmount = 'totalAmount';
  static const status = 'status';
  static const notes = 'notes';
}

class Invoice {
  final String id;
  final String invoiceNumber;
  final InvoiceType type;
  final String issueDate;
  final String? dueDate;
  final String? customerName;
  final String? supplierName;
  final String? relatedSaleId;
  final String? relatedAccountEntryId;
  final List<InvoiceItem> items;
  final double subtotal;
  final double taxes;
  final double totalAmount;
  final StatusPagamento status;
  final String? notes;

  Invoice({
    required this.id,
    required this.invoiceNumber,
    required this.type,
    required this.issueDate,
    this.dueDate,
    this.customerName,
    this.supplierName,
    this.relatedSaleId,
    this.relatedAccountEntryId,
    required this.items,
    required this.subtotal,
    required this.taxes,
    required this.totalAmount,
    required this.status,
    this.notes,
  });

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.invoiceNumber: invoiceNumber,
    _Keys.type: type.description,
    _Keys.issueDate: issueDate,
    _Keys.dueDate: dueDate,
    _Keys.customerName: customerName,
    _Keys.supplierName: supplierName,
    _Keys.relatedSaleId: relatedSaleId,
    _Keys.relatedAccountEntryId: relatedAccountEntryId,
    _Keys.items: items.map((item) => item.toMap()).toList(),
    _Keys.subtotal: subtotal,
    _Keys.taxes: taxes,
    _Keys.totalAmount: totalAmount,
    _Keys.status: status.description,
    _Keys.notes: notes,
  };

  @override
  String toString() => jsonEncode(toMap());
}
