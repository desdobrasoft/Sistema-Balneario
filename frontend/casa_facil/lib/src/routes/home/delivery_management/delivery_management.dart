import 'package:casa_facil/src/api/clientes.dart';
import 'package:casa_facil/src/api/modelos_casas/modelos_casas.dart';
import 'package:casa_facil/src/api/vendas.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show gaplg, gapmd, gapxxl;
import 'package:casa_facil/src/data/mock_data.dart' show deliveries;
import 'package:casa_facil/src/models/delivery.dart';
import 'package:casa_facil/src/routes/home/delivery_management/components/table.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:casa_facil/src/utils/hint_style.dart';
import 'package:flutter/material.dart';

class DeliveryManagement extends StatefulWidget {
  const DeliveryManagement({super.key});

  @override
  State<DeliveryManagement> createState() => _DeliveryManagementState();
}

class _DeliveryManagementState extends State<DeliveryManagement> {
  final _controller = TextEditingController();
  final _notifier = ValueNotifier(false);

  final _origin = List<Delivery>.from(deliveries, growable: false);

  List<Delivery> _filteredData = [];

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final clientes = await ClientesApi.listAll();
      final modelosCasas = await ModelosCasasApi.listAll();
      final vendas = await VendasApi.listAll();

      _filteredData = _origin;
      for (var del in _filteredData) {
        var index = clientes.indexWhere(
          (customer) => customer.id == del.customerId,
        );
        if (index >= 0) {
          del.customer = clientes[index];
        }

        index = modelosCasas.indexWhere((model) => model.id == del.modelId);
        if (index >= 0) {
          del.model = modelosCasas[index];
        }

        index = vendas.indexWhere((sale) => sale.id == del.saleId);
        if (index >= 0) {
          del.sale = vendas[index];
        }
      }

      _notifier.value = !_notifier.value;
    });

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
                Expanded(
                  child: ListenableBuilder(
                    listenable: _notifier,
                    builder: (context, _) {
                      return DeliveryManagementTable(data: _filteredData);
                    },
                  ),
                ),
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
                del.customer?.nome.toLowerCase().contains(text) == true ||
                del.model?.nome.toLowerCase().contains(text) == true ||
                del.deliveryAddress.toLowerCase().contains(text) == true ||
                del.scheduledDate.toLowerCase().contains(text) ||
                del.transportCompany?.toLowerCase().contains(text) == true ||
                del.status.description.toLowerCase().contains(text),
          )
          .toList();
    });
  }
}
