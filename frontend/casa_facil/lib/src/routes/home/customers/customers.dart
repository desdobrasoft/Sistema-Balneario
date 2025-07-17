import 'package:casa_facil/src/api/clientes.dart';
import 'package:casa_facil/src/components/app_button.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/components/dialogs/add_cliente.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show gaplg, gapmd, gapxxl;
import 'package:casa_facil/src/models/cliente.dart';
import 'package:casa_facil/src/routes/home/customers/components/table.dart';
import 'package:casa_facil/src/services/dialog/dialog.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:casa_facil/src/utils/hint_style.dart';
import 'package:flutter/material.dart';

class Customers extends StatefulWidget {
  const Customers({super.key});

  @override
  State<Customers> createState() => _CustomersState();
}

class _CustomersState extends State<Customers> {
  final _controller = TextEditingController();
  final _notifier = ValueNotifier(false);

  List<Cliente> _filteredData = [];
  List<Cliente> _origin = [];

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
