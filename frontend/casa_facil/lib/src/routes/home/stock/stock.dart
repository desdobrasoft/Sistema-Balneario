import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show gapxxl, gapsm, gapmd;
import 'package:casa_facil/src/models/materiais_estoque.dart';
import 'package:casa_facil/src/routes/home/stock/components/dashboard.dart';
import 'package:casa_facil/src/routes/home/stock/components/table.dart';
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

  late TabController _tabController;

  List<MateriaisEstoque> _filteredData = [];
  // TODO: Terminar API de materiais de estoque.
  @override
  void initState() {
    super.initState();

    _controller.addListener(_listener);
    _tabController = TabController(length: 2, vsync: this);
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
                      alignment: Alignment.center,
                      height: _tabHeight,
                      child: Text('Painel'),
                    ),
                    Container(
                      alignment: Alignment.center,
                      height: _tabHeight,
                      child: Text('Estoque'),
                    ),
                  ],
                ),
                Flexible(
                  child: ListenableBuilder(
                    listenable: _tabController,
                    builder: (context, _) => switch (_tabController.index) {
                      0 => InventoryDashboard(data: []),
                      1 => Column(
                        children: [
                          TextField(
                            controller: _controller,
                            decoration: InputDecoration(
                              filled: true,
                              hintStyle: hintStyle(context),
                              hintText: 'Concreto',
                              labelText: 'Buscar item',
                              prefixIcon: Icon(Icons.search),
                            ),
                          ),
                          Flexible(child: InventoryTable(data: _filteredData)),
                        ],
                      ),
                      _ => InventoryDashboard(data: []),
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
        _filteredData = List.from([]);
      });
      return;
    }
    setState(() {
      _filteredData = List.from(
        [].where(
          (item) =>
              item.nome.toLowerCase().contains(text) ||
              item.unit.toLowerCase().contains(text) ||
              item.qtEstoque.toString().toLowerCase().contains(text) ||
              item.lowStockThreshold.toString().toLowerCase().contains(text),
        ),
      );
    });
  }
}
