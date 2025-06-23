import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/components/card.dart';
import 'package:sistema_balneario/src/constants/constants.dart'
    show gaplg, gapmd, gapxxl;
import 'package:sistema_balneario/src/data/mock_data.dart'
    show customers, deliveries, houseModels, sales;
import 'package:sistema_balneario/src/models/delivery.dart';
import 'package:sistema_balneario/src/routes/home/delivery_management/components/table.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';
import 'package:sistema_balneario/src/utils/hint_style.dart';

class DeliveryManagement extends StatefulWidget {
  const DeliveryManagement({super.key});

  @override
  State<DeliveryManagement> createState() => _DeliveryManagementState();
}

class _DeliveryManagementState extends State<DeliveryManagement> {
  final _controller = TextEditingController();
  final _origin = List<Delivery>.from(deliveries, growable: false);

  List<Delivery> _filteredData = [];

  @override
  void initState() {
    super.initState();
    _filteredData = _origin;
    for (var del in _filteredData) {
      var index = customers.indexWhere(
        (customer) => customer.id == del.customerId,
      );
      if (index >= 0) {
        del.customer = customers[index];
      }

      index = houseModels.indexWhere((model) => model.id == del.modelId);
      if (index >= 0) {
        del.model = houseModels[index];
      }

      index = sales.indexWhere((sale) => sale.id == del.saleId);
      if (index >= 0) {
        del.sale = sales[index];
      }
    }
    _controller.addListener(_listener);
  }

  @override
  void dispose() {
    super.dispose();
    _controller.removeListener(_listener);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(gapxxl).copyWith(top: 0),
        child: AppCard(
          // TODO: .arb
          title: 'Gerenciamento de Entregas de Contêineres',
          subtitle:
              'Gerencie agendamentos de entrega dos kits em contêineres, atribua transporte e atualize status',
          content: Padding(
            padding: const EdgeInsets.only(top: gapmd),
            child: Column(
              mainAxisSize: MainAxisSize.max,
              children: [
                Row(
                  spacing: gaplg,
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        decoration: InputDecoration(
                          filled: true,
                          hintStyle: hintStyle(context),
                          hintText: localization(context).customerFilterHint,
                          labelText: 'Buscar entrega',
                          prefixIcon: Icon(Icons.search),
                        ),
                      ),
                    ),
                  ],
                ),
                Expanded(child: DeliveryManagementTable(data: _filteredData)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _listener() {
    final text = _controller.text.toLowerCase();
    if (text.isEmpty) {
      setState(() {
        _filteredData = _origin;
      });
      return;
    }
    setState(() {
      _filteredData = _origin
          .where(
            (del) =>
                del.id.toLowerCase().contains(text) ||
                del.saleId.toLowerCase().contains(text) ||
                del.customer?.name.toLowerCase().contains(text) == true ||
                del.model?.name.toLowerCase().contains(text) == true ||
                del.deliveryAddress.toLowerCase().contains(text) == true ||
                del.scheduledDate.toLowerCase().contains(text) ||
                del.transportCompany?.toLowerCase().contains(text) == true ||
                del.status.description.toLowerCase().contains(text),
          )
          .toList();
    });
  }
}
