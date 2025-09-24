import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/api/pedidos_compra/pedidos_compra.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/components/dialogs/materiais_estoque/add_material.dart';
import 'package:tech_wall/src/components/dialogs/materiais_estoque/add_movimentacao.dart';
import 'package:tech_wall/src/constants/constants.dart'
    show gapxxl, gapsm, gapmd, gaplg;
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/models/pedido_compra.dart';
import 'package:tech_wall/src/routes/home/estoque/components/dashboard.dart';
import 'package:tech_wall/src/routes/home/estoque/components/recebimento_table.dart';
import 'package:tech_wall/src/routes/home/estoque/components/table.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';

class Stock extends StatefulWidget {
  const Stock({super.key});

  @override
  State<Stock> createState() => _StockState();
}

class _StockState extends State<Stock> with SingleTickerProviderStateMixin {
  static const double _tabHeight = 40;

  final _controller = TextEditingController();
  final _notifier = ValueNotifier(false);
  late final TabController _tabController;

  List<MaterialEstoqueModel> _materiais = [];
  List<PedidoCompraModel> _pedidos = [];
  List<MaterialEstoqueModel> _filteredMateriais = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
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
    final responses = await Future.wait([
      MateriaisEstoqueApi.listAll(),
      PedidosCompraApi.listAll(),
    ]);
    _materiais = responses[0] as List<MaterialEstoqueModel>;
    _pedidos = responses[1] as List<PedidoCompraModel>;
    _listener();
    _notifier.value = !_notifier.value;
  }

  void _listener() {
    final text = _controller.text.toLowerCase();
    setState(() {
      if (text.isEmpty) {
        _filteredMateriais = List.from(_materiais);
      } else {
        _filteredMateriais = _materiais
            .where(
              (item) =>
                  item.item.toLowerCase().contains(text) ||
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
                    Container(
                      height: _tabHeight,
                      alignment: Alignment.center,
                      child: const Text('Recebimento'),
                    ),
                  ],
                ),
                Expanded(
                  child: ListenableBuilder(
                    listenable: _tabController,
                    builder: (context, _) => TabBarView(
                      controller: _tabController,
                      children: [
                        InventoryDashboard(data: _materiais),
                        Column(
                          children: [
                            Row(
                              spacing: gaplg,
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: _controller,
                                    decoration: InputDecoration(
                                      filled: true,
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
                                  icon: const Icon(
                                    Icons.compare_arrows_outlined,
                                  ),
                                ),
                              ],
                            ),
                            Expanded(
                              child: InventoryTable(
                                data: _filteredMateriais,
                                onDataChange: _reloadData,
                              ),
                            ),
                          ],
                        ),
                        RecebimentoTable(
                          data: _pedidos,
                          onDataChange: _reloadData,
                        ),
                      ],
                    ),
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
