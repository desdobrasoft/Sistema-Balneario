import 'dart:convert' show jsonEncode;

import 'package:casa_facil/src/models/customer.dart';
import 'package:casa_facil/src/models/delivery_status.dart';
import 'package:casa_facil/src/models/house_model.dart';
import 'package:casa_facil/src/models/sale.dart';

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const deliveryAddress = 'deliveryAddress';
  static const scheduledDate = 'scheduledDate';
  static const transportCompany = 'transportCompany';
  static const status = 'status';

  static const sale = 'sale';
  static const customer = 'customer';
  static const model = 'model';
}

class Delivery {
  final String id;
  final String saleId;
  final String customerId;
  final String modelId;
  final String deliveryAddress;
  final String scheduledDate;
  final String? transportCompany;
  final DeliveryStatus status;

  CustomerModel? customer;
  HouseModel? model;
  Sale? sale;

  Delivery({
    required this.id,
    required this.saleId,
    required this.customerId,
    required this.modelId,
    required this.deliveryAddress,
    required this.scheduledDate,
    this.transportCompany,
    required this.status,
  });

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.sale: sale?.toMap(),
    _Keys.customer: customer?.toMap(),
    _Keys.model: model?.toMap(),
    _Keys.deliveryAddress: deliveryAddress,
    _Keys.scheduledDate: scheduledDate,
    _Keys.transportCompany: transportCompany,
    _Keys.status: status,
  };

  @override
  String toString() => jsonEncode(toMap());
}
