import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/clientes/clientes.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/components/dialogs/add_cliente.dart';
import 'package:tech_wall/src/constants/constants.dart'
    show gaplg, gapmd, gapxxl;
import 'package:tech_wall/src/models/cliente.dart';
import 'package:tech_wall/src/routes/home/clientes/components/table.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/get_localization.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class Customers extends StatefulWidget {
  const Customers({super.key});

  @override
  State<Customers> createState() => _CustomersState();
}

// TODO: Adicionar status de contrato com cliente.
class _CustomersState extends State<Customers> {
  final _controller = TextEditingController();
  final _notifier = ValueNotifier(false);

  List<ClienteModel> _filteredData = [];
  List<ClienteModel> _origin = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _genData();
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
          title: localization(context).customersCardTitle,
          subtitle: localization(context).customersCardSubtitle,
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
                          labelText: localization(context).customerFilterLabel,
                          prefixIcon: Icon(Icons.search),
                        ),
                      ),
                    ),
                    AppButton(
                      label: localization(context).customersAddButtonLabel,
                      onPressed: _addCliente,

                      icon: Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
                Expanded(
                  child: ListenableBuilder(
                    listenable: _notifier,
                    builder: (context, _) {
                      return ClientesTable(data: _filteredData);
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

  Future<void> _addCliente() async {
    await DialogService.instance.showDialog(AddCliente());
    await _genData();
    _notifier.value = !_notifier.value;
  }

  Future<void> _genData() async {
    _origin = await ClientesApi.listAll();
    _filteredData = List.from(_origin);
  }

  void _listener() {
    final text = _controller.text;
    if (text.isEmpty) {
      setState(() {
        _filteredData = _origin;
      });
      return;
    }
    setState(() {
      _filteredData = _origin
          .where(
            (customer) =>
                customer.nome.toLowerCase().contains(text.toLowerCase()) ||
                customer.email.toLowerCase().contains(text.toLowerCase()) ||
                customer.nroContato.toString().toLowerCase().contains(
                  text.toLowerCase(),
                ),
          )
          .toList();
    });
  }
}
