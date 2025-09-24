import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/entregas/entregas.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/entrega.dart';
import 'package:tech_wall/src/routes/home/entregas/components/table.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class Entregas extends StatefulWidget {
  const Entregas({super.key});

  @override
  State<Entregas> createState() => _EntregasState();
}

class _EntregasState extends State<Entregas> {
  final _controller = TextEditingController();
  final _notifier = ValueNotifier(false);

  List<EntregaModel> _origin = [];
  List<EntregaModel> _filteredData = [];

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
    _origin = await EntregasApi.listAll();
    _listener();
    _notifier.value = !_notifier.value;
  }

  void _listener() {
    final text = _controller.text.toLowerCase();
    setState(() {
      if (text.isEmpty) {
        _filteredData = List.from(_origin);
      } else {
        _filteredData = _origin.where((entrega) {
          final cliente = entrega.venda.cliente?.nome.toLowerCase() ?? '';
          final modelo = entrega.venda.modelo?.nome.toLowerCase() ?? '';
          final status = entrega.status.description.toLowerCase();
          final transportadora = entrega.transportadora?.toLowerCase() ?? '';
          return cliente.contains(text) ||
              modelo.contains(text) ||
              status.contains(text) ||
              transportadora.contains(text);
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(gapxxl).copyWith(top: 0),
        child: AppCard(
          title: 'Gerenciamento de Entregas',
          subtitle:
              'Acompanhe e atualize o status das entregas para seus clientes',
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
                          hintText: 'Buscar por cliente, modelo, status...',
                          labelText: 'Buscar entrega',
                          prefixIcon: const Icon(Icons.search),
                        ),
                      ),
                    ),
                  ],
                ),
                Expanded(
                  child: ListenableBuilder(
                    listenable: _notifier,
                    builder: (context, _) {
                      return EntregasTable(
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
