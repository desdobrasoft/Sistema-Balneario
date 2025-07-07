import 'package:casa_facil/src/components/app_button.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show gaplg, gapmd, gapxxl;
import 'package:casa_facil/src/data/mock_data.dart'
    show sales, customers, houseModels;
import 'package:casa_facil/src/models/sale.dart';
import 'package:casa_facil/src/routes/home/sales_record/components/table.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:casa_facil/src/utils/hint_style.dart';
import 'package:flutter/material.dart';

class SalesRecord extends StatefulWidget {
  const SalesRecord({super.key});

  @override
  State<SalesRecord> createState() => _SalesRecordState();
}

class _SalesRecordState extends State<SalesRecord> {
  final _controller = TextEditingController();
  final _origin = List<Sale>.from(sales, growable: false);

  List<Sale> _filteredData = [];

  @override
  void initState() {
    super.initState();
    _filteredData = _origin;
    for (var sale in _filteredData) {
      sale.customer = customers.singleWhere(
        (customer) => customer.id == sale.customerId,
      );
      sale.model = houseModels.singleWhere((model) => model.id == sale.modelId);
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
          title: 'Vendas Recentes',
          subtitle: 'Lista de transações de vendas registradas recentemente',
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
                          labelText: 'Buscar venda',
                          prefixIcon: Icon(Icons.search),
                        ),
                      ),
                    ),
                    AppButton(
                      label: 'Registrar nova',
                      onPressed: () {},

                      icon: Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
                Expanded(child: SalesRecordTable(data: _filteredData)),
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
            (sale) =>
                sale.id.toLowerCase().contains(text) ||
                sale.model?.name.toLowerCase().contains(text) == true ||
                sale.customer?.name.toLowerCase().contains(text) == true ||
                sale.saleDate.toLowerCase().contains(text) ||
                sale.status.description.toLowerCase().contains(text) ||
                sale.price.toString().toLowerCase().contains(text),
          )
          .toList();
    });
  }
}
