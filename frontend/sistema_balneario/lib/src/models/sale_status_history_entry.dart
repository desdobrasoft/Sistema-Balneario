import 'dart:convert' show jsonEncode;

import 'package:sistema_balneario/src/models/sale_status.dart';

class _Keys {
  const _Keys._();

  static const status = 'status';
  static const date = 'date';
  static const notes = 'notes';
}

class SaleStatusHistoryEntry {
  final SaleStatus status;
  final String date;
  final String? notes;

  const SaleStatusHistoryEntry({
    required this.status,
    required this.date,
    this.notes,
  });

  Map<String, Object?> toMap() => {
    _Keys.status: status,
    _Keys.date: date,
    _Keys.notes: notes,
  };

  @override
  String toString() => jsonEncode(toMap());
}
