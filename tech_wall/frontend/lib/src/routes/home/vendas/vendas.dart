import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/vendas/vendas.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/components/dialogs/vendas/add_venda.dart';
import 'package:tech_wall/src/constants/constants.dart'
    show gaplg, gapmd, gapxxl;
import 'package:tech_wall/src/models/venda.dart';
import 'package:tech_wall/src/routes/home/vendas/components/table.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

// TODO: Multiplicador de vendas.
// TODO: Data de vencimento no registro de venda.
class SalesRecord extends StatefulWidget {
  const SalesRecord({super.key});

  @override
  State<SalesRecord> createState() => _SalesRecordState();
}

class _SalesRecordState extends State<SalesRecord> {
  final _controller = TextEditingController();
  final _notifier = ValueNotifier(false);

  List<VendaModel> _origin = [];
  List<VendaModel> _filteredData = [];

  @override
  void initState() {
    super.initState();
    _controller.addListener(_listener);
    WidgetsBinding.instance.addPostFrameCallback((_) => _reloadData());
  }

  @override
  void dispose() {
    _controller.removeListener(_listener);
    _notifier.dispose();
    super.dispose();
  }

  Future<void> _reloadData() async {
    // Agora fazemos apenas UMA chamada de API. O backend já inclui os dados do cliente e modelo.
    _origin = await VendasApi.listAll();
    _listener(); // Aplica o filtro atual aos novos dados
    _notifier.value = !_notifier.value;
  }

  void _listener() {
    final text = _controller.text.toLowerCase();
    setState(() {
      if (text.isEmpty) {
        _filteredData = List.from(_origin);
      } else {
        _filteredData = _origin.where((sale) {
          final clienteNome = sale.cliente?.nome.toLowerCase() ?? '';
          final modeloNome = sale.modelo?.nome.toLowerCase() ?? '';
          final statusVenda = sale.statusVenda.description.toLowerCase();

          return clienteNome.contains(text) ||
              modeloNome.contains(text) ||
              statusVenda.contains(text);
        }).toList();
      }
    });
  }

  Future<void> _addVenda() async {
    final success = await DialogService.instance.showDialog(
      const AddVendaDialog(),
    );
    if (success == true) {
      _reloadData();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(gapxxl).copyWith(top: 0),
        child: AppCard(
          title: 'Registro de Vendas',
          subtitle: 'Visualize e gerencie todas as transações de vendas',
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
                          hintText: 'Buscar por cliente, modelo ou status...',
                          labelText: 'Buscar venda',
                          prefixIcon: const Icon(Icons.search),
                        ),
                      ),
                    ),
                    AppButton(
                      label: 'Registrar Venda',
                      onPressed: _addVenda,
                      icon: const Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
                Expanded(
                  child: ListenableBuilder(
                    listenable: _notifier,
                    builder: (context, _) {
                      return SalesRecordTable(
                        data: _filteredData,
                        onDataChange: _reloadData,
                      );
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
}
