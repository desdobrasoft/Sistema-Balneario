import 'dart:convert' show jsonEncode;

import 'package:casa_facil/src/models/customer.dart';
import 'package:casa_facil/src/models/house_model.dart';
import 'package:casa_facil/src/models/missing_stock_item_info.dart';
import 'package:casa_facil/src/models/payment_status.dart';
import 'package:casa_facil/src/models/sale_status.dart';
import 'package:casa_facil/src/models/sale_status_history_entry.dart';

class _Keys {
  const _Keys._();

  static const id = 'id';
  // static const customerId = 'customerId';
  // static const modelId = 'modelId';
  static const saleDate = 'saleDate';
  static const price = 'price';
  static const status = 'status';
  static const paymentStatus = 'paymentStatus';
  static const missingStockItems = 'missingStockItems';
  static const statusHistory = 'statusHistory';

  static const customer = 'customer';
  static const model = 'model';
}

class Sale {
  final String id;
  final String customerId;
  final String modelId;
  final String saleDate; // ISO date str 'YYYY-MM-DD'
  final double price;
  final SaleStatus status;
  final PaymentStatus? paymentStatus;
  final List<MissingStockItemInfo>? missingStockItems;
  final List<SaleStatusHistoryEntry>? statusHistory;

  CustomerModel? customer;
  HouseModel? model;

  Sale({
    required this.id,
    required this.customerId,
    required this.modelId,
    required this.saleDate,
    required this.price,
    required this.status,
    this.paymentStatus,
    this.missingStockItems,
    this.statusHistory,
  });

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.customer: customer?.toMap(),
    _Keys.model: model?.toMap(),
    _Keys.saleDate: saleDate,
    _Keys.price: price,
    _Keys.status: status,
    _Keys.paymentStatus: paymentStatus,
    _Keys.missingStockItems: missingStockItems,
    _Keys.statusHistory: statusHistory,
  };

  @override
  String toString() => jsonEncode(toMap());
}
