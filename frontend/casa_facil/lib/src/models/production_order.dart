import 'dart:convert' show jsonEncode;

import 'package:casa_facil/src/models/customer.dart';
import 'package:casa_facil/src/models/house_model.dart';

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const saleId = 'saleId';
  static const scheduledDate = 'scheduledDate';
  static const status = 'status';
  static const notes = 'notes';
  static const materialsAllocated = 'materialsAllocated';

  static const customer = 'customer';
  static const model = 'model';
}

enum ProductionOrderStatus {
  // TODO: Implementar pelo .arb.
  scheduled(_scheduledDesc),
  pending(_pendingDesc),
  preparing(_preparingDesc),
  assembled(_assembledDesc),
  ready(_readyDesc),
  waiting(_waitingDesc);

  static const _scheduledDesc = 'Agendado';
  static const _pendingDesc = 'Materiais Pendentes de Alocação';
  static const _preparingDesc = 'Preparando Materiais';
  static const _assembledDesc = 'Montando Kit no Contêiner';
  static const _readyDesc = 'Pronto para Envio';
  static const _waitingDesc = 'Em Espera';

  final String description;

  const ProductionOrderStatus(this.description);

  factory ProductionOrderStatus.fromDescription(String description) {
    return ProductionOrderStatus.values.firstWhere(
      (status) => status.description.toLowerCase() == description.toLowerCase(),
    );
  }
}

class ProductionOrder {
  final String id;
  final String saleId;
  final String modelId;
  final String customerId;
  final String scheduledDate;
  final ProductionOrderStatus status;
  final String notes;
  final bool? materialsAllocated;

  CustomerModel? customer;
  HouseModel? model;

  ProductionOrder({
    required this.id,
    required this.saleId,
    required this.modelId,
    required this.customerId,
    required this.scheduledDate,
    required this.status,
    required this.notes,
    this.materialsAllocated,
  });

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.saleId: saleId,
    _Keys.model: model?.toMap(),
    _Keys.customer: customer?.toMap(),
    _Keys.scheduledDate: scheduledDate,
    _Keys.status: status.description,
    _Keys.notes: notes,
    _Keys.materialsAllocated: materialsAllocated,
  };

  @override
  String toString() => jsonEncode(toMap());
}
