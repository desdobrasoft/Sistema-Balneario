import 'package:casa_facil/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:casa_facil/src/components/app_button.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/components/dialogs/materiais_estoque/add_material.dart';
import 'package:casa_facil/src/components/dialogs/materiais_estoque/add_movimentacao.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show gapxxl, gapsm, gapmd, gaplg;
import 'package:casa_facil/src/models/materiais_estoque.dart';
import 'package:casa_facil/src/routes/home/estoque/components/dashboard.dart';
import 'package:casa_facil/src/routes/home/estoque/components/table.dart';
import 'package:casa_facil/src/services/dialog/dialog.dart';
import 'package:casa_facil/src/utils/hint_style.dart';
import 'package:flutter/material.dart';

class Stock extends StatefulWidget {
  const Stock({super.key});

  @override
  State<Stock> createState() => _StockState();
}

class _StockState extends State<Stock> with SingleTickerProviderStateMixin {
  static const double _tabHeight = 40;

  final _controller = TextEditingController();
  final _notifier = ValueNotifier(false);
  late TabController _tabController;

  List<MateriaisEstoque> _origin = [];
  List<MateriaisEstoque> _filteredData = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _controller.addListener(_listener);
    WidgetsBinding.instance.addPostFrameCallback((_) => _reloadData());
  }

  @override
  void dispose() {
    _controller.removeListener(_listener);
    _tabController.dispose();
    _notifier.dispose();
    super.dispose();
  }

  Future<void> _reloadData() async {
    _origin = await MateriaisEstoqueApi.listAll();
    _listener(); // Aplica o filtro atual aos novos dados
    _notifier.value = !_notifier.value; // Notifica a tabela para reconstruir
  }

  void _listener() {
    final text = _controller.text.toLowerCase();
    setState(() {
      if (text.isEmpty) {
        _filteredData = List.from(_origin);
      } else {
        _filteredData = _origin
            .where(
              (item) =>
                  item.nome.toLowerCase().contains(text) ||
                  item.id.toLowerCase().contains(text),
            )
            .toList();
      }
    });
  }

  Future<void> _addMaterial() async {
    final success = await DialogService.instance.showDialog(
      const AddMaterial(),
    );
    if (success == true) _reloadData();
  }

  Future<void> _registerMovement() async {
    final success = await DialogService.instance.showDialog(
      const AddMovimentacaoDialog(),
    );
    if (success == true) _reloadData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(gapxxl).copyWith(top: 0),
        child: AppCard(
          title: 'Gerenciamento de Estoque',
          subtitle: 'Monitore e gerencie os níveis de materiais da sua empresa',
          content: Padding(
            padding: const EdgeInsets.only(top: gapsm),
            child: Column(
              spacing: gapmd,
              children: [
                TabBar(
                  controller: _tabController,
                  tabs: [
                    Container(
                      height: _tabHeight,
                      alignment: Alignment.center,
                      child: const Text('Painel'),
                    ),
                    Container(
                      height: _tabHeight,
                      alignment: Alignment.center,
                      child: const Text('Estoque'),
                    ),
                  ],
                ),
                Expanded(
                  child: ListenableBuilder(
                    listenable: _tabController,
                    builder: (context, _) {
                      if (_tabController.index == 0) {
                        return InventoryDashboard(data: _origin);
                      }
                      return Column(
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
                                    hintText: 'Buscar por ID ou Nome...',
                                    labelText: 'Buscar item',
                                    prefixIcon: const Icon(Icons.search),
                                  ),
                                ),
                              ),
                              AppButton(
                                label: 'Adicionar Material',
                                onPressed: _addMaterial,
                                icon: const Icon(Icons.add_box_outlined),
                              ),
                              AppButton(
                                label: 'Registrar Movimentação',
                                onPressed: _registerMovement,
                                icon: const Icon(Icons.compare_arrows_outlined),
                              ),
                            ],
                          ),
                          Expanded(
                            child: ListenableBuilder(
                              listenable: _notifier,
                              builder: (context, _) => InventoryTable(
                                data: _filteredData,
                                onDataChange: _reloadData,
                              ),
                            ),
                          ),
                        ],
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
