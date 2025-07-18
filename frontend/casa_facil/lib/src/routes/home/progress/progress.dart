import 'package:casa_facil/src/api/clientes.dart';
import 'package:casa_facil/src/api/modelos_casas/modelos_casas.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show gaplg, gapmd, gapxxl;
import 'package:casa_facil/src/data/mock_data.dart';
import 'package:casa_facil/src/models/production_order.dart';
import 'package:casa_facil/src/routes/home/progress/components/table.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:casa_facil/src/utils/hint_style.dart';
import 'package:flutter/material.dart';

class Progress extends StatefulWidget {
  const Progress({super.key});

  @override
  State<Progress> createState() => _ProgressState();
}

class _ProgressState extends State<Progress> {
  final _controller = TextEditingController();
  final _notifier = ValueNotifier(false);

  List<ProductionOrder> _filteredData = List.from(productionOrders);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final clientes = await ClientesApi.listAll();
      final modelos = await ModelosCasasApi.listAll();

      for (var order in _filteredData) {
        order.customer = clientes.singleWhere(
          (customer) => customer.id == order.customerId,
        );
        order.model = modelos.singleWhere((model) => model.id == order.modelId);
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
          title: 'Acompanhamento de Preparo de Kits',
          subtitle:
              'Monitore e atualize o status do preparo dos kits de casas em contêineres. Aloque materiais do estoque',
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
                          labelText: 'Buscar produto',
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
                      return ProgressTable(data: _filteredData);
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
        _filteredData = productionOrders;
      });
      return;
    }
    setState(() {
      _filteredData = productionOrders
          .where(
            (order) =>
                order.model?.nome.toLowerCase().contains(text) == true ||
                order.customer?.nome.toLowerCase().contains(text) == true ||
                order.scheduledDate.toLowerCase().contains(text) ||
                order.status.description.toLowerCase().contains(text) ||
                order.notes.toLowerCase().contains(text),
          )
          .toList();
    });
  }
}
