import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/lancamentos/lancamentos.dart';
import 'package:tech_wall/src/api/pedidos_compra/pedidos_compra.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/lancamento.dart';
import 'package:tech_wall/src/models/pedido_compra.dart';
import 'package:tech_wall/src/routes/home/financeiro/components/dashboard.dart';
import 'package:tech_wall/src/routes/home/financeiro/components/invoices.dart';
import 'package:tech_wall/src/routes/home/financeiro/components/lancamentos.dart';
import 'package:tech_wall/src/routes/home/financeiro/components/pedidos_compra_table.dart';

class Finance extends StatefulWidget {
  const Finance({super.key});

  @override
  State<Finance> createState() => _FinanceState();
}

class _FinanceState extends State<Finance> with SingleTickerProviderStateMixin {
  static const double _tabHeight = 40;
  late TabController _tabController;
  final _notifier = ValueNotifier(false);

  // Estados para os dados
  List<LancamentoModel> _lancamentos = [];
  List<PedidoCompraModel> _pedidos = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 4,
      vsync: this,
    ); // Aumentado para 4 abas
    WidgetsBinding.instance.addPostFrameCallback((_) => _reloadData());
  }

  @override
  void dispose() {
    _tabController.dispose();
    _notifier.dispose();
    super.dispose();
  }

  Future<void> _reloadData() async {
    final responses = await Future.wait([
      LancamentosApi.listAll(),
      PedidosCompraApi.listAll(),
    ]);
    _lancamentos = responses[0] as List<LancamentoModel>;
    _pedidos = responses[1] as List<PedidoCompraModel>;
    _notifier.value = !_notifier.value;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(gapxxl).copyWith(top: 0),
        child: AppCard(
          title: 'Módulo Financeiro',
          subtitle:
              'Gerencie suas finanças, contas a pagar/receber e notas fiscais',
          content: Padding(
            padding: const EdgeInsets.only(top: gapsm),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              spacing: gapmd,
              children: [
                TabBar(
                  controller: _tabController,
                  tabs: [
                    Container(
                      height: _tabHeight,
                      alignment: Alignment.center,
                      child: const Text('Painel financeiro'),
                    ),
                    Container(
                      height: _tabHeight,
                      alignment: Alignment.center,
                      child: const Text('Lançamentos'),
                    ),
                    Container(
                      height: _tabHeight,
                      alignment: Alignment.center,
                      child: const Text('Pedidos de Compra'),
                    ), // Nova aba
                    Container(
                      height: _tabHeight,
                      alignment: Alignment.center,
                      child: const Text('Notas fiscais'),
                    ),
                  ],
                ),
                Expanded(
                  child: ListenableBuilder(
                    listenable: _notifier,
                    builder: (context, child) => TabBarView(
                      controller: _tabController,
                      children: [
                        FinanceDashboard(data: _lancamentos),
                        Lancamentos(
                          data: _lancamentos,
                          onDataChange: _reloadData,
                        ),
                        PedidosCompraTable(
                          data: _pedidos,
                          onDataChange: _reloadData,
                        ), // Nova tela na aba
                        Invoices(),
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
