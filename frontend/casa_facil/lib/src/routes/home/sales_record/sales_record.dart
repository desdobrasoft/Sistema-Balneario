import 'package:casa_facil/src/api/clientes.dart';
import 'package:casa_facil/src/api/modelos_casas/modelos_casas.dart';
import 'package:casa_facil/src/api/vendas.dart';
import 'package:casa_facil/src/components/app_button.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show gaplg, gapmd, gapxxl;
import 'package:casa_facil/src/models/venda.dart';
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

  List<VendaModel> _filteredData = [];
  List<VendaModel> _origin = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      _origin = await VendasApi.listAll();
      final clientes = await ClientesApi.listAll();
      final modelosCasas = await ModelosCasasApi.listAll();

      _filteredData = _origin;
      for (var sale in _filteredData) {
        sale.cliente = clientes.singleWhere(
          (customer) => customer.id == sale.clienteId,
        );
        sale.modelo = modelosCasas.singleWhere(
          (model) => model.id == sale.modeloId,
        );
      }
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
      _filteredData = _origin.where((sale) {
        return sale.modelo?.nome.toLowerCase().contains(text.toLowerCase()) ==
                true ||
            sale.cliente?.nome.toLowerCase().contains(text.toLowerCase()) ==
                true ||
            sale.dataVenda.toLowerCase().contains(text.toLowerCase()) ||
            sale.statusVenda.description.toLowerCase().contains(
              text.toLowerCase(),
            ) ||
            sale.preco.toString().toLowerCase().contains(text.toLowerCase());
      }).toList();
    });
  }
}
