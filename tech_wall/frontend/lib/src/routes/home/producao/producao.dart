import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/producao/producao.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/ordem_producao.dart';
import 'package:tech_wall/src/routes/home/producao/components/producao_table.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class Producao extends StatefulWidget {
  const Producao({super.key});

  @override
  State<Producao> createState() => _ProducaoState();
}

// TODO: Impedir alteração de status de kits sem materiais.
class _ProducaoState extends State<Producao> {
  final _controller = TextEditingController();
  final _notifier = ValueNotifier(false);

  List<OrdemProducaoModel> _origin = [];
  List<OrdemProducaoModel> _filteredData = [];

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
    _origin = await ProducaoApi.listAll();
    _listener();
    _notifier.value = !_notifier.value;
  }

  void _listener() {
    final text = _controller.text.toLowerCase();
    setState(() {
      if (text.isEmpty) {
        _filteredData = List.from(_origin);
      } else {
        _filteredData = _origin.where((ordem) {
          final cliente = ordem.venda.cliente?.nome.toLowerCase() ?? '';
          final modelo = ordem.venda.modelo?.nome.toLowerCase() ?? '';
          final status = ordem.status.description.toLowerCase();
          return cliente.contains(text) ||
              modelo.contains(text) ||
              status.contains(text);
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
          title: 'Acompanhamento de Produção',
          subtitle: 'Monitore e atualize o status do preparo dos kits',
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
                          labelText: 'Buscar ordem de produção',
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
                      return ProducaoTable(
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
