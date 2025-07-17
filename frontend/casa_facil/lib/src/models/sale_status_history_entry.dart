import 'dart:convert' show jsonEncode;

import 'package:casa_facil/src/models/status_venda.dart';

class _Keys {
  const _Keys._();

  static const status = 'status';
  static const date = 'date';
  static const notes = 'notes';
}

class SaleStatusHistoryEntry {
  final StatusVenda status;
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
